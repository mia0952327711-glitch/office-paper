import React, { useState, useEffect } from 'react';

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

  // 下載最新資料供搜尋
  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setDbData(json.data);
    } catch (e) { console.error("無法獲取資料"); }
    setLoading(false);
  };

  // 帶入舊單資料
  const handleSelectRecord = (record: any) => {
    setFormData({
      ...initialForm,
      reportType: '補收尾款/續收',
      towerId: record.towerId,
      productType: record.productType,
      buyerName: record.buyerName,
      userName: record.userName,
      actualPrice: record.actualPrice,
      source: record.source,
      referrer: record.referrer,
      notes: `續收自前單: ${record.date}`
    });
    setShowResults(false);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const yearMonth = formData.date.substring(0, 7);
      const matchId = `${formData.towerId}_${formData.buyerName}`;
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ ...formData, accountingMonth: yearMonth, matchId: matchId })
      });
      alert("✅ 帳務已更新！");
      setFormData(initialForm);
    } catch (e) { alert("失敗"); }
    setLoading(false);
  };

  const filteredData = dbData.filter(r => 
    r.towerId?.includes(searchQuery) || 
    r.buyerName?.includes(searchQuery) || 
    r.userName?.includes(searchQuery)
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* 🔍 搜尋區塊 */}
        <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-amber-200">
          <label className="text-xs font-bold text-amber-700">快速帶入舊單 (輸入塔位/姓名)</label>
          <div className="flex gap-2 mt-1">
            <input 
              className="flex-1 p-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value); setShowResults(true);}}
              placeholder="搜尋..."
              onFocus={refreshData}
            />
          </div>
          {showResults && searchQuery && (
            <div className="mt-2 border-t divide-y">
              {filteredData.map((r, i) => (
                <div key={i} onClick={() => handleSelectRecord(r)} className="p-3 active:bg-amber-50 cursor-pointer">
                  <p className="font-bold text-sm">{r.towerId} - {r.buyerName}</p>
                  <p className="text-[10px] text-stone-400">上次收款: {r.date} (${r.receivedAmount})</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📋 表單區塊 */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-bold text-stone-700">收支回報單</h2>
            <span className={`text-xs px-2 py-1 rounded ${formData.reportType.includes('補收') ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {formData.reportType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="p-2 border rounded-lg text-sm bg-stone-50">
              <option value="">收款人員</option>
              {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 border rounded-lg text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="塔位編號" value={formData.towerId} readOnly className="p-2 border rounded-lg text-sm bg-stone-100" />
            <input type="text" placeholder="權利人" value={formData.buyerName} readOnly className="p-2 border rounded-lg text-sm bg-stone-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-stone-400">總成交價 (唯讀)</label>
              <input type="number" value={formData.actualPrice} readOnly className="w-full p-2 border rounded-lg bg-stone-100 font-bold" />
            </div>
            <div>
              <label className="text-[10px] text-blue-600 font-bold">本次實收金額</label>
              <input type="number" required value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="w-full p-2 border-2 border-blue-200 rounded-lg bg-blue-50 font-bold" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-stone-800 text-white py-4 rounded-2xl font-bold shadow-lg">
            {loading ? "處理中..." : "確認提交帳務"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
