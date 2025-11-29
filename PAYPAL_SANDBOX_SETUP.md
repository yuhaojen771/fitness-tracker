# PayPal 沙盒環境設定完整指南

本指南將詳細說明如何設定 PayPal 沙盒（Sandbox）環境，用於測試訂閱付款功能。

## 📋 目錄

1. [建立 PayPal Developer 帳號](#1-建立-paypal-developer-帳號)
2. [建立沙盒應用程式](#2-建立沙盒應用程式)
3. [建立沙盒測試帳號](#3-建立沙盒測試帳號)
4. [建立付款連結](#4-建立付款連結)
5. [設定環境變數](#5-設定環境變數)
6. [測試付款流程](#6-測試付款流程)
7. [疑難排解](#7-疑難排解)

---

## 1. 建立 PayPal Developer 帳號

### 步驟 1.1：前往 PayPal Developer 網站

1. 前往 [PayPal Developer Dashboard](https://developer.paypal.com/)
2. 點擊右上角的「登入」或「註冊」

### 步驟 1.2：登入或註冊

- **已有 PayPal 帳號**：直接使用 PayPal 個人或商家帳號登入
- **沒有 PayPal 帳號**：
  1. 點擊「建立帳號」
  2. 選擇「個人帳號」或「商家帳號」（建議選擇商家帳號）
  3. 填寫基本資料完成註冊

---

## 2. 建立沙盒應用程式

### 步驟 2.1：進入應用程式頁面

1. 登入後，點擊左側選單的「**應用程式**」（Apps）
2. 點擊「**建立應用程式**」（Create App）按鈕

### 步驟 2.2：設定應用程式資訊

填寫以下資訊：

- **應用程式名稱**：例如 `Fitness Tracker - Sandbox`
- **商家帳號**：選擇您的沙盒商家帳號（如果有多個）
- **功能**：選擇「**付款**」（Payments）

### 步驟 2.3：選擇環境

- 選擇「**沙盒**」（Sandbox）環境
- 點擊「**建立應用程式**」

### 步驟 2.4：取得 API 憑證（可選）

建立完成後，您會看到：
- **Client ID**
- **Secret**

> **注意**：目前我們使用 PayPal Checkout 連結方式，不需要 API 憑證。但保留這些資訊以備未來使用。

---

## 3. 建立沙盒測試帳號

### 步驟 3.1：進入沙盒帳號頁面

1. 在左側選單點擊「**沙盒**」（Sandbox）
2. 點擊「**帳號**」（Accounts）標籤

### 步驟 3.2：建立測試帳號

PayPal 會自動建立兩個測試帳號：

1. **個人帳號**（Personal Account）
   - 用於模擬買家（付款方）
   - 預設有測試餘額

2. **商家帳號**（Business Account）
   - 用於模擬賣家（收款方）
   - 預設有測試餘額

### 步驟 3.3：查看測試帳號資訊

點擊「**檢視/編輯**」可以查看：
- 測試帳號的 Email
- 測試密碼
- 測試餘額

> **重要**：這些是測試帳號，不會進行真實付款。

---

## 4. 建立付款連結

> ⚠️ **注意**：PayPal 的介面可能會更新，如果找不到以下選項，請參考「方法 C：使用測試連結格式」或「方法 D：使用 PayPal API」。

### 方法 A：使用 PayPal Business Dashboard（推薦 - 正式環境）

#### 步驟 4.1：登入 PayPal Business 帳號

1. 前往 [PayPal Business Dashboard](https://www.paypal.com/businessmanage)
2. 使用您的 PayPal 商家帳號登入

#### 步驟 4.2：建立付款連結

1. 登入後，點擊頁面頂部的「**工具**」（Tools）
2. 選擇「**所有工具**」（All Tools）
3. 找到「**PayPal 按鈕**」（PayPal Buttons）或「**建立付款連結**」（Create Payment Link）
4. 點擊「**建立新按鈕**」（Create New Button）
5. 選擇按鈕類型：選擇「**購買**」（Buy Now）
6. 填寫付款資訊：
   - **商品名稱**：例如 `Premium 訂閱 - 月繳方案`
   - **價格**：`3.99`
   - **貨幣**：`USD`
7. 點擊「**建立按鈕**」
8. 複製生成的付款連結 URL（通常在「**連結**」或「**URL**」欄位）

#### 步驟 4.3：建立年繳方案連結

重複步驟 4.2，建立年繳方案連結：
- **商品名稱**：`Premium 訂閱 - 年繳方案`
- **價格**：`39.99`
- **貨幣**：`USD`

### 方法 B：使用 PayPal 沙盒測試網站

#### 步驟 4.1：登入沙盒商家帳號

1. 在 PayPal Developer Dashboard 中，前往「**沙盒**」（Sandbox）→「**帳號**」（Accounts）
2. 找到您的**商家測試帳號**（Business Account）
3. 點擊「**進入沙盒測試網站**」（Enter Sandbox Test Site）或「**登入**」（Login）

#### 步驟 4.2：建立付款連結

1. 登入沙盒測試網站後，嘗試以下路徑：
   - 點擊「**工具**」（Tools）→「**所有工具**」（All Tools）
   - 尋找「**PayPal 按鈕**」或「**建立付款連結**」
   - 或直接前往：`https://www.sandbox.paypal.com/businessmanage/money/buttons`

2. 如果找不到，嘗試以下替代方法：
   - 在沙盒測試網站中搜尋「button」或「payment link」
   - 查看左側選單是否有「**工具**」或「**付款**」選項

### 方法 C：使用測試連結格式（最簡單 - 用於快速測試）

如果您無法找到建立付款連結的選項，可以使用以下測試連結格式：

```env
# 月繳方案測試連結（請替換 YOUR_TOKEN 為實際的 token）
NEXT_PUBLIC_PAYPAL_TEST_URL=https://www.sandbox.paypal.com/checkoutnow?token=YOUR_TOKEN

# 或使用 PayPal 按鈕格式
NEXT_PUBLIC_PAYPAL_TEST_URL=https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID
```

**如何取得 Token 或 Button ID**：
- 如果您有 PayPal 商家帳號，可以在建立按鈕後從 HTML 代碼中取得
- 或者使用 PayPal API 來生成付款連結（見方法 D）

### 方法 D：使用 PayPal API 生成付款連結（進階）

如果您熟悉 API 整合，可以使用 PayPal Orders API 來生成付款連結：

1. 使用您在步驟 2.4 取得的 **Client ID** 和 **Secret**
2. 使用 PayPal Orders API 建立訂單
3. 從回應中取得付款連結

**API 文件**：[PayPal Orders API](https://developer.paypal.com/docs/api/orders/v2/)

### 方法 E：暫時使用模擬付款（開發階段）

在開發階段，如果暫時無法取得 PayPal 連結，可以：

1. 不設定 `NEXT_PUBLIC_PAYPAL_TEST_URL`
2. 系統會自動使用模擬升級功能
3. 在 Supabase 手動更新 `is_premium` 狀態進行測試

---

## 🔍 找不到建立付款連結選項的解決方案

### 方案 1：檢查帳號類型

- 確認您使用的是**商家帳號**（Business Account），不是個人帳號
- 個人帳號可能沒有建立付款連結的權限

### 方案 2：使用 PayPal Button Generator

1. 前往 [PayPal Button Generator](https://www.paypal.com/buttonfactory/)
2. 選擇按鈕類型：「**購買**」（Buy Now）
3. 填寫商品資訊和價格
4. 點擊「**建立按鈕**」
5. 複製生成的 HTML 代碼中的連結部分

### 方案 3：聯繫 PayPal 支援

如果以上方法都無法使用，建議：
1. 聯繫 [PayPal 客戶服務](https://www.paypal.com/help)
2. 詢問如何在沙盒環境中建立付款連結
3. 或詢問最新的付款連結建立方式

---

## 5. 設定環境變數

### 步驟 5.1：建立 .env.local 檔案

在專案根目錄（`fitness-tracker/`）建立 `.env.local` 檔案：

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# 或使用文字編輯器直接建立
```

### 步驟 5.2：填入環境變數

在 `.env.local` 檔案中填入以下內容：

```env
# ============================================
# PayPal 金流設定
# ============================================

# PayPal 沙盒環境（Sandbox）測試連結
# 用於開發環境（development）下的 PayPal 付款測試
# 請將 YOUR_SANDBOX_TOKEN 替換為步驟 4.2 取得的實際連結
NEXT_PUBLIC_PAYPAL_TEST_URL=https://www.sandbox.paypal.com/checkoutnow?token=YOUR_SANDBOX_TOKEN

# PayPal 正式環境（Live）付款連結（暫時留空，正式部署時再填入）
# 用於正式部署環境（production）下的 PayPal 付款
NEXT_PUBLIC_PAYPAL_LIVE_URL=
```

### 步驟 5.3：替換實際連結

將 `YOUR_SANDBOX_TOKEN` 替換為您在步驟 4.2 取得的實際 PayPal 付款連結。

**範例**：
```env
NEXT_PUBLIC_PAYPAL_TEST_URL=https://www.sandbox.paypal.com/checkoutnow?token=EC-1234567890ABCDEF
```

---

## 6. 測試付款流程

### 步驟 6.1：啟動開發伺服器

```bash
npm run dev
```

### 步驟 6.2：測試付款流程

1. 在瀏覽器中開啟應用（通常是 `http://localhost:3000`）
2. 登入您的帳號
3. 點擊「**訂閱狀態**」或「**立即升級 Premium**」
4. 選擇訂閱方案（月繳或年繳）
5. 點擊「**立即訂閱**」按鈕
6. 應該會跳轉到 PayPal 沙盒付款頁面

### 步驟 6.3：使用測試帳號付款

1. 在 PayPal 沙盒付款頁面，使用步驟 3.2 建立的**個人測試帳號**登入
2. 完成付款流程（使用測試餘額）
3. 付款完成後，會跳轉回您的應用

### 步驟 6.4：手動更新訂閱狀態

由於目前使用手動金流方式，付款完成後需要：

1. 登入 [Supabase Dashboard](https://app.supabase.com/)
2. 前往「**Table Editor**」→「**profiles**」表
3. 找到您的用戶記錄
4. 更新以下欄位：
   - `is_premium`：設為 `true`
   - `subscription_end_date`：設為到期日期（例如：月繳為 1 個月後，年繳為 1 年後）

**SQL 範例**：
```sql
-- 更新為 Premium 會員（年繳方案，1 年後到期）
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = CURRENT_DATE + INTERVAL '1 year'
WHERE id = 'your-user-id';
```

---

## 7. 疑難排解

### 問題 1：無法登入 PayPal Developer Dashboard

**解決方案**：
- 確認使用正確的 PayPal 帳號登入
- 清除瀏覽器快取和 Cookie
- 嘗試使用無痕模式

### 問題 2：找不到「建立付款連結」選項

**解決方案**：
- 確認已登入**商家測試帳號**（不是個人測試帳號）
- 前往「工具」→「所有工具」查看完整選單
- 或使用 PayPal Business Dashboard 建立連結

### 問題 3：付款連結無法使用

**解決方案**：
- 確認連結是從**沙盒環境**建立的（URL 應包含 `sandbox.paypal.com`）
- 檢查環境變數是否正確設定
- 確認已重新啟動開發伺服器（修改 `.env.local` 後需要重啟）

### 問題 4：環境變數未生效

**解決方案**：
1. 確認檔案名稱是 `.env.local`（不是 `.env` 或 `.env.example`）
2. 確認環境變數以 `NEXT_PUBLIC_` 開頭
3. 重新啟動開發伺服器：
   ```bash
   # 停止伺服器（Ctrl + C）
   # 重新啟動
   npm run dev
   ```

### 問題 5：付款後無法返回應用

**解決方案**：
- 這是正常的，因為目前使用手動金流
- 付款完成後，手動在 Supabase 更新訂閱狀態
- 未來可以實作 Webhook 來自動處理

---

## 📚 相關資源

- [PayPal Developer 文件](https://developer.paypal.com/docs/)
- [PayPal 沙盒測試指南](https://developer.paypal.com/docs/api-basics/sandbox/)
- [PayPal Checkout 文件](https://developer.paypal.com/docs/checkout/)

---

## ✅ 檢查清單

完成以下步驟後，您就成功設定了 PayPal 沙盒環境：

- [ ] 建立 PayPal Developer 帳號
- [ ] 建立沙盒應用程式
- [ ] 建立沙盒測試帳號（個人和商家）
- [ ] 建立付款連結（月繳和年繳）
- [ ] 設定 `.env.local` 環境變數
- [ ] 重新啟動開發伺服器
- [ ] 測試付款流程
- [ ] 確認可以跳轉到 PayPal 沙盒付款頁面

---

## 🎯 下一步

設定完成後，您可以：

1. **測試完整付款流程**：從點擊訂閱到完成付款
2. **測試不同方案**：測試月繳和年繳方案
3. **實作 Webhook**：未來可以實作自動更新訂閱狀態
4. **準備正式環境**：準備 PayPal 正式環境的設定

---

**需要協助？** 如有任何問題，請參考 [PayPal 官方文件](https://developer.paypal.com/docs/) 或聯繫 PayPal 支援。

