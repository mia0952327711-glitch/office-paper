// 🔥 1. 請在此貼上您的試算表 ID
const SPREADSHEET_ID = "1YGuM1YjmKkMG52gi5yRsBoTMaLXKcu1_j56tEXgscdc"; 

// 🔑 2. 設定管理員密碼
const ADMIN_KEY = "012820"; 

function doGet(e) {
  if (e.parameter.adminKey !== ADMIN_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ error: "密碼錯誤", data: [] })).setMimeType(ContentService.MimeType.JSON);
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
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] })).setMimeType(ContentService.MimeType.JSON);

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] })).setMimeType(ContentService.MimeType.JSON);

    const rows = data.slice(1); // 去掉標題列

    // 欄位對應 (根據下方的寫入順序):
    // J欄(索引9)=成交價, L欄(索引11)=實收, N欄(索引13)=尾款
    // C欄(索引2)=回報類型 (用於判斷是否為新業績)
    
    const records = rows.map(row => ({
      date: new Date(row[1]).toLocaleDateString(), // B欄
      reportType: row[2],    // C欄: 回報類型
      salesRep: row[3],      // D欄
      productType: row[5],   // F欄
      buyerName: row[6],     // G欄
      actualPrice: row[10],  // K欄: 成交價
      receivedAmount: row[11] // L欄: 實收
    }));

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: records }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
     return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 寫入資料 (給表單用)
function handleWrite(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('SalesData');
    
    // 定義完整標題 (對應您的需求)
    const headers = [
      '系統時間', '成交日期', '回報類型', '業務員', '塔位編號', 
      '產品類型', '權利人(買方)', '使用人', '預計進塔日', 
      '定價', '實際成交價', '本次實收', '待收尾款', 
      '客戶來源', '介紹人', '備註'
    ];

    // 如果沒有分頁，自動建立並寫入標題
    if (!sheet) {
      sheet = ss.insertSheet('SalesData');
      sheet.appendRow(headers);
    } else {
      // 檢查第一列是否為空，如果是空的就補上標題
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
      }
    }

    const data = JSON.parse(e.postData.contents);
    
    // 計算尾款 (成交 - 實收)
    const balance = (Number(data.actualPrice) || 0) - (Number(data.receivedAmount) || 0);

    // 寫入資料列
    sheet.appendRow([
      new Date(),         // A: 系統時間
      data.date,          // B: 成交日期
      data.reportType,    // C: 回報類型 (新成交/補尾款)
      data.salesRep,      // D: 業務員
      data.towerId,       // E: 塔位編號
      data.productType,   // F: 產品類型
      data.buyerName,     // G: 權利人
      data.userName,      // H: 使用人
      data.installDate,   // I: 安座日
      data.listPrice,     // J: 定價
      data.actualPrice,   // K: 成交價
      data.receivedAmount,// L: 本次實收
      balance,            // M: 尾款 (自動計算)
      data.source,        // N: 來源
      data.referrer,      // O: 介紹人
      data.notes          // P: 備註
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
