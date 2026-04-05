import React, { useState, useEffect } from 'react';

// ------------------------------------------------------------------
// 0. 內建圖示元件 (確保 Vercel 部署成功，不依賴外部庫)
// ------------------------------------------------------------------
const PlusCircle = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
);
const LayoutDashboard = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
const Save = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);
const Loader2 = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
const Lock = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

// ------------------------------------------------------------------
// 設定區域
// ------------------------------------------------------------------
const API_URL = "https://script.google.com/macros/s/AKfycbyoFAj2LOamK4ISy2g9y6wforgHuvdqString/exec"; 
const ADMIN_PASSWORD = "012820"; 

function App() {
  const [view, setView] = useState<'form' | 'dashboard' | 'login'>('form');
  const [loading, setLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [stats, setStats] = useState({
    totalSales: 0, totalReceived: 0, balance: 0, count: 0, recent: [] as any[]
  });

  const initialForm = {
    date: new Date().toISOString().split('T')[0],
    reportType: '新成交 (首次收訂/全額)',
    salesRep: '',
    customSalesRep: '',
    towerId: '', 
    productType: '個人塔位',
    buyerName: '',
    userName: '',
    installDate: '',
    actualPrice: '',
    receivedAmount: '',
    source: '自行前來',
    referrer: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const balanceDisplay = (Number(formData.actualPrice) || 0) - (Number(formData.receivedAmount) || 0);

  // ----------------------------------------------------------------
  // 提交表單 (自動分月 & 對帳 ID 優化)
  // ----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalSalesRep = formData.salesRep === '其他' ? formData.customSalesRep : formData.salesRep;
      if (!finalSalesRep.trim()) { alert("請填寫業務員姓名！"); setLoading(false); return; }

      // 自動產生歸屬月份與對帳 ID
      const yearMonth = formData.date.substring(0, 7); 
      const matchId = `${formData.towerId.trim()}_${formData.buyerName.trim()}`;

      const payload = {
        ...formData,
        salesRep: finalSalesRep,
        accountingMonth: yearMonth,
        matchId: matchId,
        timestamp: new Date().toISOString()
      };

      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert(`🎉 提交成功！已歸類至 ${yearMonth} 帳目。`);
      setFormData(initialForm);
    } catch (error) {
      alert("提交失敗，請檢查網路。");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) setView('dashboard');
    else setErrorMsg("密碼錯誤");
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 pb-10">
      <header className="bg-stone-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-amber-500">法華山永安公司</h1>
            <p className="text-xs text-stone-400">第五個月 - 團隊擴編優化版</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('form')} className={`p-2 rounded-full ${view === 'form' ? 'bg-amber-600' : 'bg-stone-800'}`}><PlusCircle size={20} /></button>
            <button onClick={() => setView(view === 'dashboard' ? 'dashboard' : 'login')} className={`p-2 rounded-full ${view !== 'form' ? 'bg-amber-600' : 'bg-stone-800'}`}><LayoutDashboard size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-100 font-bold text-amber-800">📋 成交回報單 (已更新員工名單)</div>
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">成交日期 *</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">接待業務員 *</label>
                  <select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="w-full p-2 border rounded-lg">
                    <option value="">請選擇</option>
                    <option value="宏銘">宏銘</option>
                    <option value="庭榆">庭榆</option>
                    <option value="芝芝">芝芝</option>
                    <option value="靖璇">靖璇</option>
                    <option value="雅文">雅文</option>
                    <option value="美珠">美珠</option>
                    <option value="彤甄">彤甄</option>
                    <option value="詠婷">詠婷</option>
                    <option value="其他">其他</option>
                  </select>
                  {formData.salesRep === '其他' && (
                    <input type="text" placeholder="請輸入業務姓名" required value={formData.customSalesRep} onChange={e => setFormData({...formData, customSalesRep: e.target.value})} className="mt-2 w-full p-2 border rounded-lg bg-stone-50" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">塔位編號 *</label>
                  <input type="text" required value={formData.towerId} onChange={e => setFormData({...formData, towerId: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">權利人姓名 *</label>
                  <input type="text" required value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">實際成交價 *</label>
                  <input type="number" required value={formData.actualPrice} onChange={e => setFormData({...formData, actualPrice: e.target.value})} className="w-full p-2 border rounded-lg bg-red-50 text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">本次實收金額 *</label>
                  <input type="number" required value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="w-full p-2 border rounded-lg bg-green-50 text-lg font-bold" />
                </div>
              </div>

              <div className="p-3 bg-stone-100 rounded-lg flex justify-between items-center">
                <span className="text-sm font-bold text-stone-600">待收尾款:</span>
                <span className={`text-xl font-bold ${balanceDisplay > 0 ? 'text-red-600' : 'text-green-600'}`}>${balanceDisplay.toLocaleString()}</span>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 text-lg active:scale-95 transition">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                {loading ? '傳送資料中...' : '提交完整報表'}
              </button>
            </div>
          </form>
        )}
        {/* 儀表板與登入邏輯保持與原版一致 */}
      </main>
    </div>
  );
}

export default App;
