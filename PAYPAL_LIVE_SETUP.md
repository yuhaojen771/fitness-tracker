# PayPal 正式環境設定指南

> ⚠️ **注意**：PayPal 商家帳號可能需要美國銀行帳號。如果您無法連結銀行帳號，請參考 [付款方式替代方案](./PAYMENT_ALTERNATIVES.md)。

本指南將詳細說明如何設定 PayPal 正式環境（Live），用於實際的訂閱付款功能。

## 📋 目錄

1. [準備工作](#1-準備工作)
2. [建立 PayPal 商家帳號](#2-建立-paypal-商家帳號)
3. [建立付款連結](#3-建立付款連結)
4. [設定環境變數](#4-設定環境變數)
5. [部署到正式環境](#5-部署到正式環境)
6. [測試正式付款](#6-測試正式付款)
7. [重要注意事項](#7-重要注意事項)

---

## 1. 準備工作

### 需要準備的資料

- ✅ PayPal 商家帳號（Business Account）
- ✅ 銀行帳號資訊（用於收款）
- ✅ 身份驗證文件（可能需要）
- ✅ 商品/服務資訊（訂閱方案詳情）

---

## 2. 建立 PayPal 商家帳號

### 步驟 2.1：前往 PayPal 註冊頁面

1. 前往 [PayPal 商家帳號註冊](https://www.paypal.com/businessmanage/account/standalone)
2. 或前往 [PayPal 首頁](https://www.paypal.com/) → 點擊「**商家**」→「**立即開始**」

### 步驟 2.2：選擇帳號類型

選擇「**商家帳號**」（Business Account）

### 步驟 2.3：填寫商家資訊

填寫以下資訊：
- **商家名稱**：例如 `健康追蹤服務` 或您的公司名稱
- **Email 地址**：用於登入和管理
- **密碼**：設定安全密碼
- **電話號碼**：用於驗證
- **商家類型**：選擇適合的類型（個人商家、公司等）

### 步驟 2.4：完成驗證

1. 驗證 Email 地址
2. 驗證電話號碼
3. 可能需要提供身份證明文件（視地區而定）
4. 連結銀行帳號（用於收款）

---

## 3. 建立付款連結

### 方法 A：使用 PayPal Business Dashboard（推薦）

#### 步驟 3.1：登入 PayPal Business Dashboard

1. 前往 [PayPal Business Dashboard](https://www.paypal.com/businessmanage)
2. 使用您的商家帳號登入

#### 步驟 3.2：建立付款按鈕

1. 登入後，點擊頁面頂部的「**工具**」（Tools）
2. 選擇「**所有工具**」（All Tools）
3. 找到「**PayPal 按鈕**」（PayPal Buttons）
4. 點擊「**建立新按鈕**」（Create New Button）

#### 步驟 3.3：設定月繳方案按鈕

填寫以下資訊：

- **按鈕類型**：選擇「**購買**」（Buy Now）
- **商品名稱**：`Premium 訂閱 - 月繳方案`
- **價格**：`3.99`
- **貨幣**：`USD`
- **按鈕樣式**：選擇您喜歡的樣式

點擊「**建立按鈕**」（Create Button）

#### 步驟 3.4：取得付款連結

建立按鈕後，您會看到：

1. **HTML 代碼**：可以嵌入到網站中
2. **連結 URL**：可以直接使用的付款連結

**取得連結的方式**：

**方式 1：從 HTML 代碼中提取**
```html
<form action="https://www.paypal.com/cgi-bin/webscr" method="post">
  <input type="hidden" name="cmd" value="_s-xclick">
  <input type="hidden" name="hosted_button_id" value="YOUR_BUTTON_ID">
  ...
</form>
```

從中取得 `hosted_button_id`，然後建立連結：
```
https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID
```

**方式 2：直接複製連結**
- 如果 PayPal 提供直接連結，直接複製使用

#### 步驟 3.5：建立年繳方案按鈕

重複步驟 3.3，建立年繳方案：
- **商品名稱**：`Premium 訂閱 - 年繳方案`
- **價格**：`39.99`
- **貨幣**：`USD`

### 方法 B：使用 PayPal Button Generator

1. 前往 [PayPal Button Generator](https://www.paypal.com/buttonfactory/)
2. 選擇「**購買**」（Buy Now）按鈕
3. 填寫商品資訊和價格
4. 建立按鈕後，從 HTML 代碼中取得連結

### 方法 C：使用 PayPal Checkout 連結

如果您使用 PayPal Checkout：

1. 在 PayPal Business Dashboard 中
2. 前往「**工具**」→「**建立付款連結**」（Create Payment Link）
3. 填寫付款資訊
4. 複製生成的付款連結 URL

---

## 4. 設定環境變數

### 步驟 4.1：本地開發環境（.env.local）

在專案根目錄的 `.env.local` 檔案中設定：

```env
# ============================================
# PayPal 正式環境設定
# ============================================

# PayPal 正式環境（Live）付款連結
# 用於正式部署環境（production）下的 PayPal 付款
NEXT_PUBLIC_PAYPAL_LIVE_URL=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID

# 如果您想在本機開發環境也使用正式連結（不推薦，但可以設定）
# NEXT_PUBLIC_PAYPAL_TEST_URL=
```

> ⚠️ **注意**：在本地開發環境使用正式 PayPal 連結會產生真實付款，建議僅在正式部署時使用。

### 步驟 4.2：Vercel 部署環境

在 Vercel Dashboard 中設定環境變數：

1. 前往您的 Vercel 專案
2. 點擊「**Settings**」→「**Environment Variables**」
3. 新增以下環境變數：

```
NEXT_PUBLIC_PAYPAL_LIVE_URL = https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID
```

4. 選擇環境：
   - **Production**：正式環境
   - **Preview**：預覽環境（可選）
   - **Development**：開發環境（不建議）

5. 點擊「**Save**」

### 步驟 4.3：替換實際連結

將 `YOUR_BUTTON_ID` 替換為您在步驟 3.4 取得的實際按鈕 ID。

**範例**：
```env
NEXT_PUBLIC_PAYPAL_LIVE_URL=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ABC123XYZ789
```

---

## 5. 部署到正式環境

### 步驟 5.1：確認環境變數已設定

在 Vercel Dashboard 中確認：
- ✅ `NEXT_PUBLIC_PAYPAL_LIVE_URL` 已設定
- ✅ 環境選擇為「**Production**」

### 步驟 5.2：重新部署

1. 推送代碼到 GitHub（如果使用 Git 部署）
2. 或在 Vercel Dashboard 中點擊「**Redeploy**」
3. 等待部署完成

### 步驟 5.3：驗證部署

部署完成後，確認：
- ✅ 應用正常運行
- ✅ 環境變數已正確載入
- ✅ 付款連結指向正式 PayPal

---

## 6. 測試正式付款

### ⚠️ 重要警告

**在正式環境中測試會產生真實付款！**

建議：
1. 使用小額金額進行測試（如果可能）
2. 測試後立即退款
3. 或使用 PayPal 的測試模式（如果可用）

### 測試步驟

1. 在正式部署的應用中
2. 點擊「**立即訂閱**」
3. 確認跳轉到正式 PayPal 付款頁面（URL 應為 `paypal.com`，不是 `sandbox.paypal.com`）
4. 完成付款流程
5. 付款完成後，手動在 Supabase 更新 `is_premium` 狀態

---

## 7. 重要注意事項

### 7.1 安全性

- ✅ **不要**將 PayPal 連結提交到 Git
- ✅ 使用環境變數儲存敏感資訊
- ✅ 定期檢查 PayPal 帳號安全設定

### 7.2 付款處理

目前系統使用**手動金流**方式：

1. **用戶完成付款** → PayPal 處理付款
2. **手動更新狀態** → 在 Supabase 中更新 `is_premium` 和 `subscription_end_date`

### 7.3 未來改進建議

建議未來實作以下功能：

1. **PayPal Webhook 整合**
   - 自動接收付款通知
   - 自動更新訂閱狀態
   - 處理退款和取消訂閱

2. **訂閱管理**
   - 自動續訂
   - 取消訂閱功能
   - 訂閱狀態查詢

3. **付款記錄**
   - 記錄所有付款交易
   - 提供付款歷史查詢

### 7.4 法律和合規

- ✅ 確保符合當地法律法規
- ✅ 提供清晰的退款政策
- ✅ 保護用戶隱私和數據安全

---

## 🔍 疑難排解

### 問題 1：付款連結無法使用

**解決方案**：
- 確認連結 URL 正確（應為 `paypal.com`，不是 `sandbox.paypal.com`）
- 確認按鈕 ID 正確
- 檢查 PayPal 帳號狀態是否正常

### 問題 2：環境變數未生效

**解決方案**：
1. 確認環境變數名稱正確（`NEXT_PUBLIC_PAYPAL_LIVE_URL`）
2. 在 Vercel 中確認環境變數已設定
3. 重新部署應用

### 問題 3：付款完成後無法返回

**解決方案**：
- 這是正常的，因為目前使用手動金流
- 付款完成後，手動在 Supabase 更新訂閱狀態
- 未來可以實作 Webhook 來自動處理

---

## ✅ 檢查清單

完成以下步驟後，您就成功設定了 PayPal 正式環境：

- [ ] 建立 PayPal 商家帳號
- [ ] 完成帳號驗證和銀行連結
- [ ] 建立付款按鈕（月繳和年繳）
- [ ] 取得付款連結 URL
- [ ] 在 Vercel 設定環境變數
- [ ] 重新部署應用
- [ ] 測試付款流程（小心！會產生真實付款）
- [ ] 設定付款完成後的手動更新流程

---

## 📚 相關資源

- [PayPal Business Dashboard](https://www.paypal.com/businessmanage)
- [PayPal Button Generator](https://www.paypal.com/buttonfactory/)
- [PayPal 商家幫助中心](https://www.paypal.com/help)
- [PayPal Webhook 文件](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)

---

## 🆘 需要協助？

如有任何問題：
1. 查看 [PayPal 商家幫助中心](https://www.paypal.com/help)
2. 聯繫 PayPal 客戶服務
3. 參考 [PayPal 開發者文件](https://developer.paypal.com/docs/)

---

**祝您設定順利！** 🎉

