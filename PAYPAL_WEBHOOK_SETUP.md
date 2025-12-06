# PayPal Webhook 設定完整指南

本指南詳細說明如何設定 PayPal Webhook（IPN 通知），**不需要購買網域**，使用 Vercel 免費域名即可。

## 🎯 快速答案

**不需要購買網域！** 您可以使用 Vercel 提供的免費域名，格式為：
```
https://your-project-name.vercel.app/api/webhooks/paypal
```

---

## 📋 完整設定步驟

### 步驟 1：確認 Vercel 部署 URL

1. **前往 Vercel Dashboard**
   - 網址：https://vercel.com/dashboard
   - 登入您的 Vercel 帳號

2. **查看專案 URL**
   - 選擇您的專案
   - 在專案概覽頁面，您會看到部署 URL
   - 格式：`https://your-project-name.vercel.app`

3. **如果還沒有部署**
   - 先完成 Vercel 部署（參考 [Vercel 部署指南](./VERCEL_DEPLOYMENT.md)）
   - 部署完成後會自動獲得免費域名

### 步驟 2：確認 Webhook 端點已部署

確認您的應用已包含 Webhook 端點：

- 檔案位置：`src/app/api/webhooks/paypal/route.ts`
- 端點 URL：`https://your-project-name.vercel.app/api/webhooks/paypal`

### 步驟 3：在 PayPal 設定 IPN 通知 URL

1. **登入 PayPal Business Dashboard**
   - 前往：https://www.paypal.com/businessmanage
   - 使用您的 PayPal 商家帳號登入

2. **前往 IPN 設定頁面**

   **方法 A：從設定選單**
   - 點擊右上角「**設定**」（Settings）圖示（齒輪圖示）
   - 選擇「**網站偏好設定**」（Website preferences）
   - 找到「**即時付款通知 (IPN)**」區塊

   **方法 B：直接訪問**
   - 前往：https://www.paypal.com/businessmanage/account/website-preferences
   - 找到「**即時付款通知 (IPN)**」區塊

3. **啟用 IPN 通知**
   - 點擊「**更新**」或「**啟用**」按鈕
   - 如果已經啟用，點擊「**編輯**」

4. **輸入通知 URL**
   - 在「**通知 URL**」欄位中輸入：
     ```
     https://your-project-name.vercel.app/api/webhooks/paypal
     ```
   - **重要**：將 `your-project-name.vercel.app` 替換為您實際的 Vercel 域名
   
   **範例**：
   ```
   https://fitness-tracker-abc123.vercel.app/api/webhooks/paypal
   ```

5. **儲存設定**
   - 點擊「**儲存**」或「**啟用**」
   - PayPal 可能會驗證 URL 是否可訪問

### 步驟 4：測試 Webhook（推薦）

#### 方法 A：使用 PayPal IPN 測試工具

1. **前往 PayPal IPN 測試工具**
   - 網址：https://developer.paypal.com/developer/ipnSimulator
   - 或從 PayPal Business Dashboard → 工具 → IPN 測試工具

2. **發送測試通知**
   - 輸入您的 Webhook URL：`https://your-project-name.vercel.app/api/webhooks/paypal`
   - 選擇測試事件類型（例如：Payment completed）
   - 點擊「**發送測試 IPN**」

3. **檢查結果**
   - 查看測試結果
   - 如果成功，會顯示 "IPN was sent and the handler returned HTTP 200"

#### 方法 B：完成一筆測試付款

1. **使用 PayPal 沙盒環境測試**
   - 在開發環境中完成一筆測試付款
   - 檢查 Vercel 日誌確認 Webhook 有收到通知

2. **檢查 Supabase**
   - 確認訂閱狀態是否自動更新
   - 檢查 `is_premium` 和 `subscription_end_date` 是否正確

### 步驟 5：檢查 Vercel 日誌

1. **前往 Vercel Dashboard**
   - 選擇您的專案
   - 前往「**Deployments**」頁面

2. **查看函數日誌**
   - 點擊最新的部署
   - 前往「**Functions**」標籤
   - 選擇 `api/webhooks/paypal`
   - 查看日誌確認是否有收到 PayPal 通知

---

## 🔍 常見問題

### Q1：一定要購買網域嗎？

**A：不需要！** 您可以使用 Vercel 提供的免費域名（`your-project.vercel.app`）。PayPal 支援任何有效的 HTTPS URL，包括 Vercel 免費域名。

### Q2：Vercel 免費域名會變嗎？

**A：不會。** 一旦專案部署到 Vercel，域名就會固定。除非您刪除專案，否則域名不會改變。

### Q3：可以之後改用自訂網域嗎？

**A：可以。** 如果之後購買了自訂網域：
1. 在 Vercel 設定自訂網域
2. 更新 PayPal IPN URL 為新的域名
3. Webhook 會繼續正常運作

### Q4：如何找到我的 Vercel 域名？

**A：**
1. 前往 Vercel Dashboard
2. 選擇您的專案
3. 在專案概覽頁面會顯示部署 URL
4. 或在 Deployments 頁面查看

### Q5：Webhook URL 必須是 HTTPS 嗎？

**A：是的。** PayPal 要求 Webhook URL 必須使用 HTTPS。Vercel 自動提供 HTTPS，所以不需要額外設定。

### Q6：如何確認 Webhook 是否正常運作？

**A：**
1. 使用 PayPal IPN 測試工具發送測試通知
2. 檢查 Vercel 函數日誌
3. 完成一筆測試付款，確認訂閱狀態自動更新

---

## ✅ 檢查清單

完成以下步驟後，PayPal Webhook 就設定完成了：

- [ ] 確認 Vercel 部署 URL（例如：`https://your-project.vercel.app`）
- [ ] 確認 Webhook 端點已部署（`/api/webhooks/paypal`）
- [ ] 在 PayPal Business Dashboard 設定 IPN 通知 URL
- [ ] 使用 PayPal IPN 測試工具測試（可選但推薦）
- [ ] 檢查 Vercel 日誌確認 Webhook 正常運作
- [ ] 完成一筆測試付款驗證功能

---

## 📝 範例設定

### 假設您的 Vercel 專案名稱是 `fitness-tracker-abc123`

那麼您的 Webhook URL 應該是：
```
https://fitness-tracker-abc123.vercel.app/api/webhooks/paypal
```

在 PayPal Business Dashboard 中設定此 URL 即可。

---

## 🆘 需要協助？

如果遇到問題：

1. **檢查 Vercel 部署狀態**
   - 確認應用已成功部署
   - 確認 Webhook 端點可以訪問

2. **檢查 PayPal IPN 設定**
   - 確認 URL 格式正確
   - 確認已啟用 IPN 通知

3. **查看日誌**
   - Vercel 函數日誌
   - PayPal IPN 歷史記錄

4. **測試 Webhook**
   - 使用 PayPal IPN 測試工具
   - 檢查返回的狀態碼

---

**記住：不需要購買網域，Vercel 免費域名就足夠了！** 🎉



