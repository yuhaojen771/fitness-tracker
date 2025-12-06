# PayPal 沙盒快速設定指南（簡化版）

如果您在 PayPal 介面中找不到建立付款連結的選項，可以使用以下簡化方法：

## 🚀 最簡單的方法：使用模擬付款（推薦用於開發測試）

### 步驟 1：暫時不設定 PayPal 連結

在 `.env.local` 中，**暫時不設定** `NEXT_PUBLIC_PAYPAL_TEST_URL`：

```env
# 暫時留空，使用模擬付款功能
# NEXT_PUBLIC_PAYPAL_TEST_URL=
```

### 步驟 2：使用模擬升級功能

1. 啟動開發伺服器：`npm run dev`
2. 在應用中點擊「**訂閱狀態**」
3. 點擊「**模擬月繳訂閱**」或「**模擬年繳訂閱**」
4. 系統會自動更新 `is_premium` 狀態

### 步驟 3：手動驗證

在 Supabase 中確認 `is_premium` 已更新為 `true`。

---

## 💡 替代方案：使用 PayPal Button Generator

### 步驟 1：前往 PayPal Button Generator

1. 前往 [PayPal Button Generator](https://www.paypal.com/buttonfactory/)
2. 或搜尋「PayPal Button Generator」

### 步驟 2：建立按鈕

1. 選擇按鈕類型：「**購買**」（Buy Now）
2. 填寫資訊：
   - **商品名稱**：`Premium 訂閱 - 月繳方案`
   - **價格**：`3.99`
   - **貨幣**：`USD`
3. 點擊「**建立按鈕**」

### 步驟 3：取得連結

1. 複製生成的 HTML 代碼
2. 從 HTML 中找到類似以下的連結：
   ```html
   <form action="https://www.paypal.com/cgi-bin/webscr" method="post">
     <input type="hidden" name="cmd" value="_s-xclick">
     <input type="hidden" name="hosted_button_id" value="YOUR_BUTTON_ID">
   ```
3. 使用以下格式建立連結：
   ```
   https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID
   ```

### 步驟 4：設定環境變數

在 `.env.local` 中設定：

```env
NEXT_PUBLIC_PAYPAL_TEST_URL=https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID
```

> **注意**：將 `YOUR_BUTTON_ID` 替換為實際的按鈕 ID，並確保使用 `sandbox.paypal.com`（沙盒環境）。

---

## 🔧 如果 PayPal Button Generator 也無法使用

### 方案 A：使用 PayPal Business Dashboard

1. 登入 [PayPal Business Dashboard](https://www.paypal.com/businessmanage)
2. 點擊「**工具**」→「**所有工具**」
3. 尋找「**PayPal 按鈕**」或「**建立付款連結**」
4. 如果找不到，嘗試搜尋「button」或「payment」

### 方案 B：聯繫 PayPal 支援

1. 前往 [PayPal 幫助中心](https://www.paypal.com/help)
2. 詢問「如何在沙盒環境中建立付款連結」
3. 或詢問「如何取得 PayPal 付款連結 URL」

### 方案 C：使用 PayPal API（進階）

如果您熟悉 API 整合：

1. 使用 PayPal Orders API 建立訂單
2. 從 API 回應中取得付款連結
3. 參考 [PayPal Orders API 文件](https://developer.paypal.com/docs/api/orders/v2/)

---

## ✅ 推薦流程（MVP 階段）

對於 MVP 開發和測試，**推薦使用模擬付款功能**：

1. ✅ **不需要設定 PayPal 連結**
2. ✅ **直接使用模擬升級功能**
3. ✅ **在 Supabase 手動驗證狀態**
4. ✅ **快速測試所有功能**

等產品準備上線時，再設定正式的 PayPal 連結。

---

## 📝 檢查清單

- [ ] 嘗試使用模擬付款功能（最簡單）
- [ ] 嘗試使用 PayPal Button Generator
- [ ] 嘗試在 PayPal Business Dashboard 尋找選項
- [ ] 如果都無法使用，聯繫 PayPal 支援
- [ ] 或暫時使用模擬付款，等正式上線時再設定

---

## 🆘 需要協助？

如果以上方法都無法解決問題，請：
1. 查看 [完整設定指南](./PAYPAL_SANDBOX_SETUP.md)
2. 聯繫 PayPal 客戶服務
3. 或暫時使用模擬付款功能進行開發測試



