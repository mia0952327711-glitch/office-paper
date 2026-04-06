import React, { useState } from 'react';

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
    listPrice: '', // 💡 定價
    actualPrice: '',
    receivedAmount: '',
    installDate: '',
    source: '自行前來',
    referrer: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const handleSearchClick = async () => {
    if (!searchQuery) return;
    setSearching(true);
    setShowResults(true);
    try {
      const res = await fetch(`${API_URL}?adminKey=012820&t=${Date.now()}`);
      const json = await res.json();
      if (json && json.data) setDbData(json.data);
    } catch (e) { console.error("搜尋異常"); }
    setSearching(false);
  };

  const handleSelectRecord = (record: any) => {
    if (!record) return;
    setFormData({
      ...formData,
      reportType: '補收尾款/續收',
      towerId: record.towerId || "",
      productType: record.productType || "個人塔位",
      buyerName: record.buyerName || "",
      userName: record.userName || "",
      listPrice: record.listPrice || "", // 💡 自動帶入定價
      actualPrice: record.actualPrice || "",
      source: record.source || "自行前來",
      referrer: record.referrer || "",
      notes: `續收自[${record.fromSheet}]: ${record.date} (前次已收: ${record.receivedAmount || 0})`
    });
    setShowResults(false);
    setSearchQuery("");
  };

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
        body: JSON.stringify({ ...formData, accountingMonth: yearMonth, matchId: matchId })
      });
      alert(`🎉 提交成功！`);
      setFormData(initialForm);
    } catch (e) { alert("提交失敗"); }
    setLoading(false);
  };

  const filteredData = (dbData || []).filter(r => {
    const q = searchQuery.toLowerCase();
    return String(r.towerId || "").toLowerCase().includes(q) || String(r.buyerName || "").toLowerCase().includes(q);
  }).slice(0, 10);

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 pb-10 px-4">
      <header className="max-w-md mx-auto py-4 flex justify-between items-center border-b mb-4">
        <h1 className="text-xl font-bold text-amber-600">法華山訂單回報系統</h1>
        <button onClick={() => window.location.reload()} className="text-[10px] bg-white px-2 py-1 rounded shadow">重新整理</button>
      </header>

      <main className="max-w-md mx-auto space-y-4 text-left">
        {/* 🔍 搜尋區 */}
        <div className="bg-amber-50 p-4 rounded-2xl shadow-sm border-2 border-amber-200">
          <label className="block text-xs font-bold text-amber-700 mb-2">快速查找 (塔位/姓名/使用人)</label>
          <div className="flex gap-2">
            <input type="text" className="flex-1 p-2 border rounded-lg" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="輸入關鍵字..." />
            <button type="button" onClick={handleSearchClick} className="bg-amber-600 text-white px-4 rounded-lg font-bold">搜尋</button>
          </div>
          {showResults && searchQuery && (
            <div className="mt-2 bg-white rounded-lg shadow-inner max-h-60 overflow-y-auto">
              {searching ? <div className="p-3 text-center text-stone-400 italic">讀取中...</div> : 
                filteredData.map((r, i) => (
                  <div key={i} onClick={() => handleSelectRecord(r)} className="p-3 border-b active:bg-amber-100 cursor-pointer">
                    <p className="font-bold text-sm">{r.towerId} - {r.buyerName}</p>
                    <p className="text-[10px] text-stone-500">已收: {r.receivedAmount} | 定價: {r.listPrice}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* 📋 報單表單 */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">成交日期</label><input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 border rounded-lg text-sm" /></div>
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">收款人員</label><select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="p-2 border rounded-lg text-sm">{STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">塔位編號</label><input type="text" required value={formData.towerId} onChange={e => setFormData({...formData, towerId: e.target.value})} className="p-2 border rounded-lg text-sm" /></div>
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">產品類型</label><select value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} className="p-2 border rounded-lg text-sm"><option value="個人塔位">個人塔位</option><option value="雙人塔位">雙人塔位</option><option value="家族型">家族型</option><option value="牌位">牌位</option><option value="壽位">壽位</option></select></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">權利人姓名</label><input type="text" required value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="p-2 border rounded-lg text-sm font-bold" /></div>
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">使用人</label><input type="text" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} className="p-2 border rounded-lg text-sm" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">預計進塔日</label><input type="date" value={formData.installDate} onChange={e => setFormData({...formData, installDate: e.target.value})} className="p-2 border rounded-lg text-sm" /></div>
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">介紹人</label><input type="text" value={formData.referrer} onChange={e => setFormData({...formData, referrer: e.target.value})} className="p-2 border rounded-lg text-sm" /></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col"><label className="text-[10px] text-stone-400">定價</label><input type="number" value={formData.listPrice} onChange={e => setFormData({...formData, listPrice: e.target.value})} className="p-2 border rounded-lg bg-stone-50 text-sm" /></div>
            <div className="flex flex-col"><label className="text-[10px] text-red-400">成交總價</label><input type="number" required value={formData.actualPrice} onChange={e => setFormData({...formData, actualPrice: e.target.value})} className="p-2 border rounded-lg bg-red-50 text-sm font-bold" /></div>
            <div className="flex flex-col"><label className="text-[10px] text-green-500">本次實收</label><input type="number" required value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="p-2 border-2 border-green-200 rounded-lg bg-green-50 text-sm font-bold" /></div>
          </div>

          <div className="flex flex-col"><label className="text-[10px] text-stone-400">備註</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded-lg text-sm h-16 bg-stone-50" /></div>

          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold shadow-lg">
            {loading ? "處理中..." : "確認提交報單"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
