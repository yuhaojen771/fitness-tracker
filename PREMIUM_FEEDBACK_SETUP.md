# Premium 會員回饋表單設定指南

本指南說明如何設定回饋表單以自動標記 Premium 會員，實現優先客服服務。

## 🎯 功能說明

當 Premium 會員點擊回饋按鈕時，系統會自動在表單 URL 中添加 Premium 狀態參數，讓您能夠：
- 自動識別 Premium 會員的回饋
- 優先處理 Premium 會員的問題
- 在表單回應中標記 Premium 狀態

## 📋 URL 參數說明

系統會自動在表單 URL 中添加以下參數：

### Premium 會員
```
https://forms.gle/xxxxx?premium=true&user_type=premium
```

### 免費用戶
```
https://forms.gle/xxxxx?premium=false&user_type=free
```

## 🔧 設定方法

### 方法 1：使用 Tally Form（推薦，最簡單）

Tally Form 原生支援 URL 參數預填，設定最簡單。

#### 步驟 1：建立 Tally Form

1. 前往 [Tally](https://tally.so)
2. 建立新表單
3. 添加問題欄位

#### 步驟 2：添加「會員類型」欄位

1. 新增「簡答」或「單選」欄位
2. 標題：`會員類型` 或 `Premium 狀態`
3. 在欄位設定中：
   - 啟用「預填」
   - 設定預填變數名稱：`user_type`
   - 或使用 `premium` 參數

#### 步驟 3：設定預填值對應

在 Tally Form 中，您可以設定：
- 當 `user_type=premium` 時，自動填入「Premium 會員」
- 當 `user_type=free` 時，自動填入「免費用戶」

#### 步驟 4：測試

1. 使用 Premium 帳號登入
2. 點擊回饋按鈕
3. 確認表單中的「會員類型」欄位自動填入「Premium 會員」

### 方法 2：使用 Google Form + Apps Script（進階）

Google Form 需要透過 Apps Script 來處理 URL 參數。

#### 步驟 1：建立 Google Form

1. 建立新表單
2. 添加「會員類型」欄位（簡答類型）

#### 步驟 2：建立 Apps Script

1. 在 Google Form 中點擊「⋮」→「指令碼編輯器」
2. 貼上以下腳本：

```javascript
// 建立預填連結的輔助函數
function createPrefilledLinks() {
  const form = FormApp.getActiveForm();
  const items = form.getItems();
  
  // 找到「會員類型」欄位
  let memberTypeItem = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].getTitle().includes("會員類型") || 
        items[i].getTitle().includes("Premium")) {
      memberTypeItem = items[i].asTextItem();
      break;
    }
  }
  
  if (!memberTypeItem) {
    Logger.log("找不到「會員類型」欄位");
    return;
  }
  
  const formUrl = form.getPublishedUrl();
  const entryId = memberTypeItem.getId();
  
  // 建立 Premium 預填連結
  const premiumUrl = formUrl + "?entry." + entryId + "=Premium會員";
  Logger.log("Premium 預填連結: " + premiumUrl);
  
  // 建立免費用戶預填連結
  const freeUrl = formUrl + "?entry." + entryId + "=免費用戶";
  Logger.log("免費用戶預填連結: " + freeUrl);
  
  return {
    premium: premiumUrl,
    free: freeUrl
  };
}
```

#### 步驟 3：修改 FeedbackButton（可選）

如果需要使用預填連結，可以修改 `FeedbackButton` 組件使用不同的連結。

### 方法 3：手動標記（最簡單，但需手動操作）

如果不想設定自動填入，可以手動標記：

#### 步驟 1：在表單中添加「會員類型」欄位

1. 新增「簡答」欄位
2. 標題：`會員類型`
3. 在說明中：「請填寫 Premium 或 免費」

#### 步驟 2：在回應中查看

1. 前往 Google Form → 「回應」標籤
2. 查看每個回應
3. 根據用戶 Email 查詢 Premium 狀態
4. 手動標記或記錄

## 🎨 表單欄位建議

### 基本欄位

1. **回饋類型**（單選）
   - 功能建議
   - BUG 回報
   - 使用問題
   - 其他

2. **回饋內容**（段落文字，必填）

3. **會員類型**（自動填入）
   - Premium 會員
   - 免費用戶
   - 此欄位由系統自動填入

4. **聯絡方式**（簡答文字，選填）

### 進階欄位（可選）

5. **優先級**（單選）
   - Premium 會員自動設為「高優先級」
   - 免費用戶設為「一般優先級」

6. **問題頁面**（簡答文字）
   - 描述問題發生的頁面

7. **截圖**（檔案上傳）

## 📊 在 Google Sheets 中分析

### 匯出回應到 Google Sheets

1. 在 Google Form 中點擊「回應」標籤
2. 點擊「連結試算表」圖標
3. 選擇「建立新的試算表」或「選取現有的試算表」

### 添加 Premium 標記欄位

在 Google Sheets 中：

1. 添加「Premium 狀態」欄位
2. 使用 VLOOKUP 或手動標記
3. 建立篩選器，優先顯示 Premium 會員的回應

### 自動標記腳本（Google Sheets）

在 Google Sheets 中可以使用 Apps Script 自動標記：

```javascript
function markPremiumUsers() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // 假設 Email 在第 3 欄，Premium 狀態在第 4 欄
  // 這裡需要根據實際欄位調整
  
  for (let i = 1; i < data.length; i++) {
    const email = data[i][2]; // 調整索引
    const memberType = data[i][3]; // 調整索引
    
    // 如果「會員類型」欄位包含 "Premium" 或 "premium"
    if (memberType && memberType.toString().toLowerCase().includes("premium")) {
      // 標記為 Premium
      sheet.getRange(i + 1, 5).setValue("⭐ Premium"); // 調整欄位
    }
  }
}
```

## ✅ 檢查清單

### Tally Form 設定
- [ ] 建立 Tally Form
- [ ] 添加「會員類型」欄位
- [ ] 設定預填變數 `user_type`
- [ ] 測試 Premium 會員標記
- [ ] 測試免費用戶標記

### Google Form 設定
- [ ] 建立 Google Form
- [ ] 添加「會員類型」欄位
- [ ] 設定 Apps Script（如使用）
- [ ] 測試預填功能
- [ ] 設定回應通知

### 應用整合
- [ ] 確認 `FeedbackButton` 組件已更新
- [ ] 測試 Premium 會員點擊回饋按鈕
- [ ] 確認 URL 包含 Premium 參數
- [ ] 測試表單自動填入功能

## 💡 使用建議

### 優先處理 Premium 會員

1. **在 Google Sheets 中篩選**
   - 建立篩選器，優先顯示 Premium 會員的回應
   - 使用條件格式標記 Premium 會員

2. **設定自動通知**
   - Premium 會員的回應設定為「高優先級」通知
   - 免費用戶的回應設定為「一般優先級」

3. **回應時間目標**
   - Premium 會員：24 小時內回應
   - 免費用戶：48-72 小時內回應

## 🔗 相關文件

- `GOOGLE_FORM_SETUP.md` - Google Form 完整設定指南
- `src/components/feedback-button.tsx` - 回饋按鈕組件（已更新）

