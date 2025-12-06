# 測試與模擬訂閱指南

本文檔說明如何在開發和測試環境中使用模擬訂閱功能。

## 🧪 模擬訂閱功能

### 功能說明

為了方便開發和測試，系統提供了模擬訂閱功能，讓您可以在不進行實際付款的情況下測試 Premium 功能。

### 使用方式

1. **訪問訂閱管理介面**：
   - 所有用戶（包括非 Premium 用戶）都可以點擊「訂閱狀態」按鈕
   - 按鈕位於儀表板的 Premium 區塊上方

2. **模擬訂閱**（僅開發模式）：
   - 在開發環境（localhost）中，非 Premium 用戶會看到「模擬訂閱」選項
   - 可以選擇「模擬月繳訂閱」或「模擬年繳訂閱」
   - 點擊後會立即啟用 Premium 功能，並設定對應的到期日期

3. **測試 Premium 功能**：
   - 模擬訂閱後，您可以測試所有 Premium 功能：
     - 查看完整歷史記錄（超過 7 天）
     - 查看長期趨勢圖表（90 天）
     - 使用數據匯出功能
     - 查看進階報告

4. **取消模擬訂閱**：
   - 在訂閱管理介面中點擊「取消訂閱 / 停止提醒」
   - 這會將 `is_premium` 設為 `false`，並將 `subscription_end_date` 設為今天

## 🔧 開發模式檢測

系統會自動檢測是否為開發模式：

- **自動檢測**：在 `localhost` 或 `127.0.0.1` 上運行時自動啟用
- **手動啟用**：設定環境變數 `NEXT_PUBLIC_ENABLE_TEST_MODE=true`

```env
# .env.local
NEXT_PUBLIC_ENABLE_TEST_MODE=true
```

## 📝 測試場景

### 場景 1：測試免費用戶體驗

1. 確保 `is_premium = false`
2. 登入儀表板
3. 驗證：
   - 僅顯示最近 7 天的記錄
   - 長期趨勢圖表被模糊處理
   - 付費牆 UI 顯示

### 場景 2：測試 Premium 用戶體驗

1. 點擊「訂閱狀態」按鈕
2. 選擇「模擬月繳訂閱」或「模擬年繳訂閱」
3. 驗證：
   - 顯示完整歷史記錄
   - 長期趨勢圖表可見
   - 數據匯出功能可用
   - 進階報告顯示

### 場景 3：測試到期提醒

1. 模擬訂閱後，手動在資料庫中將 `subscription_end_date` 設為未來 7 天內
2. 重新載入儀表板
3. 驗證：
   - 顯示到期提醒橫幅
   - 顯示剩餘天數
   - 「管理訂閱」按鈕可用

### 場景 4：測試訂閱管理

1. 作為 Premium 用戶，點擊「管理訂閱」
2. 驗證：
   - 顯示訂閱狀態
   - 顯示到期日期
   - 顯示剩餘天數
   - 「取消訂閱」按鈕可用

## 🗄️ 手動資料庫操作

如果需要手動調整訂閱狀態，可以直接在 Supabase 後台操作：

### 啟用 Premium（模擬訂閱）

```sql
-- 更新為 Premium 用戶（月繳，30 天後到期）
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = (CURRENT_DATE + INTERVAL '30 days')::date
WHERE id = 'YOUR_USER_ID';

-- 更新為 Premium 用戶（年繳，365 天後到期）
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = (CURRENT_DATE + INTERVAL '365 days')::date
WHERE id = 'YOUR_USER_ID';
```

### 取消 Premium

```sql
-- 取消訂閱
UPDATE public.profiles
SET 
  is_premium = false,
  subscription_end_date = CURRENT_DATE
WHERE id = 'YOUR_USER_ID';
```

### 設定即將到期（測試提醒功能）

```sql
-- 設定為 5 天後到期（會觸發提醒橫幅）
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = (CURRENT_DATE + INTERVAL '5 days')::date
WHERE id = 'YOUR_USER_ID';
```

## ⚠️ 注意事項

1. **僅限開發環境**：模擬訂閱功能僅在開發模式中可用，生產環境不會顯示此選項
2. **資料庫狀態**：模擬訂閱會實際更新資料庫中的 `is_premium` 和 `subscription_end_date`
3. **測試後清理**：測試完成後，建議取消模擬訂閱以恢復初始狀態
4. **安全性**：確保生產環境不會意外啟用測試模式

## 🚀 快速測試流程

1. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```

2. **登入應用**：
   - 使用 Google OAuth 登入

3. **模擬訂閱**：
   - 點擊「訂閱狀態」
   - 選擇「模擬年繳訂閱」

4. **測試功能**：
   - 查看完整歷史記錄
   - 查看長期趨勢圖表
   - 測試數據匯出

5. **取消訂閱**：
   - 點擊「管理訂閱」
   - 點擊「取消訂閱 / 停止提醒」

## 📊 測試檢查清單

- [ ] 免費用戶僅看到最近 7 天記錄
- [ ] Premium 用戶看到完整歷史記錄
- [ ] 長期趨勢圖表對免費用戶模糊處理
- [ ] 長期趨勢圖表對 Premium 用戶可見
- [ ] 數據匯出功能僅 Premium 可用
- [ ] 到期提醒橫幅在 7 天內顯示
- [ ] 訂閱管理介面正確顯示狀態
- [ ] 模擬訂閱功能正常運作
- [ ] 取消訂閱功能正常運作



