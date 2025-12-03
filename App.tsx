// 🔥 1. 請在此貼上您的試算表 ID
const SPREADSHEET_ID = "1YGuM1YjmKkMG52gi5yRsBoTMaLXKcu1_j56tEXgscdc"; 

// 🔑 2. 設定管理員密碼
const ADMIN_KEY = "012820"; 

// ---------------------------------------------------------
// 核心功能區 (請勿更動)
// ---------------------------------------------------------

function doGet(e) {
  // 安全性檢查：如果密碼不對，直接拒絕
  if (!e.parameter.adminKey || e.parameter.adminKey !== ADMIN_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ error: "密碼錯誤", data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return handleRead();
}

function doPost(e) {
  return handleWrite(e);
}

// 讀取資料 (給儀表板用)
function handleRead() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('SalesData');
    
    // 如果找不到分頁，回傳空資料
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    // 如果只有標題列，回傳空資料
    if (data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = data.slice(1); // 去掉標題列

    // 整理資料格式 (對應寫入的欄位順序)
    const records = rows.map(row => ({
      date: new Date(row[1]).toLocaleDateString(), // B欄: 成交日期
      reportType: row[2],    // C欄: 回報類型
      salesRep: row[3],      // D欄: 業務員
      productType: row[5],   // F欄: 產品類型
      buyerName: row[6],     // G欄: 權利人
      actualPrice: row[10],  // K欄: 實際成交價
      receivedAmount: row[11] // L欄: 本次實收
    }));

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: records }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
     return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
       .setMimeType(ContentService.MimeType.JSON);
  }
}

// 寫入資料 (給表單用)
function handleWrite(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // 防止多人同時寫入衝突

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('SalesData');
    
    // 定義主表標題
    const headers = [
      '系統時間', '成交日期', '回報類型', '業務員', '塔位編號', 
      '產品類型', '權利人(買方)', '使用人', '預計進塔日', 
      '定價', '實際成交價', '本次實收', '待收尾款', 
      '客戶來源', '介紹人', '備註'
    ];

    // 如果沒有分頁，自動建立
    if (!sheet) {
      sheet = ss.insertSheet('SalesData');
      sheet.appendRow(headers);
    } else {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
      }
    }

    const data = JSON.parse(e.postData.contents);
    
    // 計算尾款
    const balance = (Number(data.actualPrice) || 0) - (Number(data.receivedAmount) || 0);

    // 1. 寫入主資料表 (SalesData)
    sheet.appendRow([
      new Date(),         // A: 系統時間
      data.date,          // B: 成交日期
      data.reportType,    // C: 回報類型
      data.salesRep,      // D: 業務員
      data.towerId,       // E: 塔位編號
      data.productType,   // F: 產品類型
      data.buyerName,     // G: 權利人
      data.userName,      // H: 使用人
      data.installDate,   // I: 預計進塔日
      data.listPrice,     // J: 定價
      data.actualPrice,   // K: 實際成交價
      data.receivedAmount,// L: 本次實收
      balance,            // M: 待收尾款
      data.source,        // N: 客戶來源
      data.referrer,      // O: 介紹人
      data.notes          // P: 備註
    ]);

    // 2. 新增功能：自動寫入「進塔排程」並排序
    if (data.installDate) {
      let scheduleSheet = ss.getSheetByName('進塔排程');
      
      // 如果沒有排程表，自動建立
      if (!scheduleSheet) {
        scheduleSheet = ss.insertSheet('進塔排程');
        scheduleSheet.appendRow(['預計進塔日', '塔位編號',  '使用人', '業務員', '備註']);
        scheduleSheet.setFrozenRows(1);
      }

      // 寫入排程資料
      scheduleSheet.appendRow([
        data.installDate,   // A欄
        data.towerId,       // B欄
        data.productType,   // C欄
        data.userName,      // D欄
        data.buyerName,     // E欄
        data.salesRep,      // F欄
        data.notes          // G欄
      ]);

      // 自動排序 (依照日期)
      const lastRow = scheduleSheet.getLastRow();
      if (lastRow > 1) {
        const range = scheduleSheet.getRange(2, 1, lastRow - 1, scheduleSheet.getLastColumn());
        range.sort({column: 1, ascending: true}); 
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
