import React, { useState, useEffect } from 'react';

// 圖示元件
const PlusCircle = ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
const Save = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const SearchIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

const API_URL = "https://script.google.com/macros/s/AKfycbyoFAj2LOamK4ISy2g9y6wforgHuvdqXdTdpeHjC7wPKG_ipOoRUE_ua1TLt-pvrhyf/exec";
const STAFF_LIST = ["宏銘", "庭榆", "芝芝", "靖璇", "雅文", "美珠", "彤甄", "詠婷"];

function App() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbData, setDbData] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const initialForm = {
    date: new Date().toISOString().split('T')[0],
    reportType: '新成交 (首次收訂/全額)',
    salesRep: '',
    towerId: '', 
    productType: '個人塔位',
    buyerName: '',
    userName: '',
    actualPrice: '',
    receivedAmount: '',
    installDate: '',
    source: '自行前來',
    referrer: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    try {
      const res = await fetch(`${API_URL}?adminKey=012820`);
      const json = await res.json();
      if (json.data) setDbData(json.data);
    } catch (e) { console.error("獲取失敗"); }
  };

  const handleSelectRecord = (record: any) => {
    setFormData({
      ...formData,
      reportType: '補收尾款/續收',
      towerId: record.towerId || "",
      productType: record.productType || "個人塔位",
      buyerName: record.buyerName || "",
      userName: record.userName || "",
      actualPrice: record.actualPrice || "",
      source: record.source || "自行前來",
      referrer: record.referrer || "",
      notes: `續收自前單: ${record.date || ""}`
    });
    setShowResults(false);
    setSearchQuery("");
  };

  // ==========================================
  // 核心 handleSubmit：包含自動分月與對帳 ID
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. 【核心優化】：自動抓取月份作為結帳標籤 (YYYY-MM)
      const yearMonth = formData.date.substring(0, 7); 
      
      // 2. 【核心優化】：產生唯一對帳 ID，解決預定轉正式對不上帳的問題
      const matchId = `${formData.towerId.trim()}_${formData.buyerName.trim()}`;

      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ 
          ...formData, 
          accountingMonth: yearMonth, 
          matchId: matchId 
        })
      });

      alert(`🎉 報單成功！本筆已自動歸類至 ${yearMonth} 帳目`);
      setFormData(initialForm);
      refreshData(); 
    } catch (e) { 
      alert("傳送失敗，請檢查網路連線"); 
    }
    setLoading(false);
  };

  const filteredData = dbData.filter(r => 
    (r.towerId && r.towerId.toString().includes(searchQuery)) || 
    (r.buyerName && r.buyerName.includes(searchQuery)) || 
    (r.userName && r.userName.includes(searchQuery))
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 pb-10 px-4">
      <header className="max-w-md mx-auto py-4 flex justify-between items-center border-b mb-4">
        <div>
          <h1 className="text-xl font-bold text-amber-600">法華山永報系統</h1>
          <p className="text-[10px] text-stone-400 font-medium">VERSION 7.0 | 智慧分月勾稽版</p>
        </div>
        <button onClick={() => {setFormData(initialForm); refreshData();}} className="p-2 bg-white rounded-full shadow-sm text-stone-400">
            <PlusCircle />
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {/* 🔍 搜尋區 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-amber-100 relative">
          <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
            <SearchIcon /> 快速帶入舊單 (輸入塔位/人名)
          </div>
          <input 
            className="w-full p-2 border rounded-lg bg-stone-50"
            value={searchQuery}
            onChange={(e) => {setSearchQuery(e.target.value); setShowResults(true);}}
            placeholder="搜尋預定客戶資料..."
          />
          {showResults && searchQuery && filteredData.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-xl z-50 divide-y">
              {filteredData.map((r, i) => (
                <div key={i} onClick={() => handleSelectRecord(r)} className="p-3 active:bg-amber-50 cursor-pointer">
                  <p className="font-bold text-sm">{r.towerId} - {r.buyerName}</p>
                  <p className="text-[10px] text-stone-400">成交日: {r.date} | 產品: {r.productType}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📋 完整表單 */}
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
             <h2 className="font-bold text-stone-700">📋 成交回報詳細內容</h2>
             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${formData.reportType.includes('補收') ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                {formData.reportType}
             </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-stone-400 ml-1">收款/成交日</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-stone-400 ml-1">收款人員</label>
              <select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="w-full p-2 border rounded-lg text-sm bg-stone-50">
                <option value="">選擇姓名</option>
                {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-stone-400 ml-1">產品類型</label>
              <select value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                <option value="個人塔位">個人塔位</option>
                <option value="雙人/夫妻塔位">雙人/夫妻塔位</option>
                <option value="家族型塔位">家族型塔位</option>
                <option value="祖先牌位">祖先牌位</option>
                <option value="壽位">壽位</option>
                <option value="其他服務">其他服務</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-stone-400 ml-1">客戶來源</label>
              <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                <option value="自行前來">自行前來</option>
                <option value="同業/禮儀公司介紹">同業介紹</option>
                <option value="舊客介紹">舊客介紹</option>
                <option value="開發件">開發件</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="塔位編號 *" required value={formData.towerId} onChange={e => setFormData({...formData, towerId: e.target.value})} className="p-2 border rounded-lg text-sm font-medium" />
            <input type="text" placeholder="權利人姓名 *" required value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="p-2 border rounded-lg text-sm font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="使用人(往生者)" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} className="p-2 border rounded-lg text-sm" />
            <input type="text" placeholder="介紹人/單位" value={formData.referrer} onChange={e => setFormData({...formData, referrer: e.target.value})} className="p-2 border rounded-lg text-sm" />
          </div>

          {formData.productType !== "壽位" && (
            <div>
              <label className="text-[10px] text-amber-600 font-bold ml-1">預計進塔日期 (自動分流排程)</label>
              <input type="date" value={formData.installDate} onChange={e => setFormData({...formData, installDate: e.target.value})} className="w-full p-2 border border-amber-200 rounded-lg text-sm bg-amber-50" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-red-500 font-bold ml-1">實際成交總價</label>
              <input type="number" required value={formData.actualPrice} onChange={e => setFormData({...formData, actualPrice: e.target.value})} className="w-full p-2 border rounded-lg bg-red-50 font-bold" />
            </div>
            <div>
              <label className="text-[10px] text-green-600 font-bold ml-1">本次實收金額</label>
              <input type="number" required value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="w-full p-2 border rounded-lg bg-green-50 font-bold" />
            </div>
          </div>

          <textarea placeholder="備註 (續收請在此註明)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded-lg text-sm h-16" />

          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl flex justify-center items-center gap-2 active:scale-95 transition-all">
            {loading ? "連線中..." : <><Save /> 提交完整報表</>}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
