import React, { useState } from 'react';

// API 網址與業務清單
const API_URL = "https://script.google.com/macros/s/AKfycbyoFAj2LOamK4ISy2g9y6wforgHuvdqXdTdpeHjC7wPKG_ipOoRUE_ua1TLt-pvrhyf/exec";
const STAFF_LIST = ["宏銘", "庭榆", "芝芝", "靖璇", "雅文", "美珠", "彤甄", "詠婷"];

function App() {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
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

  // --- 搜尋功能：從 GAS 抓取資料 (包含日報表與預定清單) ---
  const handleSearchClick = async () => {
    if (!searchQuery) return;
    setSearching(true);
    setShowResults(true);
    try {
      // 增加隨機參數避免快取，adminKey 需與 GAS 一致
      const res = await fetch(`${API_URL}?adminKey=012820&t=${Date.now()}`);
      const json = await res.json();
      if (json && json.data) {
        setDbData(json.data);
      } else {
        setDbData([]);
      }
    } catch (e) {
      console.error("搜尋連線異常");
      setDbData([]);
    }
    setSearching(false);
  };

  // --- 點擊搜尋結果：自動帶入表單 ---
  const handleSelectRecord = (record: any) => {
    if (!record) return;
    setFormData({
      ...formData,
      reportType: '補收尾款/續收',
      towerId: record.towerId ? String(record.towerId) : "",
      productType: record.productType || "個人塔位",
      buyerName: record.buyerName || "",
      userName: record.userName || "",
      actualPrice: record.actualPrice || "",
      source: record.source || "自行前來",
      referrer: record.referrer || "",
      notes: `續收自[${record.fromSheet}]: ${record.date || ""}`
    });
    setShowResults(false);
    setSearchQuery("");
  };

  // --- 提交報單：包含自動分月與對帳 ID ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const yearMonth = formData.date.substring(0, 7); 
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

      alert(`🎉 報單成功！本筆已自動歸類至 ${yearMonth}`);
      setFormData(initialForm);
    } catch (e) { 
      alert("提交失敗，請檢查網路連線"); 
    }
    setLoading(false);
  };

  // --- 您指定的完整版 filteredData 邏輯 ---
  const filteredData = (dbData || []).filter(r => {
    if (!r || !searchQuery) return false;
    const q = searchQuery.toLowerCase();
    // 同時搜尋：塔位編號、權利人、或是使用人
    return (
      (r.towerId && String(r.towerId).toLowerCase().includes(q)) || 
      (r.buyerName && String(r.buyerName).toLowerCase().includes(q)) ||
      (r.userName && String(r.userName).toLowerCase().includes(q))
    );
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 pb-10 px-4">
      <header className="max-w-md mx-auto py-4 flex justify-between items-center border-b mb-4">
        <div>
          <h1 className="text-xl font-bold text-amber-600">法華山訂單回報系統</h1>
          <p className="text-[10px] text-stone-400 font-medium">Order System v7.8 - FULL</p>
        </div>
        <button type="button" onClick={() => window.location.reload()} className="text-[10px] bg-white px-2 py-1 rounded shadow active:bg-stone-200">重新整理</button>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        
        {/* === 🔍 搜尋區 (搜尋日報表 + 預定清單) === */}
        <div className="bg-amber-50 p-4 rounded-2xl shadow-sm border-2 border-amber-200">
          <label className="block text-xs font-bold text-amber-700 mb-2">快速查找舊單（跨分頁搜尋）</label>
          <div className="flex gap-2">
            <input 
              type="text"
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSearchClick(); } }}
              placeholder="塔位、姓名或使用人..."
            />
            <button 
              type="button"
              onClick={handleSearchClick}
              className="bg-amber-600 text-white px-4 rounded-lg font-bold active:bg-amber-700"
            >
              {searching ? "..." : "搜尋"}
            </button>
          </div>
          
          {showResults && (
            <div className="mt-2 bg-white rounded-lg shadow-inner overflow-hidden border border-amber-100">
              {searching ? (
                <div className="p-3 text-center text-stone-400 text-sm italic animate-pulse">正在讀取雲端資料庫...</div>
              ) : filteredData.length > 0 ? (
                filteredData.map((r, i) => (
                  <div key={i} onClick={() => handleSelectRecord(r)} className="p-3 border-b last:border-0 active:bg-amber-100 cursor-pointer">
                    <p className="font-bold text-sm text-stone-700">{r.towerId} - {r.buyerName}</p>
                    <p className="text-[10px] text-stone-400">來源: [{r.fromSheet}] | 日期: {r.date} | 使用人: {r.userName || "無"}</p>
                  </div>
                ))
              ) : (
                searchQuery && !searching && <div className="p-3 text-center text-xs text-stone-400">找不到資料，請確認後再搜一次</div>
              )}
            </div>
          )}
        </div>

        {/* === 📋 報單表單 === */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4 border border-stone-200">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-bold text-stone-700 text-sm">📋 報單詳細資訊</h2>
            <span className="text-[10px] font-bold text-amber-600 px-2 bg-amber-50 rounded-full">{formData.reportType}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] text-stone-400 ml-1">成交日期</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 border rounded-lg text-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-stone-400 ml-1">收款人員</label>
              <select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="p-2 border rounded-lg text-sm bg-stone-50">
                <option value="">選擇人員</option>
                {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="塔位編號 *" required value={formData.towerId} onChange={e => setFormData({...formData, towerId: e.target.value})} className="p-2 border rounded-lg text-sm font-medium" />
            <input type="text" placeholder="權利人姓名 *" required value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="p-2 border rounded-lg text-sm font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="使用人(往生者)" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} className="p-2 border rounded-lg text-sm" />
            <input type="text" placeholder="介紹人/介紹單位" value={formData.referrer} onChange={e => setFormData({...formData, referrer: e.target.value})} className="p-2 border rounded-lg text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] text-red-400 ml-1">總價</label>
              <input type="number" required value={formData.actualPrice} onChange={e => setFormData({...formData, actualPrice: e.target.value})} className="p-2 border rounded-lg bg-red-50 text-sm font-bold" />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-green-500 ml-1">本次實收</label>
              <input type="number" required value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="p-2 border rounded-lg bg-green-50 text-sm font-bold" />
            </div>
          </div>

          <textarea placeholder="備註" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded-lg text-sm h-16 bg-stone-50" />

          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform">
            {loading ? "正在處理中..." : "確認提交報單"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
