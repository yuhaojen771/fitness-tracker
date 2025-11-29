# 綠界（ECPay）金流整合設定指南

本指南說明如何設定綠界（ECPay）金流服務，讓台灣用戶可以使用本地付款方式。

## 📋 概述

綠界科技是台灣主要的第三方金流服務提供商，支援：
- 信用卡付款
- ATM 轉帳
- 超商代碼
- 手機條碼
- 其他台灣本地付款方式

## 🔧 設定步驟

### 步驟 1：註冊綠界商家帳號

1. **前往綠界科技官網**
   - 網址：https://www.ecpay.com.tw/
   - 點擊「免費註冊」或「商家專區」

2. **填寫商家資料**
   - 公司/個人資料
   - 聯絡資訊
   - 銀行帳戶資訊（用於收款）

3. **完成審核**
   - 等待綠界審核（通常 1-3 個工作天）
   - 審核通過後會收到商家代號（MerchantID）和金鑰

### 步驟 2：取得 API 金鑰

登入綠界商家後台後：

1. **前往「系統開發介接」**
   - 路徑：商家後台 → 系統開發介接

2. **取得以下資訊**：
   - **MerchantID**（商店代號）
   - **HashKey**（金鑰）
   - **HashIV**（向量）

3. **選擇測試或正式環境**：
   - **測試環境**：用於開發測試，不會產生實際交易
   - **正式環境**：用於正式上線，會產生實際交易

### 步驟 3：設定環境變數

#### 在本地開發環境（.env.local）

```env
# 綠界商家資訊
ECPAY_MERCHANT_ID=your_merchant_id
ECPAY_HASH_KEY=your_hash_key
ECPAY_HASH_IV=your_hash_iv

# 測試模式（true = 測試環境，false 或未設定 = 正式環境）
ECPAY_TEST_MODE=true

# 應用程式網址（用於回傳 URL）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 在 Vercel 生產環境

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 進入 **Settings** → **Environment Variables**
4. 添加以下環境變數：

```
Name: ECPAY_MERCHANT_ID
Value: [您的商店代號]
Environment: Production, Preview, Development（全部勾選）

Name: ECPAY_HASH_KEY
Value: [您的 HashKey]
Environment: Production, Preview, Development（全部勾選）

Name: ECPAY_HASH_IV
Value: [您的 HashIV]
Environment: Production, Preview, Development（全部勾選）

Name: ECPAY_TEST_MODE
Value: false（正式環境）或 true（測試環境）
Environment: Production, Preview, Development（全部勾選）

Name: NEXT_PUBLIC_APP_URL
Value: https://your-domain.vercel.app
Environment: Production, Preview, Development（全部勾選）
```

### 步驟 4：設定回傳 URL

在綠界商家後台設定：

1. **前往「系統開發介接」→「回傳網址設定」**
2. **設定以下 URL**：
   - **付款完成回傳網址**：`https://your-domain.vercel.app/api/webhooks/ecpay/return`
   - **付款結果回傳網址**：`https://your-domain.vercel.app/api/webhooks/ecpay/return`

⚠️ **重要**：將 `your-domain.vercel.app` 替換為您實際的 Vercel 部署網址。

## 💰 價格設定

目前設定的價格（新台幣）：
- **月繳方案**：NT$120/月
- **年繳方案**：NT$1,200/年

如需修改價格，請編輯 `src/app/api/ecpay/create-payment/route.ts` 中的 `prices` 物件。

## 🔄 付款流程

1. **用戶選擇方案和付款方式**
   - 在 Premium Modal 中選擇「綠界金流（台灣）」
   - 選擇月繳或年繳方案

2. **建立付款訂單**
   - 前端調用 `/api/ecpay/create-payment`
   - API 建立訂單並返回付款表單資料

3. **跳轉到綠界付款頁面**
   - 自動提交表單到綠界付款頁面
   - 用戶選擇付款方式（信用卡、ATM、超商等）

4. **付款完成**
   - 綠界處理付款
   - 回傳結果到 `/api/webhooks/ecpay/return`

5. **自動更新訂閱狀態**
   - Webhook 驗證付款結果
   - 更新用戶的 `is_premium` 和 `subscription_end_date`

## ✅ 檢查清單

### 綠界設定
- [ ] 註冊綠界商家帳號
- [ ] 完成商家審核
- [ ] 取得 MerchantID、HashKey、HashIV
- [ ] 設定回傳 URL
- [ ] 測試付款流程（測試環境）

### 環境變數設定
- [ ] 設定 `ECPAY_MERCHANT_ID`
- [ ] 設定 `ECPAY_HASH_KEY`
- [ ] 設定 `ECPAY_HASH_IV`
- [ ] 設定 `ECPAY_TEST_MODE`（測試/正式）
- [ ] 設定 `NEXT_PUBLIC_APP_URL`

### 應用整合
- [ ] 更新環境變數（本地和 Vercel）
- [ ] 部署應用
- [ ] 測試付款流程
- [ ] 測試 Webhook 自動更新訂閱狀態
- [ ] 確認訂閱狀態正確更新

### 功能驗證
- [ ] 用戶點擊「立即訂閱」跳轉到綠界付款頁面
- [ ] 完成付款後 Webhook 收到通知
- [ ] 訂閱狀態自動更新為 Premium
- [ ] 到期日正確計算（月繳 +1 個月，年繳 +1 年）

## 🧪 測試

### 測試環境

1. **設定測試模式**：
   ```env
   ECPAY_TEST_MODE=true
   ```

2. **使用測試卡號**：
   - 綠界會提供測試用的信用卡號碼
   - 可在綠界商家後台找到測試資訊

3. **測試付款流程**：
   - 建立測試訂單
   - 使用測試卡號完成付款
   - 確認 Webhook 收到通知
   - 確認訂閱狀態更新

### 正式環境

1. **關閉測試模式**：
   ```env
   ECPAY_TEST_MODE=false
   ```

2. **使用真實付款方式**：
   - 信用卡付款
   - ATM 轉帳
   - 超商代碼

## 🔒 安全性

1. **保護金鑰**：
   - 絕對不要將 `ECPAY_HASH_KEY` 和 `ECPAY_HASH_IV` 提交到 Git
   - 只在環境變數中設定

2. **驗證檢查碼**：
   - Webhook 會驗證 CheckMacValue
   - 確保付款通知來自綠界

3. **HTTPS**：
   - 確保所有回傳 URL 使用 HTTPS
   - Vercel 自動提供 HTTPS

## 📞 支援

- **綠界官方文件**：https://www.ecpay.com.tw/Service/API_Dwnld
- **綠界技術支援**：https://www.ecpay.com.tw/Service/ContactUs
- **API 文件**：https://www.ecpay.com.tw/Service/API_Dwnld

## 🆚 PayPal vs 綠界

| 特性 | PayPal | 綠界（ECPay） |
|------|--------|---------------|
| 適用地區 | 全球（200+ 國家） | 台灣 |
| 付款方式 | 信用卡、PayPal 餘額 | 信用卡、ATM、超商、手機條碼等 |
| 幣別 | USD | TWD（新台幣） |
| 手續費 | 約 3.4% + 固定費用 | 依付款方式而定 |
| 審核時間 | 即時 | 1-3 個工作天 |
| 適合對象 | 國際用戶 | 台灣本地用戶 |

## 💡 建議

- **台灣用戶**：優先使用綠界金流（本地化體驗更好）
- **其他亞洲國家**：使用 PayPal（覆蓋大部分亞洲市場）
- **兩者並存**：讓用戶自行選擇付款方式

## 🌏 亞洲市場覆蓋

### 目前配置（綠界 + PayPal）可以覆蓋：

✅ **約 90% 的亞洲市場**，包括：
- 🇹🇼 **台灣**：綠界（最佳體驗）
- 🇭🇰 **香港**、🇸🇬 **新加坡**、🇲🇾 **馬來西亞**、🇹🇭 **泰國**、🇵🇭 **菲律賓**、🇮🇩 **印尼**、🇻🇳 **越南**、🇰🇷 **韓國**、🇯🇵 **日本**、🇮🇳 **印度** 等：PayPal

⚠️ **無法很好覆蓋**：
- 🇨🇳 **中國大陸**：PayPal 支援有限，如需服務中國用戶，建議添加支付寶/微信支付

詳細的亞洲市場覆蓋分析請參考 `ASIA_PAYMENT_COVERAGE.md`。

