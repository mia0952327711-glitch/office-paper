import React, { useState, useEffect } from 'react';
import SalesForm from './components/SalesForm';
import Dashboard from './components/Dashboard';
import { SalesRecord } from './types';
import { APP_TITLE, FORM_TITLE } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sales_records');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load records", e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('sales_records', JSON.stringify(records));
  }, [records]);

  const handleAddRecord = (record: SalesRecord) => {
    setRecords(prev => [...prev, record]);
    setView('dashboard');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Date', 'Rep', 'Unit', 'Product', 'Buyer', 'User', 'List Price', 'Actual Price', 'Received', 'Balance', 'Source', 'Referrer', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...records.map(r => [
        r.id,
        r.reportType,
        r.date,
        r.salesRep,
        r.unitId,
        r.productType,
        r.buyerName,
        r.userName,
        r.listPrice,
        r.actualPrice,
        r.receivedAmount,
        r.balanceAmount,
        r.source,
        r.referrer || '',
        `"${(r.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
      ].join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* Navbar */}
      <nav className="bg-stone-900 text-amber-50 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold font-serif">
                法
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">{APP_TITLE}</h1>
                <p className="text-xs text-stone-400 font-light">{FORM_TITLE}</p>
              </div>
            </div>
            <div className="flex space-x-2">
               {view === 'dashboard' && (
                 <button 
                  onClick={handleExportCSV}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 border border-stone-600 text-xs font-medium rounded-full text-stone-300 bg-transparent hover:bg-stone-800 hover:text-white transition-colors"
                 >
                   匯出 CSV
                 </button>
               )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'dashboard' ? (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-stone-800">儀表板總覽</h2>
              <button
                onClick={() => setView('form')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-transform active:scale-95 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                新增成交回報
              </button>
            </div>
            <Dashboard records={records} onNewRecord={() => setView('form')} />
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <SalesForm onSubmit={handleAddRecord} onCancel={() => setView('dashboard')} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-stone-500">
            &copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved. 
            <span className="hidden sm:inline"> | 內部系統，請勿外流。</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
