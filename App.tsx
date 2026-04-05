import React, { useState, useEffect } from 'react';

// 圖示元件
const PlusCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
const Save = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const Search = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

const API_URL = "https://script.google.com/macros/s/AKfycbyoFAj2LOamK4ISy2g9y6wforgHuvdqXdTdpeHjC7wPKG_ipOoRUE_ua1TLt-pvrhyf/exec";
const STAFF_LIST = ["宏銘", "庭榆", "芝芝", "靖璇", "雅文", "美珠", "彤甄", "詠婷"];

function App() {
  const [view, setView] = useState<'form' | 'query' | 'setPass'>('form');
  const [loading, setLoading] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [password, setPassword] = useState("");
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);

  useEffect(() => {
    const savedPass = localStorage.getItem('staff_pass');
    if (!savedPass) setView('setPass');
  }, []);

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

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) return alert("密碼請至少 4 位");
    localStorage.setItem('staff_pass', password);
    alert("密碼設定成功！");
    setView('form');
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
      alert("🎉 報單成功！資料已同步至日報表。");
      setFormData(initialForm);
    } catch (e) { alert("傳送失敗"); }
    setLoading(false);
  };

  const handleQuery = async () => {
    if (password !== localStorage.getItem('staff_pass')) return alert("密碼錯誤！");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?adminKey=012820`);
      const json = await res.json();
      const filtered = json.data.filter((r: any) => r.salesRep === staffName);
      setPersonalRecords(filtered.slice(-10).reverse());
    } catch (e) { alert("查詢失敗"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 pb-10">
      <header className="bg-stone-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div>
          <h1 className="font-bold text-amber-500">法華山永安系統</h1>
          <p className="text-[10px] text-stone-400">Version 5.0 | 團隊擴編優化版</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setView('form')} className={view === 'form' ? "text-amber-500" : ""}><PlusCircle/></button>
          <button onClick={() => setView('query')} className={view === 'query' ? "text-amber-500" : ""}><Search/></button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {view === 'setPass' && (
          <div className="bg-white p-6 rounded-2xl shadow-md mt-10">
            <h2 className="font-bold mb-4 text-center text-stone-600">首次使用請自設查詢密碼</h2>
            <input type="password" placeholder="請設定 4-8 位密碼" className="w-full p-3 border rounded-xl mb-4 text-center" onChange={e => setPassword(e.target.value)} />
            <button onClick={handleSetPassword} className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold">確認密碼</button>
          </div>
        )}

        {view === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
            <h2 className="font-bold border-b pb-2 text-amber-800">📋 每日成交回報</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-stone-500">成交日期</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-stone-500">業務員</label>
                <select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                  <option value="">選擇姓名</option>
                  {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-stone-500">產品類型</label>
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
                <label className="text-[10px] text-stone-500">客戶來源</label>
                <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                  <option value="自行前來">自行前來</option>
                  <option value="同業/禮儀公司介紹">同業介紹</option>
                  <option value="舊客介紹">舊客介紹</option>
                  <option value="開發件">開發件</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="塔位編號 *" required value={formData.towerId} onChange={e => setFormData({...formData, towerId: e.target.value})} className="p-2 border rounded-lg text-sm" />
              <input type="text" placeholder="權利人(購買者) *" required value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="p-2 border rounded-lg text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="使用人(往生者)" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} className="p-2 border rounded-lg text-sm" />
              <input type="text" placeholder="介紹人/單位" value={formData.referrer} onChange={e => setFormData({...formData, referrer: e.target.value})} className="p-2 border rounded-lg text-sm" />
            </div>

            {/* 💡 邏輯判斷：如果是壽位，不顯示進塔日期 */}
            {formData.productType !== "壽位" && (
              <div>
                <label className="text-[10px] text-amber-600 font-bold">預計進塔日期 (自動加入排程)</label>
                <input type="date" value={formData.installDate} onChange={e => setFormData({...formData, installDate: e.target.value})} className="w-full p-2 border border-amber-200 rounded-lg text-sm bg-amber-50" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-red-500">實際成交總價</label>
                <input type="number" required value={formData.actualPrice} onChange={e => setFormData({...formData, actualPrice: e.target.value})} className="w-full p-2 border rounded-lg bg-red-50 font-bold" />
              </div>
              <div>
                <label className="text-[10px] text-green-600">本次實收金額</label>
                <input type="number" required value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="w-full p-2 border rounded-lg bg-green-50 font-bold" />
              </div>
            </div>

            <textarea placeholder="備註事項" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded-lg text-sm h-20" />

            <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-transform">
              {loading ? "傳送中..." : <><Save size={20}/> 提交回報單</>}
            </button>
          </form>
        )}

        {view === 'query' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="font-bold mb-4">🔍 個人紀錄查詢 (核對用)</h2>
              <select value={staffName} onChange={e => setStaffName(e.target.value)} className="w-full p-3 border rounded-xl mb-3">
                <option value="">選擇您的姓名</option>
                {STAFF_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="password" placeholder="輸入您的查詢密碼" className="w-full p-3 border rounded-xl mb-4 text-center" onChange={e => setPassword(e.target.value)} />
              <button onClick={handleQuery} className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold">開始查詢</button>
            </div>

            {personalRecords.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-md overflow-hidden">
                <h3 className="text-xs font-bold text-stone-500 mb-3 border-b pb-2">最近 10 筆回報</h3>
                <div className="divide-y">
                  {personalRecords.map((r, i) => (
                    <div key={i} className="py-3 flex justify-between items-center">
                      <div className="text-sm">
                        <p className="font-bold text-stone-700">{r.buyerName}</p>
                        <p className="text-[10px] text-stone-400">{r.date} | {r.towerId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-600 font-bold text-sm">${Number(r.actualPrice).toLocaleString()}</p>
                        <p className="text-[10px] text-green-600">收: ${Number(r.receivedAmount).toLocaleString()}</p>
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
