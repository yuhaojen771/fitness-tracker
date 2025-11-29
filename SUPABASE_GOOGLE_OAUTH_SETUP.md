# Supabase Google OAuth 設定指南

## ⚠️ 重要：Redirect URI 設定

**關鍵點**：Google Cloud Console 中的 Redirect URI 必須是 **Supabase 的 callback URL**，不是你的應用程式 URL！

- ✅ **正確**：`https://你的專案ID.supabase.co/auth/v1/callback`
- ❌ **錯誤**：`http://localhost:3000/auth/callback`

## 快速檢查清單

完成設定後，請確認：

- [ ] Google Cloud Console 中的 Redirect URI 是 Supabase 的 URL
- [ ] Supabase Dashboard 中已啟用 Google Provider
- [ ] Supabase Dashboard 中已填入正確的 Client ID 和 Client Secret
- [ ] Supabase Dashboard 中的 Redirect URLs 包含 `http://localhost:3000/auth/callback`
- [ ] `.env.local` 中已設定 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`

## 步驟 1：在 Google Cloud Console 建立 OAuth 2.0 憑證

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用必要的 API：
   - 導航至「API 和服務」→「程式庫」
   - 搜尋並啟用「Google+ API」（如果尚未啟用）
4. 建立 OAuth 2.0 憑證：
   - 前往「API 和服務」→「憑證」
   - 點擊「建立憑證」→「OAuth 用戶端 ID」
   - 應用程式類型選擇「網頁應用程式」
   - **重要：授權的重新導向 URI 必須填入 Supabase 的 callback URL**：
     ```
     https://你的專案ID.supabase.co/auth/v1/callback
     ```
     ⚠️ **注意**：這裡填的是 Supabase 的 URL，不是你的應用程式 URL！
     - 例如：如果你的 Supabase 專案 ID 是 `abcdefghijklmnop`，則填入：
       ```
       https://abcdefghijklmnop.supabase.co/auth/v1/callback
       ```
   - 點擊「建立」
   - 記下 **用戶端 ID** 和 **用戶端密鑰**（稍後會在 Supabase 中使用）

## 步驟 2：在 Supabase Dashboard 設定 Google Provider

1. 登入 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇你的專案
3. 前往 **Authentication** → **Providers**
4. 找到 **Google** 並啟用
5. 填入以下資訊：
   - **Client ID (for OAuth)**: 從 Google Cloud Console 取得的用戶端 ID
   - **Client Secret (for OAuth)**: 從 Google Cloud Console 取得的用戶端密鑰
6. 點擊 **Save**

## 步驟 3：設定 Redirect URL

在 Supabase Dashboard 的 **Authentication** → **URL Configuration** 中，確認：

- **Site URL**: `http://localhost:3000` (開發環境) 或你的生產環境 URL
- **Redirect URLs**: 加入以下 URL
  ```
  http://localhost:3000/auth/callback
  https://你的域名/auth/callback
  ```

## 步驟 4：測試 Google 登入

1. 啟動開發伺服器：`npm run dev`
2. 前往 `http://localhost:3000/auth/login`
3. 點擊「使用 Google 登入」按鈕
4. 完成 Google 授權後，應該會自動導向 `/dashboard`

## 故障排除

### 錯誤：`redirect_uri_mismatch` (400)

如果遇到此錯誤，請檢查：

1. **Google Cloud Console 中的 Redirect URI 是否正確**：
   - 必須是：`https://你的專案ID.supabase.co/auth/v1/callback`
   - 不是：`http://localhost:3000/auth/callback`（這是錯誤的！）
   - 確認 URL 完全一致，包括 `https://` 和結尾的 `/auth/v1/callback`

2. **如何找到你的 Supabase 專案 ID**：
   - 登入 Supabase Dashboard
   - 在專案設定中，可以看到專案 URL，例如：`https://abcdefghijklmnop.supabase.co`
   - `abcdefghijklmnop` 就是你的專案 ID

3. **檢查步驟**：
   - 前往 Google Cloud Console → 憑證
   - 點擊你建立的 OAuth 2.0 用戶端 ID
   - 確認「授權的重新導向 URI」欄位中**只有** Supabase 的 callback URL
   - 如果有其他 URL，請刪除它們（或確保 Supabase 的 URL 在列表中）
   - 儲存變更後，等待幾分鐘讓設定生效

### 如何驗證設定是否正確

1. 在 Google Cloud Console 中，確認 Redirect URI 是：
   ```
   https://你的專案ID.supabase.co/auth/v1/callback
   ```

2. 在 Supabase Dashboard 中，確認：
   - Google Provider 已啟用
   - Client ID 和 Client Secret 已正確填入
   - Authentication → URL Configuration 中的 Redirect URLs 包含：
     ```
     http://localhost:3000/auth/callback
     ```

## 注意事項

- 首次使用 Google 登入的用戶會自動建立 `profiles` 記錄（`is_premium` 預設為 `false`）
- 確保 `.env.local` 中已正確設定 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- **重要**：Google Cloud Console 中的 Redirect URI 必須是 Supabase 的 URL，不是你的應用程式 URL
- 生產環境部署時，需要在 Google Cloud Console 中新增生產環境的 Supabase callback URL（如果使用不同的 Supabase 專案）

