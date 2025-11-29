# Google OAuth 登入問題修復指南

## 🔍 問題診斷

如果看到 Firebase Hosting 頁面或 OAuth 回調失敗，請按以下步驟檢查和修復：

## ✅ 修復步驟

### 步驟 1：確認 Vercel 環境變數

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 前往 **Settings** → **Environment Variables**
4. 確認以下環境變數已設定：

   ```
   NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   ⚠️ **重要**：`NEXT_PUBLIC_SITE_URL` 必須是您實際的 Vercel 部署 URL（或自訂網域）

5. 如果修改了環境變數，請：
   - 點擊 **Redeploy** 重新部署
   - 或等待下一次部署自動應用新變數

### 步驟 2：更新 Supabase Redirect URLs

1. 前往 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇您的專案
3. 前往 **Authentication** → **URL Configuration**
4. 在 **Redirect URLs** 中添加以下 URL（換成您實際的 Vercel URL）：

   ```
   https://your-project.vercel.app/auth/callback
   ```

   如果使用自訂網域：

   ```
   https://your-custom-domain.com/auth/callback
   ```

5. 在 **Site URL** 中設定：

   ```
   https://your-project.vercel.app
   ```

6. 點擊 **Save** 保存設定

### 步驟 3：確認 Google Cloud Console 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的專案
3. 前往 **API 和服務** → **憑證**
4. 點擊您建立的 OAuth 2.0 用戶端 ID
5. 確認 **授權的重新導向 URI** 中包含：

   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

   ⚠️ **注意**：這裡是 Supabase 的 URL，不是 Vercel 的 URL！

6. 如果沒有，請添加並保存

### 步驟 4：測試 OAuth 流程

1. 清除瀏覽器快取和 Cookie
2. 訪問您的 Vercel 部署 URL
3. 前往 `/auth/login`
4. 點擊「使用 Google 登入」
5. 完成 Google 授權後，應該會自動導向 `/dashboard`

## 🐛 常見問題

### 問題 1：回調到錯誤的頁面（如 Firebase 頁面）

**原因**：
- `NEXT_PUBLIC_SITE_URL` 環境變數未設置或設置錯誤
- Supabase Redirect URLs 中沒有包含生產環境 URL

**解決方法**：
1. 檢查 Vercel 環境變數 `NEXT_PUBLIC_SITE_URL`
2. 確認 Supabase Redirect URLs 包含正確的生產環境 URL
3. 重新部署應用

### 問題 2：`redirect_uri_mismatch` 錯誤

**原因**：
- Google Cloud Console 中的 Redirect URI 設定錯誤
- 應該使用 Supabase 的 callback URL，不是應用程式的 URL

**解決方法**：
1. 在 Google Cloud Console 中，確認 Redirect URI 是：
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
2. 不是應用程式的 URL（這是錯誤的）

### 問題 3：OAuth 成功但無法登入

**原因**：
- Supabase 的 Redirect URLs 設定不完整
- 環境變數配置錯誤

**解決方法**：
1. 確認 Supabase Redirect URLs 包含完整的生產環境 URL
2. 檢查瀏覽器控制台是否有錯誤訊息
3. 檢查 Vercel 函數日誌查看錯誤

## 📝 檢查清單

在修復後，請確認：

- [ ] Vercel 環境變數 `NEXT_PUBLIC_SITE_URL` 已正確設置
- [ ] Vercel 環境變數 `NEXT_PUBLIC_SUPABASE_URL` 已正確設置
- [ ] Vercel 環境變數 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已正確設置
- [ ] Supabase Dashboard 中的 Site URL 已設置為生產環境 URL
- [ ] Supabase Dashboard 中的 Redirect URLs 包含生產環境的 `/auth/callback` URL
- [ ] Google Cloud Console 中的 Redirect URI 是 Supabase 的 callback URL
- [ ] 應用已重新部署以應用新的環境變數

## 🔄 OAuth 流程說明

1. 用戶點擊「使用 Google 登入」
2. 應用使用 `NEXT_PUBLIC_SITE_URL` 構建回調 URL
3. 用戶被導向 Google 授權頁面
4. Google 授權後，導向 Supabase 的 callback URL
5. Supabase 處理 OAuth 並建立 session
6. Supabase 導向應用程式的 `/auth/callback`（必須在 Redirect URLs 中）
7. 應用程式的 callback 路由處理 session 並導向 `/dashboard`

## 💡 提示

- 環境變數修改後需要重新部署才會生效
- Supabase 設定修改後立即生效
- Google Cloud Console 設定修改後可能需要幾分鐘才生效
- 使用瀏覽器的開發者工具檢查網路請求和錯誤訊息

