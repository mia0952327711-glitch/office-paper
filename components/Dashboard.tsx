import React, { useState, useMemo } from 'react';
import { SalesRecord, ReportType } from '../types';
import { analyzeSalesData } from '../services/geminiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  records: SalesRecord[];
  onNewRecord: () => void;
}

const COLORS = ['#d97706', '#b45309', '#78350f', '#f59e0b', '#fbbf24', '#4b5563'];

const Dashboard: React.FC<DashboardProps> = ({ records, onNewRecord }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter only New Sales for performance metrics usually
  const newSales = records.filter(r => r.reportType === ReportType.NEW_SALE);

  // --- Metrics ---
  const totalRevenue = useMemo(() => 
    records.reduce((sum, r) => sum + r.actualPrice, 0), [records]);
  
  const totalReceived = useMemo(() => 
    records.reduce((sum, r) => sum + r.receivedAmount, 0), [records]);

  const pendingBalance = useMemo(() => 
    records.reduce((sum, r) => sum + r.balanceAmount, 0), [records]);

  // --- Chart Data Preparation ---
  const salesByRep = useMemo(() => {
    const map = new Map<string, number>();
    newSales.forEach(r => {
      const current = map.get(r.salesRep) || 0;
      map.set(r.salesRep, current + r.actualPrice);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [newSales]);

  const salesByProduct = useMemo(() => {
    const map = new Map<string, number>();
    newSales.forEach(r => {
      const current = map.get(r.productType) || 0;
      map.set(r.productType, current + 1); // Count by volume
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [newSales]);

  const handleAnalyze = async () => {
    if (records.length === 0) {
      setAiAnalysis("尚無資料可供分析。");
      return;
    }
    setIsAnalyzing(true);
    setAiAnalysis("正在讀取資料並進行 AI 分析中...");
    try {
      const result = await analyzeSalesData(records);
      setAiAnalysis(result);
    } catch (e) {
      setAiAnalysis("分析失敗");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-amber-600">
          <p className="text-sm text-stone-500 font-medium">總成交金額 (Actual)</p>
          <p className="text-3xl font-bold text-stone-800 mt-2">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-green-600">
          <p className="text-sm text-stone-500 font-medium">實收金額 (Received)</p>
          <p className="text-3xl font-bold text-stone-800 mt-2">${totalReceived.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-red-600">
          <p className="text-sm text-stone-500 font-medium">待收尾款 (Balance)</p>
          <p className="text-3xl font-bold text-stone-800 mt-2">${pendingBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h3 className="text-lg font-bold text-stone-800 mb-6">業務員業績排行 (新成交)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByRep}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: '#4b5563'}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `$${value/10000}萬`} tick={{fill: '#4b5563'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Records List */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-800">近期回報紀錄</h3>
              <button onClick={onNewRecord} className="text-sm text-amber-700 hover:text-amber-900 font-medium">
                + 新增回報
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">業務</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">產品</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">客戶</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">成交價</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider">狀態</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                        目前尚無資料，請點擊新增回報。
                      </td>
                    </tr>
                  ) : (
                    records.slice().reverse().slice(0, 5).map((record) => (
                      <tr key={record.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{record.salesRep}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{record.productType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{record.buyerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-stone-900">${record.actualPrice.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.reportType === ReportType.NEW_SALE ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {record.reportType === ReportType.NEW_SALE ? '新約' : '尾款'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Pie Chart & AI */}
        <div className="space-y-8">
           {/* Pie Chart */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h3 className="text-lg font-bold text-stone-800 mb-6">產品銷售佔比 (件數)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByProduct}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {salesByProduct.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Gemini 智慧分析
            </h3>

            <div className="min-h-[150px] text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
              {aiAnalysis ? aiAnalysis : "點擊下方按鈕，讓 AI 為您分析今日/近期的銷售數據趨勢。"}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || records.length === 0}
              className={`mt-6 w-full py-2 px-4 rounded-md font-medium transition-all flex items-center justify-center ${
                isAnalyzing 
                ? 'bg-stone-600 cursor-wait' 
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/50'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  分析中...
                </>
              ) : (
                '開始分析報表'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
