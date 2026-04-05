import React, { useState, useEffect } from 'react';

// 圖示元件
const PlusCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
const Save = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const User = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Search = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

const API_URL = "https://script.google.com/macros/s/AKfycbyoFAj2LOamK4ISy2g9y6wforgHuvdqXdTdpeHjC7wPKG_ipOoRUE_ua1TLt-pvrhyf/exec";
const STAFF_LIST = ["宏銘", "庭榆", "芝芝", "靖璇", "雅文", "美珠", "彤甄", "詠婷"];

function App() {
  const [view, setView] = useState<'form' | 'query' | 'setPass'>('form');
  const [loading, setLoading] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [password, setPassword] = useState("");
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);

  // 檢查本地是否有設過密碼
  useEffect(() => {
    const savedPass = localStorage.getItem('staff_pass');
    if (!savedPass) setView('setPass');
  }, []);

  const initialForm = {
    date: new Date().toISOString().split('T')[0],
    reportType: '新成交 (首次收訂/全額)',
    salesRep: '',
    towerId: '', 
    buyerName: '',
    actualPrice: '',
    receivedAmount: '',
    installDate: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // 1. 設定/自設密碼邏輯
  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) return alert("密碼請至少設定 4 位數");
    localStorage.setItem('staff_pass', password);
    alert("密碼設定成功！請妥善保管。");
    setView('form');
  };

  // 2. 提交回報
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
      alert("✅ 報單成功！");
      setFormData(initialForm);
    } catch (e) { alert("傳送失敗"); }
    setLoading(false);
  };

  // 3. 個人化查詢邏輯 (核對昨日與近期單子)
  const handleQuery = async () => {
    const savedPass = localStorage.getItem('staff_pass');
    if (password !== savedPass) return alert("密碼錯誤！");
    
    setLoading(true);
    try {
      // 這裡需要後端 doGet 配合，目前先以全量抓取後前端篩選為例
      const res = await fetch(`${API_URL}?adminKey=012820`); 
      const json = await res.json();
      const filtered = json.data.filter((r: any) => r.salesRep === staffName);
      setPersonalRecords(filtered.slice(-10).reverse()); // 顯示最近 10 筆
    } catch (e) { alert("查詢失敗"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800">
      <header className="bg-stone-900 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-amber-500">法華山永安系統</h1>
        <div className="flex gap-4">
          <button onClick={() => setView('form')}><PlusCircle size={22}/></button>
          <button onClick={() => setView('query')}><Search size={22}/></button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* === 視圖：設定密碼 === */}
        {view === 'setPass' && (
          <div className="bg-white p-6 rounded-2xl shadow-md mt-10">
            <h2 className="font-bold mb-4">首次使用請自設密碼</h2>
            <input type="password" placeholder="請輸入 4-8 位密碼" className="w-full p-3 border rounded-xl mb-4" 
                   onChange={e => setPassword(e.target.value)} />
            <button onClick={handleSetPassword} className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold">確認設定</button>
          </div>
        )}

        {/* === 視圖：回報表單 === */}
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
            <h2 className="font-bold border-b pb-2">📋 每日回報</h2>
            <select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="w-full p-3 border rounded-xl">
              <option value="">選擇您的姓名</option>
              {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="塔位編號" required value={formData.towerId} onChange={e => setFormData({...formData, towerId: e.target.value})} className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="權利人姓名" required value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="w-full p-3 border rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="成交價" value={formData.actualPrice} onChange={e => setFormData({...formData, actualPrice: e.target.value})} className="p-3 border rounded-xl bg-red-50" />
              <input type="number" placeholder="實收" value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="p-3 border rounded-xl bg-green-50" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2">
              {loading ? "傳送中..." : <><Save size={20}/> 提交回報</>}
            </button>
          </form>
        )}

        {/* === 視圖：個人查詢 === */}
        {view === 'query' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="font-bold mb-4">🔍 個人紀錄查詢</h2>
              <select value={staffName} onChange={e => setStaffName(e.target.value)} className="w-full p-3 border rounded-xl mb-3">
                <option value="">選擇您的姓名</option>
                {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="password" placeholder="請輸入您的密碼" className="w-full p-3 border rounded-xl mb-4" onChange={e => setPassword(e.target.value)} />
              <button onClick={handleQuery} className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold">開始查詢</button>
            </div>

            {personalRecords.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h3 className="text-sm font-bold text-stone-500 mb-3">最近 10 筆回報紀錄</h3>
                <div className="space-y-3">
                  {personalRecords.map((r, i) => (
                    <div key={i} className="border-b pb-2 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{r.buyerName}</p>
                        <p className="text-xs text-stone-400">{r.date} | {r.productType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-600 font-bold">${Number(r.actualPrice).toLocaleString()}</p>
                        <p className="text-xs text-green-600">收: ${Number(r.receivedAmount).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
