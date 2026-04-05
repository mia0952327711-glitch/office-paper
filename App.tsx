import React, { useState } from 'react';

const PlusCircle = ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
const Save = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const SearchIcon = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

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

  // 【改動】：點擊按鈕才執行搜尋，避免一開 App 就卡死
  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    setShowResults(true);
    try {
      const res = await fetch(`${API_URL}?adminKey=012820`);
      const json = await res.json();
      if (json.data) {
        setDbData(json.data);
      }
    } catch (e) {
      alert("搜尋暫時無法連線，請手動填寫新單。");
    }
    setSearching(false);
  };

  const handleSelectRecord = (record: any) => {
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
      notes: `續收自前單: ${record.date || ""}`
    });
    setShowResults(false);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const yearMonth = formData.date.substring(0, 7); 
      const matchId = `${formData.towerId.trim()}_${formData.buyerName.trim()}`;

      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ ...formData, accountingMonth: yearMonth, matchId: matchId })
      });

      alert(`🎉 報單成功！本筆歸類至 ${yearMonth}`);
      setFormData(initialForm);
    } catch (e) { alert("傳送失敗"); }
    setLoading(false);
  };

  const filteredData = dbData.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.towerId && String(r.towerId).toLowerCase().includes(q)) || 
      (r.buyerName && r.buyerName.toLowerCase().includes(q))
    );
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 pb-10 px-4">
      <header className="max-w-md mx-auto py-4 flex justify-between items-center border-b mb-4">
        <div>
          <h1 className="text-xl font-bold text-amber-600">法華山訂單回報系統</h1>
          <p className="text-[10px] text-stone-400 font-medium">Order System v7.5 - STABLE</p>
        </div>
        <button type="button" onClick={() => window.location.reload()} className="p-2 bg-white rounded-full shadow-sm text-stone-400">
            <PlusCircle />
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {/* 🔍 搜尋區 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-amber-100">
          <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
            <SearchIcon /> 快速找舊單 (輸入後按搜尋)
          </div>
          <div className="flex gap-2 relative">
            <input 
              type="text"
              className="flex-1 p-2 border rounded-lg bg-stone-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="塔位編號或姓名..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault() || handleSearch())}
            />
            <button 
              type="button"
              onClick={handleSearch}
              className="bg-amber-600 text-white px-4 rounded-lg text-sm font-bold active:bg-amber-700"
            >
              {searching ? "..." : "搜尋"}
            </button>

            {showResults && searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-xl z-50 divide-y max-h-60 overflow-auto">
                {searching ? (
                  <div className="p-4 text-center text-stone-400 text-sm">正在連線資料庫...</div>
                ) : filteredData.length > 0 ? (
                  filteredData.map((r, i) => (
                    <div key={i} onClick={() => handleSelectRecord(r)} className="p-3 active:bg-amber-50 cursor-pointer text-left">
                      <p className="font-bold text-sm text-stone-700">{r.towerId} - {r.buyerName}</p>
                      <p className="text-[10px] text-stone-400">前單日: {r.date} | 業務: {r.salesRep}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-stone-400 text-sm">找不到資料，請確認編號</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 📋 回報表單 */}
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
             <h2 className="font-bold text-stone-700 text-sm">📋 回報詳細內容</h2>
             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${formData.reportType.includes('補收') ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                {formData.reportType}
             </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-stone-400 ml-1">成交/收款日</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-stone-400 ml-1">收款人員</label>
              <select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                <option value="">選擇姓名</option>
                {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="塔位編號 *" required value={formData.towerId} onChange={e => setFormData({...formData, towerId: e.target.value})} className="p-2 border rounded-lg text-sm font-medium" />
            <input type="text" placeholder="權利人姓名 *" required value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="p-2 border rounded-lg text-sm font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="實際成交總價" required value={formData.actualPrice} onChange={e => setFormData({...formData, actualPrice: e.target.value})} className="p-2 border rounded-lg bg-red-50 font-bold" />
            <input type="number" placeholder="本次實收金額" required value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="p-2 border rounded-lg bg-green-50 font-bold" />
          </div>

          <textarea placeholder="備註" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded-lg text-sm h-16" />

          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
            {loading ? "傳送中..." : "確認提交"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
