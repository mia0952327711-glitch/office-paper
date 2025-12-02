import React, { useState, useEffect } from 'react';
import { 
  ReportType, 
  SalesRep, 
  ProductType, 
  CustomerSource, 
  SalesRecord 
} from '../types';
import { 
  REPORT_TYPES, 
  SALES_REPS, 
  PRODUCT_TYPES, 
  CUSTOMER_SOURCES 
} from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface SalesFormProps {
  onSubmit: (record: SalesRecord) => void;
  onCancel: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ onSubmit, onCancel }) => {
  // Form State
  const [reportType, setReportType] = useState<ReportType>(ReportType.NEW_SALE);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [salesRep, setSalesRep] = useState<string>(SalesRep.HONG_MING);
  const [customSalesRep, setCustomSalesRep] = useState<string>('');
  
  const [unitId, setUnitId] = useState<string>('');
  const [productType, setProductType] = useState<ProductType>(ProductType.PERSONAL_TOWER);
  const [buyerName, setBuyerName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [installDate, setInstallDate] = useState<string>('');
  
  const [listPrice, setListPrice] = useState<string>('');
  const [actualPrice, setActualPrice] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  
  const [source, setSource] = useState<CustomerSource>(CustomerSource.WALK_IN);
  const [referrer, setReferrer] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Derived State
  const [calculatedBalance, setCalculatedBalance] = useState<number>(0);
  const [calculatedDiscount, setCalculatedDiscount] = useState<number>(0);
  const [calculatedDiscountRate, setCalculatedDiscountRate] = useState<number>(0);

  // Effects for Real-time Calculation
  useEffect(() => {
    const list = parseFloat(listPrice) || 0;
    const actual = parseFloat(actualPrice) || 0;
    const received = parseFloat(receivedAmount) || 0;

    // Discount
    if (list > 0) {
      setCalculatedDiscount(list - actual);
      setCalculatedDiscountRate(1 - (actual / list));
    } else {
      setCalculatedDiscount(0);
      setCalculatedDiscountRate(0);
    }

    // Balance
    setCalculatedBalance(Math.max(0, actual - received));
  }, [listPrice, actualPrice, receivedAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalRep = salesRep === SalesRep.OTHER ? customSalesRep : salesRep;
    if (!finalRep) {
      alert("請輸入業務員姓名");
      return;
    }

    const record: SalesRecord = {
      id: uuidv4(),
      reportType,
      date,
      salesRep: finalRep,
      unitId,
      productType,
      buyerName,
      userName,
      installDate: installDate || undefined,
      listPrice: parseFloat(listPrice) || 0,
      actualPrice: parseFloat(actualPrice) || 0,
      receivedAmount: parseFloat(receivedAmount) || 0,
      balanceAmount: calculatedBalance,
      source,
      referrer: source === CustomerSource.WALK_IN ? undefined : referrer,
      notes,
      discountAmount: calculatedDiscount,
      discountRate: calculatedDiscountRate,
      timestamp: Date.now(),
    };

    onSubmit(record);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden border border-stone-200">
      <div className="bg-stone-800 p-6 text-white">
        <h2 className="text-xl font-bold">填寫成交回報單</h2>
        <p className="text-stone-300 text-sm mt-1">請務必確認金額與權利人資訊正確</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-stone-700">回報類型 (必填)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REPORT_TYPES.map((type) => (
              <div
                key={type}
                onClick={() => setReportType(type)}
                className={`cursor-pointer border rounded-lg p-4 flex items-center transition-all ${
                  reportType === type
                    ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                    : 'border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                  reportType === type ? 'border-amber-600' : 'border-stone-400'
                }`}>
                  {reportType === type && <div className="w-2 h-2 rounded-full bg-amber-600" />}
                </div>
                <span className="text-sm font-medium text-stone-800">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Part 1: Basic Info */}
        <section className="space-y-4 border-b border-stone-100 pb-6">
          <h3 className="text-lg font-semibold text-stone-800 flex items-center">
            <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs mr-2">1</span>
            基本資料
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">成交日期</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">接待業務員</label>
              <select
                value={salesRep}
                onChange={(e) => setSalesRep(e.target.value)}
                className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              >
                {SALES_REPS.map(rep => (
                  <option key={rep} value={rep}>{rep}</option>
                ))}
              </select>
              {salesRep === SalesRep.OTHER && (
                <input
                  type="text"
                  placeholder="請輸入業務員姓名"
                  value={customSalesRep}
                  onChange={(e) => setCustomSalesRep(e.target.value)}
                  className="mt-2 w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
                />
              )}
            </div>
          </div>
        </section>

        {/* Part 2: Product Info */}
        <section className="space-y-4 border-b border-stone-100 pb-6">
          <h3 className="text-lg font-semibold text-stone-800 flex items-center">
            <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs mr-2">2</span>
            產品與客戶資訊
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">塔位 / 牌位編號</label>
              <input
                type="text"
                required
                placeholder="例如：6362102"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">產品類型</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              >
                {PRODUCT_TYPES.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">權利人姓名 (買方)</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">使用人姓名 (往生者/預定者)</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">預計進塔 / 安座日期 (選填)</label>
              <input
                type="date"
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
                className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              />
            </div>
          </div>
        </section>

        {/* Part 3: Financials */}
        <section className="space-y-4 border-b border-stone-100 pb-6">
          <h3 className="text-lg font-semibold text-stone-800 flex items-center">
            <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs mr-2">3</span>
            金額與交易條件
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">定價 (表價)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-stone-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="block w-full rounded-md border-stone-300 pl-7 p-2 border focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">實際成交價</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-stone-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={actualPrice}
                  onChange={(e) => setActualPrice(e.target.value)}
                  className="block w-full rounded-md border-stone-300 pl-7 p-2 border focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Auto Calculation Display */}
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 grid grid-cols-2 gap-4">
            <div>
               <span className="text-xs text-stone-500 block">折扣金額</span>
               <span className="font-mono font-medium text-stone-700">{calculatedDiscount.toLocaleString()}</span>
            </div>
            <div>
               <span className="text-xs text-stone-500 block">折扣數 (折)</span>
               <span className={`font-mono font-bold ${calculatedDiscountRate > 0.3 ? 'text-red-600' : 'text-green-600'}`}>
                 {calculatedDiscountRate > 0 ? ((1 - calculatedDiscountRate) * 10).toFixed(2) : '-'} 折
                 <span className="text-xs text-stone-400 font-normal ml-1">({(calculatedDiscountRate * 100).toFixed(1)}% off)</span>
               </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">本次實收金額 (訂金/全額)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-stone-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="block w-full rounded-md border-stone-300 pl-7 p-2 border focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">尾款金額 (自動計算)</label>
              <div className="relative rounded-md shadow-sm bg-gray-50">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-stone-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  readOnly
                  value={calculatedBalance.toLocaleString()}
                  className="block w-full rounded-md border-stone-300 bg-gray-50 pl-7 p-2 text-stone-500 sm:text-sm border cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Part 4: Source & Notes */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-800 flex items-center">
            <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-xs mr-2">4</span>
            來源與備註
          </h3>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">客戶來源分類</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CUSTOMER_SOURCES.map((src) => (
                <label key={src} className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-stone-50">
                  <input
                    type="radio"
                    name="source"
                    value={src}
                    checked={source === src}
                    onChange={() => setSource(src)}
                    className="h-4 w-4 border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-stone-700">{src}</span>
                </label>
              ))}
            </div>
          </div>
          
          {source !== CustomerSource.WALK_IN && (
             <div className="animate-fade-in">
              <label className="block text-sm font-medium text-stone-700 mb-1">介紹單位 / 介紹人名稱 (必填)</label>
              <input
                type="text"
                required
                placeholder="例如：極樂園、和豐、陳大師"
                value={referrer}
                onChange={(e) => setReferrer(e.target.value)}
                className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">備註 (選填)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 p-2 border"
              placeholder="例如：特殊折扣原因、退佣金額備註等..."
            />
          </div>
        </section>

        {/* Actions */}
        <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 gap-3">
           <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 border border-stone-300 shadow-sm text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            取消
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex justify-center items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            提交回報單
          </button>
        </div>

      </form>
    </div>
  );
};

export default SalesForm;
