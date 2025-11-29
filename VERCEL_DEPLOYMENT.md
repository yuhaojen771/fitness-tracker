# Vercel 部署指南

本文檔說明如何將健康追蹤應用程式部署到 Vercel。

## 📋 部署前準備

### 1. 確認專案狀態

- [ ] 所有功能已測試完成
- [ ] 程式碼已提交到 Git 倉庫（GitHub、GitLab 或 Bitbucket）
- [ ] 已建立 `.env.local` 並測試本地功能
- [ ] 已執行所有資料庫 migration

### 2. 準備環境變數清單

需要設定的環境變數：

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase Server (用於 Server Actions)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL (用於 OAuth 回調)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# 回饋表單（選填）
NEXT_PUBLIC_FEEDBACK_FORM_URL=https://forms.gle/your-form-url

# PayPal 連結（選填，如果使用）
NEXT_PUBLIC_PAYPAL_MONTHLY_LINK=your-paypal-link
NEXT_PUBLIC_PAYPAL_YEARLY_LINK=your-paypal-link
```

## 🚀 部署步驟

### 步驟 1：準備 Git 倉庫

**如果您還沒有 Git 倉庫：**
- 推薦使用 **GitHub**（最常用，與 Vercel 整合最佳）
- 也可以使用 GitLab 或 Bitbucket
- 詳細步驟請參考 [GIT_SETUP.md](./GIT_SETUP.md)

**如果您已有 Git 倉庫：**
- 確認所有變更已提交並推送
- 確認倉庫是公開的，或您的 Vercel 帳號有存取權限

### 步驟 2：連接 Vercel 帳號

1. 前往 [Vercel](https://vercel.com)
2. 使用 **GitHub**、GitLab 或 Bitbucket 帳號登入（建議使用 GitHub）
3. 點擊「Add New Project」

### 步驟 3：匯入專案

1. 選擇您的 Git 倉庫
2. 選擇專案資料夾（如果是 monorepo，選擇 `fitness-tracker` 資料夾）
3. Vercel 會自動偵測 Next.js 專案

### 步驟 4：設定專案

#### Framework Preset
- 選擇：**Next.js**

#### Root Directory
- 如果專案在子資料夾：設定為 `fitness-tracker`
- 如果專案在根目錄：留空

#### Build Command
- 預設：`npm run build`（通常不需要修改）

#### Output Directory
- 預設：`.next`（通常不需要修改）

#### Install Command
- 預設：`npm install`（通常不需要修改）

### 步驟 5：設定環境變數

在「Environment Variables」區塊中，逐一添加以下變數：

#### 必填環境變數

1. **NEXT_PUBLIC_SUPABASE_URL**
   - 值：從 Supabase Dashboard → Settings → API → Project URL
   - 環境：Production, Preview, Development

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - 值：從 Supabase Dashboard → Settings → API → anon public key
   - 環境：Production, Preview, Development

3. **SUPABASE_SERVICE_ROLE_KEY**
   - 值：從 Supabase Dashboard → Settings → API → service_role key
   - ⚠️ **重要**：只選擇 Production（不要選擇 Preview 和 Development，避免洩露）
   - 環境：Production

4. **NEXT_PUBLIC_SITE_URL**
   - 值：先使用 `https://your-project-name.vercel.app`
   - 部署後可以更新為自訂網域
   - 環境：Production, Preview, Development

#### 選填環境變數

5. **NEXT_PUBLIC_FEEDBACK_FORM_URL**（如果使用回饋表單）
   - 值：您的 Google Form 或 Tally Form 連結
   - 環境：Production, Preview, Development

6. **NEXT_PUBLIC_PAYPAL_MONTHLY_LINK**（如果使用 PayPal）
   - 值：PayPal 月繳方案連結
   - 環境：Production

7. **NEXT_PUBLIC_PAYPAL_YEARLY_LINK**（如果使用 PayPal）
   - 值：PayPal 年繳方案連結
   - 環境：Production

### 步驟 6：部署

1. 點擊「Deploy」按鈕
2. 等待建置完成（通常 2-5 分鐘）
3. 部署成功後會顯示專案 URL

## 🔧 部署後設定

### 1. 更新 Supabase OAuth 設定

1. 前往 Supabase Dashboard → Authentication → URL Configuration
2. 在「Redirect URLs」中添加：
   ```
   https://your-project-name.vercel.app/auth/callback
   ```
3. 在「Site URL」中設定：
   ```
   https://your-project-name.vercel.app
   ```

### 2. 執行資料庫 Migration

如果尚未執行，請在 Supabase SQL Editor 中執行：

1. 前往 Supabase Dashboard → SQL Editor
2. 執行 `supabase/schema_all_migrations.sql` 或以下 SQL：

```sql
-- 完整的 profiles 表 migration
-- 包含所有必要的欄位和政策

-- 1. 添加 subscription_end_date 欄位
alter table public.profiles
add column if not exists subscription_end_date date;

comment on column public.profiles.subscription_end_date is 'Premium 訂閱到期日期，用於自動提醒和訂閱管理';

-- 2. 添加目標設定欄位
alter table public.profiles
add column if not exists target_weight numeric,
add column if not exists target_date date,
add column if not exists starting_weight numeric,
add column if not exists starting_date date;

-- 3. 添加 INSERT 政策
drop policy if exists "allow users to insert own profile" on public.profiles;

create policy "allow users to insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);
```

### 3. 更新 NEXT_PUBLIC_SITE_URL（如果使用自訂網域）

1. 在 Vercel 專案設定中設定自訂網域
2. 更新環境變數 `NEXT_PUBLIC_SITE_URL` 為自訂網域
3. 更新 Supabase OAuth 設定中的 Redirect URLs

## 🔍 驗證部署

### 檢查清單

- [ ] 網站可以正常開啟
- [ ] 登入/註冊功能正常
- [ ] Google OAuth 登入正常（如果使用）
- [ ] Dashboard 可以正常顯示
- [ ] 可以新增/編輯/刪除記錄
- [ ] Premium 功能正常（如果已訂閱）
- [ ] 回饋按鈕顯示（如果設定了環境變數）

### 測試流程

1. **測試登入**
   - 前往 `/auth/login`
   - 測試登入功能

2. **測試 Dashboard**
   - 登入後前往 `/dashboard`
   - 測試新增記錄功能

3. **測試 OAuth**（如果使用）
   - 點擊「使用 Google 登入」
   - 確認可以正常回調

4. **測試 Premium 功能**（如果已訂閱）
   - 測試模擬訂閱功能
   - 測試 Premium 報告

## 🐛 常見問題

### 問題 1：建置失敗

**錯誤訊息**：`Module not found` 或 `Cannot find module`

**解決方法**：
1. 確認 `package.json` 中所有依賴都已正確列出
2. 檢查 `node_modules` 是否已提交（不應該提交）
3. 確認 Vercel 使用的是正確的 Node.js 版本

### 問題 2：環境變數未生效

**錯誤訊息**：`undefined` 或功能無法使用

**解決方法**：
1. 確認環境變數名稱正確（特別是 `NEXT_PUBLIC_` 前綴）
2. 確認已選擇正確的環境（Production/Preview/Development）
3. 重新部署專案（環境變數變更後需要重新部署）

### 問題 3：OAuth 回調失敗

**錯誤訊息**：`redirect_uri_mismatch`

**解決方法**：
1. 確認 Supabase 中的 Redirect URL 設定正確
2. 確認 `NEXT_PUBLIC_SITE_URL` 環境變數正確
3. 確認 URL 格式正確（包含 `https://` 和結尾沒有斜線）

### 問題 4：資料庫連線失敗

**錯誤訊息**：`Failed to fetch` 或 `Unauthorized`

**解決方法**：
1. 確認 Supabase URL 和 Key 正確
2. 確認 RLS 政策已正確設定
3. 確認 `SUPABASE_SERVICE_ROLE_KEY` 只在 Production 環境設定

### 問題 5：回饋按鈕未顯示

**解決方法**：
1. 確認 `NEXT_PUBLIC_FEEDBACK_FORM_URL` 已設定
2. 確認環境變數已選擇所有環境
3. 清除瀏覽器快取並重新載入

## 📊 監控與分析

### Vercel Analytics（選填）

1. 在 Vercel 專案設定中啟用 Analytics
2. 可以查看：
   - 頁面瀏覽量
   - 效能指標
   - 錯誤率

### 日誌查看

1. 在 Vercel Dashboard → Deployments
2. 點擊特定部署
3. 查看「Functions」和「Build Logs」

## 🔄 持續部署

### 自動部署

- Vercel 會自動監聽 Git 倉庫的變更
- 當您推送到主分支時，會自動觸發部署
- Preview 部署會為每個 Pull Request 建立

### 手動部署

1. 在 Vercel Dashboard 中點擊「Redeploy」
2. 或使用 Vercel CLI：
   ```bash
   npm i -g vercel
   vercel --prod
   ```

## 🔒 安全建議

1. **不要提交敏感資訊**
   - 確認 `.env.local` 在 `.gitignore` 中
   - 不要將 API keys 提交到 Git

2. **使用環境變數**
   - 所有敏感資訊都應使用環境變數
   - 不要在程式碼中硬編碼

3. **定期更新依賴**
   - 定期執行 `npm audit`
   - 更新有安全漏洞的套件

4. **限制 Service Role Key 存取**
   - 只在 Production 環境使用
   - 不要在前端程式碼中使用

## 📝 部署檢查清單

### 部署前
- [ ] 所有功能已測試
- [ ] 程式碼已提交到 Git
- [ ] 環境變數清單已準備
- [ ] 資料庫 migration 已執行

### 部署中
- [ ] 專案已匯入 Vercel
- [ ] 所有環境變數已設定
- [ ] 建置成功完成

### 部署後
- [ ] Supabase OAuth 設定已更新
- [ ] 網站功能測試通過
- [ ] 自訂網域已設定（如果使用）
- [ ] 監控和分析已啟用

## 🆘 需要協助？

如果遇到問題：

1. 查看 Vercel 建置日誌
2. 檢查 Supabase Dashboard 的日誌
3. 查看瀏覽器控制台的錯誤訊息
4. 參考 [Vercel 文件](https://vercel.com/docs)
5. 參考 [Next.js 文件](https://nextjs.org/docs)

