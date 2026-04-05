import React, { useState } from 'react';

// 圖示元件
const PlusCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
const Save = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const LayoutDashboard = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;

// ⚠️ 確認網址為您提供的正確連結
const API_URL = "https://script.google.com/macros/s/AKfycbyoFAj2LOamK4ISy2g9y6wforgHuvdqXdTdpeHjC7wPKG_ipOoRUE_ua1TLt-pvrhyf/exec";
const ADMIN_PASSWORD = "012820";

function App() {
  const [view, setView] = useState('form');
  const [loading, setLoading] = useState(false);
  
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
    listPrice: '',
    actualPrice: '',
    receivedAmount: '',
    source: '自行前來',
    referrer: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalSalesRep = formData.salesRep === '其他' ? formData.customSalesRep : formData.salesRep;
      const accountingMonth = formData.date.substring(0, 7); // 自動產生 YYYY-MM
      const matchId = `${formData.towerId.trim()}_${formData.buyerName.trim()}`; // 產生對帳 ID

      const payload = {
        ...formData,
        salesRep: finalSalesRep,
        accountingMonth: accountingMonth,
        matchId: matchId
      };

      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
      });

      alert(`🎉 成功寫入法華山回報資料庫！月份：${accountingMonth}`);
      setFormData(initialForm);
    } catch (error) {
      alert("傳送失敗，請檢查網路。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4">
      <header className="max-w-3xl mx-auto flex justify-between mb-6 bg-stone-900 p-4 rounded-xl text-white shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-amber-500">法華山永安公司</h1>
          <p className="text-xs">第五個月：團隊擴編優化版</p>
        </div>
        <button onClick={() => setView(view === 'form' ? 'login' : 'form')} className="p-2 bg-stone-800 rounded-full text-amber-500">
          {view === 'form' ? <LayoutDashboard /> : <PlusCircle />}
        </button>
      </header>

      <main className="max-w-3xl mx-auto">
        {view === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 text-stone-700">📋 成交回報單</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500">成交日期 *</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-stone-500">業務員 *</label>
                <select required value={formData.salesRep} onChange={e => setFormData({...formData, salesRep: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="">請選擇</option>
                  {["宏銘", "庭榆", "芝芝", "靖璇", "雅文", "美珠", "彤甄", "詠婷", "其他"].map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="塔位編號 *" required value={formData.towerId} onChange={e => setFormData({...formData, towerId: e.target.value})} className="p-2 border rounded-lg" />
              <input type="text" placeholder="權利人姓名 *" required value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="p-2 border rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500">實際成交價 *</label>
                <input type="number" required value={formData.actualPrice} onChange={e => setFormData({...formData, actualPrice: e.target.value})} className="w-full p-2 border rounded-lg bg-red-50" />
              </div>
              <div>
                <label className="text-xs text-stone-500">本次實收金額 *</label>
                <input type="number" required value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="w-full p-2 border rounded-lg bg-green-50" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition">
              {loading ? "傳送中..." : <><Save size={20}/> 提交回報</>}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default App;
