# 🧪 簡易訂閱與金流測試指南

本指南說明如何快速測試訂閱功能和金流流程，無需實際付款。

## ⚡ 最快速的測試方法

### 方法 1：使用內建模擬訂閱（推薦）

這是最簡單的方法，無需設定任何環境變數。

#### 步驟：

1. **登入應用**
   - 使用您的 Google 帳號登入

2. **打開訂閱管理**
   - 點擊儀表板上的「訂閱狀態」按鈕
   - 或點擊「管理訂閱」（如果是 Premium 用戶）

3. **啟用測試模式**（如果在非本地環境）
   - 打開瀏覽器開發者工具（F12）
   - 進入 Console（控制台）標籤
   - 執行以下命令：
     ```javascript
     localStorage.setItem('enableTestMode', 'true')
     ```
   - 刷新頁面

4. **模擬訂閱**
   - 在訂閱管理模態框中，點擊「模擬月繳訂閱」或「模擬年繳訂閱」
   - 確認後，Premium 功能會立即啟用

5. **測試 Premium 功能**
   - ✅ 查看完整歷史記錄（超過 7 天）
   - ✅ 查看長期趨勢圖表（90 天）
   - ✅ 使用數據匯出功能
   - ✅ 查看進階報告

6. **取消訂閱測試**
   - 點擊「取消訂閱 / 停止提醒」
   - 驗證 Premium 功能是否保留至到期日

---

### 方法 2：在 Vercel 部署環境中測試

如果您在 Vercel 上測試，需要啟用測試模式：

#### 步驟：

1. **在瀏覽器中啟用測試模式**
   ```javascript
   // 在瀏覽器 Console 中執行
   localStorage.setItem('enableTestMode', 'true')
   location.reload()
   ```

2. **或者使用書籤工具**（更方便）
   
   建立一個書籤，URL 為：
   ```javascript
   javascript:(function(){localStorage.setItem('enableTestMode','true');location.reload();})();
   ```
   
   點擊書籤即可啟用測試模式

3. **然後按照方法 1 的步驟進行測試**

---

## 🔍 測試檢查清單

### 免費用戶測試
- [ ] 僅顯示最近 7 天的記錄
- [ ] 長期趨勢圖表被模糊處理
- [ ] 顯示「升級 Premium 會員」橫幅
- [ ] 無法查看超過 7 天的歷史記錄

### Premium 用戶測試
- [ ] 顯示完整歷史記錄（所有記錄）
- [ ] 長期趨勢圖表清晰可見
- [ ] 可以匯出數據
- [ ] 顯示進階報告
- [ ] 顯示 Premium 會員狀態

### 訂閱管理測試
- [ ] 模擬訂閱後，狀態立即更新
- [ ] 顯示訂閱到期日期
- [ ] 顯示剩餘天數
- [ ] 可以取消訂閱
- [ ] 取消訂閱後，功能保留至到期日

### 到期提醒測試
- [ ] 設定到期日期為未來 7 天內
- [ ] 顯示到期提醒橫幅
- [ ] 顯示剩餘天數

---

## 🗄️ 手動資料庫測試（進階）

如果您想直接在資料庫中測試不同的訂閱狀態：

### 1. 啟用 Premium（月繳 - 30 天）

```sql
-- 在 Supabase SQL Editor 中執行
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = (CURRENT_DATE + INTERVAL '30 days')::date
WHERE id = 'YOUR_USER_ID';
```

### 2. 啟用 Premium（年繳 - 365 天）

```sql
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = (CURRENT_DATE + INTERVAL '365 days')::date
WHERE id = 'YOUR_USER_ID';
```

### 3. 取消訂閱

```sql
UPDATE public.profiles
SET 
  is_premium = false,
  subscription_end_date = CURRENT_DATE
WHERE id = 'YOUR_USER_ID';
```

### 4. 設定即將到期（測試提醒）

```sql
-- 設定為 5 天後到期
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = (CURRENT_DATE + INTERVAL '5 days')::date
WHERE id = 'YOUR_USER_ID';
```

### 5. 完全重置為免費用戶

```sql
UPDATE public.profiles
SET 
  is_premium = false,
  subscription_end_date = NULL
WHERE id = 'YOUR_USER_ID';
```

---

## 💳 金流測試（模擬付款）

### 當前實現方式

系統目前使用**手動金流**方式：

1. **用戶點擊「立即訂閱」**
   - 會跳轉到 PayPal 付款連結（如果已設定）
   - 或直接使用模擬訂閱（如果未設定 PayPal 連結）

2. **測試 PayPal 連結**（可選）
   - 在 `.env.local` 中設定 PayPal 測試連結：
     ```env
     NEXT_PUBLIC_PAYPAL_MONTHLY_LINK=https://www.paypal.com/checkoutnow?token=YOUR_TEST_TOKEN
     NEXT_PUBLIC_PAYPAL_YEARLY_LINK=https://www.paypal.com/checkoutnow?token=YOUR_TEST_TOKEN
     ```
   - 使用 PayPal 沙盒環境（Sandbox）進行測試
   - 完成付款後，手動在資料庫中更新用戶狀態

3. **模擬付款完成後更新**
   - 付款完成後，在 Supabase 後台手動更新用戶的訂閱狀態
   - 或使用上述的 SQL 命令更新

---

## 🚀 快速測試流程（5 分鐘）

1. **登入** → 使用 Google 帳號登入

2. **啟用測試模式**（非本地環境）：
   ```javascript
   localStorage.setItem('enableTestMode', 'true')
   location.reload()
   ```

3. **模擬訂閱** → 點擊「訂閱狀態」→「模擬年繳訂閱」

4. **驗證功能** → 檢查是否可以看到完整歷史記錄和長期趨勢圖

5. **測試取消** → 點擊「管理訂閱」→「取消訂閱」

6. **驗證到期** → 使用 SQL 設定到期日期為明天，檢查提醒是否顯示

---

## 🛠️ 疑難排解

### 問題：看不到「模擬訂閱」按鈕

**解決方案：**
1. 確認您在本地環境（localhost）或已啟用測試模式
2. 在 Console 中執行：`localStorage.setItem('enableTestMode', 'true')`
3. 刷新頁面並重新打開訂閱管理

### 問題：模擬訂閱後沒有變化

**解決方案：**
1. 檢查瀏覽器 Console 是否有錯誤
2. 刷新頁面（F5）
3. 確認資料庫中的 `is_premium` 和 `subscription_end_date` 是否已更新

### 問題：無法在 Vercel 上測試

**解決方案：**
1. 在 Console 中執行啟用測試模式的命令
2. 或設定環境變數（需要重新部署）

---

## 📝 測試記錄模板

```
測試日期：___________
測試人員：___________
環境：本地 / Vercel

測試項目：
□ 免費用戶體驗
□ Premium 用戶體驗
□ 訂閱管理
□ 到期提醒
□ 取消訂閱

結果：✅ 通過 / ❌ 失敗

備註：
________________________________
```

---

## ⚠️ 注意事項

1. **測試數據不會影響生產環境**（如果使用測試資料庫）
2. **模擬訂閱會實際更新資料庫**，測試後建議重置
3. **測試模式僅在開發/測試環境使用**，生產環境不會顯示
4. **PayPal 測試需要使用沙盒環境**，不要使用真實付款連結

---

## 📚 相關文檔

- [完整測試指南](./TESTING_GUIDE.md)
- [訂閱設定指南](./SUBSCRIPTION_SETUP.md)
- [部署指南](./VERCEL_DEPLOYMENT.md)

