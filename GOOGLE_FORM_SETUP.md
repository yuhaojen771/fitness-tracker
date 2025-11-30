# Google Form 回饋表單設定指南

本文檔說明如何建立 Google Form 回饋表單並整合到應用程式中。

## 📋 步驟 1：建立 Google Form

### 1.1 建立新表單

1. 前往 [Google Forms](https://forms.google.com)
2. 點擊「空白」建立新表單
3. 或選擇「從範本」使用現有範本

### 1.2 設定表單標題和說明

- **標題**：例如「健康追蹤 App 回饋表單」或「BUG 回報表單」
- **說明**：可選，例如「請填寫您的回饋或問題，我們會盡快處理」

### 1.3 新增問題欄位

建議包含以下欄位：

#### 必填欄位：

1. **回饋類型**（單選）
   - 選項：
     - 功能建議
     - BUG 回報
     - 使用問題
     - 其他

2. **回饋內容**（段落文字）
   - 描述：請詳細描述您的回饋或問題
   - 設為必填

3. **聯絡方式**（簡答文字，選填）
   - 描述：如果需要回覆，請留下您的 email

#### 選填欄位：

4. **頁面/功能位置**（簡答文字）
   - 描述：請說明問題發生在哪個頁面或功能

5. **截圖**（檔案上傳）
   - 描述：如有截圖，請上傳（選填）

6. **會員類型**（簡答文字，自動填入，隱藏欄位）
   - 描述：自動標記 Premium 會員
   - 設為「簡答」類型
   - 在「回應驗證」中設定預設值（見下方說明）

#### ⭐ Premium 會員標記設定

系統會自動在表單 URL 中添加以下參數：
- `premium=true` 或 `premium=false`
- `user_type=premium` 或 `user_type=free`

**在 Google Form 中使用這些參數：**

1. **方法 A：使用 Google Apps Script（推薦）**
   - 在 Google Form 中點擊「⋮」→「指令碼編輯器」
   - 添加腳本自動讀取 URL 參數並填入表單欄位
   - 詳細步驟見下方「Premium 會員自動標記」章節

2. **方法 B：手動查看（簡單但需手動）**
   - 在表單回應中查看 URL 參數
   - 手動標記 Premium 會員的回應

3. **方法 C：使用 Tally Form（更簡單）**
   - Tally Form 支援 URL 參數預填
   - 可以直接在表單欄位中使用 `{{premium}}` 或 `{{user_type}}`

### 1.4 設定表單選項

1. 點擊右上角「設定」⚙️
2. **一般**：
   - ✅ 收集電子郵件地址（選填，用於回覆）
   - ✅ 限制為 1 個回應（避免重複提交）
3. **簡報**：
   - ✅ 顯示進度列
   - ✅ 顯示確認訊息（可自訂）

## 📋 步驟 2：取得表單連結

### 2.1 取得分享連結

1. 點擊右上角「傳送」按鈕
2. 選擇「連結」圖標 🔗
3. 點擊「縮短網址」（選填，讓連結更簡潔）
4. 複製連結

**連結格式範例：**
```
https://forms.gle/xxxxxxxxxxxxx
```

### 2.2 測試連結

1. 在新視窗開啟連結
2. 確認表單可以正常顯示和提交
3. 提交一筆測試資料確認收到回應

## 📋 步驟 3：設定環境變數

### 3.1 在 `.env.local` 中設定

在專案根目錄的 `.env.local` 檔案中添加：

```env
# Google Form 回饋表單 URL
NEXT_PUBLIC_FEEDBACK_FORM_URL=https://forms.gle/xxxxxxxxxxxxx
```

### 3.2 在部署環境中設定

根據您的部署平台設定環境變數：

#### Vercel：
1. 前往專案設定 → Environment Variables
2. 新增變數：
   - **Name**: `NEXT_PUBLIC_FEEDBACK_FORM_URL`
   - **Value**: `https://forms.gle/xxxxxxxxxxxxx`
3. 選擇環境（Production, Preview, Development）
4. 儲存並重新部署

#### Netlify：
1. 前往 Site settings → Environment variables
2. 新增變數並儲存
3. 重新部署

#### 其他平台：
請參考各平台的環境變數設定文件

## 📋 步驟 4：驗證功能

### 4.1 本地測試

1. 重新啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 檢查右下角是否顯示回饋按鈕 💬
3. 點擊按鈕，確認在新標籤頁開啟表單
4. 測試提交表單，確認收到回應

### 4.2 檢查回應

1. 前往 Google Forms 編輯頁面
2. 點擊「回應」標籤
3. 確認可以查看提交的回饋

## 📋 進階設定（選填）

### 自動回覆設定

1. 在 Google Forms 中點擊「設定」⚙️
2. 啟用「收集電子郵件地址」
3. 在「回應」標籤中：
   - 點擊「⋮」→「取得電子郵件通知」
   - 設定收到新回應時自動通知

### 回應分析

1. 在「回應」標籤中查看：
   - 回應摘要（圖表）
   - 個別回應
   - 匯出到 Google Sheets（用於進一步分析）

### 自訂確認訊息

1. 在表單設定中：
   - 點擊「簡報」
   - 自訂「確認訊息」
   - 例如：「感謝您的回饋！我們會盡快處理。」

## 🔒 隱私與安全建議

1. **限制存取**（選填）：
   - 在表單設定中可限制只有特定使用者可以填寫
   - 但通常回饋表單應開放給所有人

2. **資料保護**：
   - 不要收集敏感資訊（如密碼、信用卡號等）
   - 遵守 GDPR 和其他隱私法規

3. **回應管理**：
   - 定期檢查和回覆回饋
   - 建立回應處理流程

## 📝 表單範本建議

### 簡化版（快速設定）

1. **回饋類型**：單選（功能建議 / BUG 回報 / 其他）
2. **詳細說明**：段落文字（必填）
3. **聯絡方式**：簡答文字（選填）

### 完整版（詳細收集）

1. **回饋類型**：單選
2. **頁面/功能**：簡答文字
3. **詳細說明**：段落文字（必填）
4. **截圖**：檔案上傳
5. **聯絡方式**：簡答文字
6. **優先級**：單選（高 / 中 / 低）

## ⭐ Premium 會員自動標記

系統會自動在表單 URL 中添加 Premium 狀態參數，讓您能夠識別 Premium 會員的回饋。

### URL 參數說明

當用戶點擊回饋按鈕時，URL 會自動包含：
- `premium=true`（Premium 會員）或 `premium=false`（免費用戶）
- `user_type=premium` 或 `user_type=free`

**範例 URL：**
```
https://forms.gle/xxxxx?premium=true&user_type=premium
```

### 在 Google Form 中使用

#### 方法 1：使用 Google Apps Script（自動填入）

1. **在 Google Form 中添加「會員類型」欄位**
   - 新增一個「簡答」類型的問題
   - 標題：`會員類型` 或 `Premium 狀態`
   - 設為選填（因為會自動填入）

2. **建立 Google Apps Script**
   - 在 Google Form 中點擊「⋮」→「指令碼編輯器」
   - 貼上以下腳本：

```javascript
function onFormSubmit(e) {
  // 取得表單回應
  const formResponse = e.response;
  const itemResponses = formResponse.getItemResponses();
  
  // 從 URL 參數取得 Premium 狀態（需要在表單提交時傳遞）
  // 注意：Google Form 不直接支援 URL 參數，需要使用其他方法
}

// 替代方案：使用表單預填連結
function createPrefilledLink() {
  const form = FormApp.getActiveForm();
  const items = form.getItems();
  
  // 找到「會員類型」欄位
  let memberTypeItem = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].getTitle() === "會員類型") {
      memberTypeItem = items[i].asTextItem();
      break;
    }
  }
  
  if (memberTypeItem) {
    // 建立預填連結（Premium）
    const prefilledUrl = form.getPublishedUrl() + 
      "?entry." + memberTypeItem.getId() + "=Premium會員";
    Logger.log("Premium 預填連結: " + prefilledUrl);
  }
}
```

#### 方法 2：使用 Tally Form（更簡單，推薦）

Tally Form 支援 URL 參數預填，設定更簡單：

1. **建立 Tally Form**
   - 前往 [Tally](https://tally.so)
   - 建立新表單

2. **添加「會員類型」欄位**
   - 新增「簡答」或「單選」欄位
   - 標題：`會員類型`
   - 在欄位設定中啟用「預填」

3. **設定預填變數**
   - 在欄位設定中，設定預填變數名稱為 `user_type`
   - 或使用 `premium` 參數

4. **表單會自動讀取 URL 參數**
   - 當 URL 包含 `?user_type=premium` 時，欄位會自動填入「premium」
   - 當 URL 包含 `?user_type=free` 時，欄位會自動填入「free」

#### 方法 3：手動查看（最簡單）

1. **在表單回應中查看**
   - 前往 Google Form → 「回應」標籤
   - 查看每個回應的提交時間
   - 在回應詳情中查看提交來源（如果 Google Form 有記錄）

2. **使用 Google Sheets 分析**
   - 將回應匯出到 Google Sheets
   - 手動標記 Premium 會員（根據 Email 或 User ID）

### 在表單回應中識別 Premium 會員

**建議做法：**

1. **添加「會員類型」欄位到表單**
   - 設為「簡答」類型
   - 標題：「會員類型（系統自動填入）」
   - 在說明中告知用戶：「此欄位會自動填入，無需手動填寫」

2. **使用表單預填功能**
   - 建立兩個不同的表單連結：
     - Premium 會員連結：包含 `?entry.xxxxx=Premium會員`
     - 免費用戶連結：包含 `?entry.xxxxx=免費用戶`
   - 但這需要修改 FeedbackButton 來使用不同的連結

3. **在回應中手動標記**
   - 根據用戶 Email 查詢 Premium 狀態
   - 在 Google Sheets 中添加「Premium 狀態」欄位

## ✅ 檢查清單

- [ ] 建立 Google Form 並設定問題
- [ ] 添加「會員類型」欄位（用於標記 Premium）
- [ ] 取得表單分享連結
- [ ] 測試表單提交功能
- [ ] 在 `.env.local` 設定環境變數
- [ ] 重新啟動開發伺服器
- [ ] 驗證回饋按鈕顯示和功能
- [ ] 測試 Premium 會員標記功能
- [ ] 在部署環境設定環境變數
- [ ] 測試生產環境功能

## 🆘 常見問題

### Q: 按鈕沒有顯示？
A: 檢查環境變數是否正確設定，並確認變數名稱是 `NEXT_PUBLIC_FEEDBACK_FORM_URL`（必須以 `NEXT_PUBLIC_` 開頭）

### Q: 連結無法開啟？
A: 確認表單連結是否正確，並檢查表單是否設為「任何人都可以填寫」

### Q: 如何變更按鈕樣式？
A: 編輯 `src/components/feedback-button.tsx` 中的 Tailwind CSS 類別

### Q: 可以同時使用多個表單嗎？
A: 目前設計為單一表單，如需多個表單，可以修改組件支援多個按鈕或表單選擇

