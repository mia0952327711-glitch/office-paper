import React, { useState, useEffect } from 'react';
import { PlusCircle, LayoutDashboard, Save, Loader2, Lock, LogIn } from 'lucide-react';

// ------------------------------------------------------------------
// 1. 設定區域
// ------------------------------------------------------------------
// 這是您最新的 Google Apps Script 網址
const API_URL = "https://script.google.com/macros/s/AKfycbyoFAj2LOamK4ISy2g9y6wforgHuvdqXdTdpeHjC7wPKG_ipOoRUE_ua1TLt-pvrhyf/exec";

// 設定管理員密碼 (查看報表用)
const ADMIN_PASSWORD = "012820"; 

// ------------------------------------------------------------------
// 2. 主程式開始
// ------------------------------------------------------------------
function App() {
  const [view, setView] = useState<'form' | 'dashboard' | 'login'>('form');
  const [loading, setLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // 統計數據狀態
  const [stats, setStats] = useState({
    totalSales: 0,
    totalReceived: 0,
    balance: 0,
    count: 0,
    recent: [] as any[]
  });

  // 表單資料狀態
  const initialForm = {
    date: new Date().toISOString().split('T')[0],
    salesRep: '',
    productType: '個人塔位',
    buyerName: '',
    actualPrice: '',
    receivedAmount: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // ----------------------------------------------------------------
  // 功能：提交表單 (傳送資料到 Google Sheets)
  // ----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 準備要傳送的資料
      const payload = {
        ...formData,
        id: crypto.randomUUID(),
        reportType: '新成交',
        balanceAmount: (Number(formData.actualPrice) - Number(formData.receivedAmount)).toString(),
        timestamp: new Date().toISOString()
      };

      // 使用 fetch POST 傳送
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert("🎉 報表提交成功！資料已存入雲端。");
      setFormData(initialForm); // 清空表單

    } catch (error) {
      console.error(error);
      alert("提交失敗，請檢查網路連線。");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // 功能：抓取儀表板資料 (從 Google Sheets 讀取)
  // ----------------------------------------------------------------
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 加上密碼參數
      const response = await fetch(`${API_URL}?adminKey=${passwordInput}`);
      const json = await response.json();
      
      if (json.status === 'success' && json.data) {
        const rows = json.data;
        let sales = 0;
        let received = 0;
        
        rows.forEach((row: any) => {
          sales += Number(row.actualPrice) || 0;
          received += Number(row.receivedAmount) || 0;
        });

        setStats({
          totalSales: sales,
          totalReceived: received,
          balance: sales - received,
          count: rows.length,
          recent: rows.slice(-5).reverse()
        });
        
        setView('dashboard'); 
      } else {
         setErrorMsg("讀取失敗或是密碼錯誤");
      }
    } catch (error) {
      console.error(error);
      alert("無法讀取數據，請確認後端部署版本是否更新。");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // 功能：驗證密碼
  // ----------------------------------------------------------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setErrorMsg("");
      fetchDashboardData(); 
    } else {
      setErrorMsg("密碼錯誤");
    }
  };

  // ----------------------------------------------------------------
  // 3. 畫面渲染 (UI)
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800">
      
      {/* 頂部導航列 */}
      <header className="bg-stone-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-amber-500">法華山瑤池陵宮</h1>
            <p className="text-xs text-stone-400">每日成交回報系統</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('form')}
              className={`p-2 rounded-full transition ${view === 'form' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400'}`}
            >
              <PlusCircle size={20} />
            </button>
            <button 
              onClick={() => setView(view === 'dashboard' ? 'dashboard' : 'login')}
              className={`p-2 rounded-full transition ${view !== 'form' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400'}`}
            >
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 pb-20">
        
        {/* === 1. 新增表單畫面 === */}
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-100">
              <h2 className="font-bold text-amber-800 flex items-center gap-2">
                <PlusCircle size={18} /> 新增成交回報
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">成交日期</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">業務員姓名</label>
                  <select 
                    required
                    value={formData.salesRep}
                    onChange={e => setFormData({...formData, salesRep: e.target.value})}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">請選擇</option>
                    <option value="測試員">測試員</option>
                    <option value="林小美">林小美</option>
                    <option value="張大山">張大山</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">產品類型</label>
                <select 
                  value={formData.productType}
                  onChange={e => setFormData({...formData, productType: e.target.value})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="個人塔位">個人塔位</option>
                  <option value="雙人塔位">雙人塔位</option>
                  <option value="家族座">家族座</option>
                  <option value="牌位">牌位</option>
                  <option value="功德燈">功德燈</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">權利人/買方姓名</label>
                <input 
                  type="text" 
                  required
                  placeholder="例如：王大明"
                  value={formData.buyerName}
                  onChange={e => setFormData({...formData, buyerName: e.target.value})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-stone-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">成交總金額 (Actual Price)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-400">$</span>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.actualPrice}
                      onChange={e => setFormData({...formData, actualPrice: e.target.value})}
                      className="w-full pl-7 p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">今日實收 (Received)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-400">$</span>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.receivedAmount}
                      onChange={e => setFormData({...formData, receivedAmount: e.target.value})}
                      className="w-full pl-7 p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">備註 (選填)</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-md active:scale-95 transition flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {loading ? '傳送中...' : '提交報表'}
              </button>
            </div>
          </form>
        )}

        {/* === 2. 登入畫面 === */}
        {view === 'login' && (
          <div className="flex flex-col items-center justify-center pt-20 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
              <div className="bg-amber-100 p-4 rounded-full inline-block mb-4">
                <Lock size={32} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">管理員權限</h3>
              <p className="text-stone-500 text-sm mb-6">請輸入通行碼以查看業績報表</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password" 
                  placeholder="輸入密碼"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full text-center p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-lg tracking-widest"
                />
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                
                <button 
                  type="submit"
                  disabled={loading} 
                  className="w-full bg-stone-800 text-white py-3 rounded-xl font-medium flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
                  驗證登入
                </button>
              </form>
            </div>
          </div>
        )}

        {/* === 3. 儀表板畫面 === */}
        {view === 'dashboard' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-bold text-xl text-stone-800 px-1">業績總覽</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500">
                <p className="text-xs text-stone-500 mb-1">總成交金額</p>
                <p className="text-2xl font-bold text-stone-800">${stats.totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500">
                <p className="text-xs text-stone-500 mb-1">實收金額</p>
                <p className="text-2xl font-bold text-stone-800">${stats.totalReceived.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                <p className="text-xs text-stone-500 mb-1">待收尾款</p>
                <p className="text-2xl font-bold text-stone-800">${stats.balance.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
              <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                <h3 className="font-bold text-stone-700">最新 {stats.recent.length} 筆紀錄</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="p-3">日期</th>
                      <th className="p-3">業務</th>
                      <th className="p-3">產品</th>
                      <th className="p-3 text-right">成交價</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {stats.recent.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 text-stone-600">{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                        <td className="p-3 font-medium">{row.salesRep}</td>
                        <td className="p-3 text-stone-500">{row.productType}</td>
                        <td className="p-3 text-right font-mono">${Number(row.actualPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center mt-8">
               <button 
                 onClick={() => setView('form')}
                 className="text-stone-400 text-sm hover:text-amber-600 underline"
               >
                 返回填寫表單
               </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
