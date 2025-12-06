# RLS 無限遞迴問題修復指南

## 🔍 問題說明

當 PayPal webhook 嘗試更新用戶訂閱狀態時，會出現以下錯誤：
```
infinite recursion detected in policy for relation "profiles"
```

### 問題原因

1. **RLS 政策遞迴**：管理員 RLS 政策使用 `exists (select from profiles)` 來檢查管理員權限，這會導致：
   - 更新 `profiles` 表時觸發 UPDATE 政策檢查
   - UPDATE 政策需要查詢 `profiles` 表來確認是否為管理員
   - 查詢 `profiles` 表又觸發 SELECT 政策檢查
   - SELECT 政策又需要查詢 `profiles` 表
   - 形成無限遞迴

2. **Webhook 使用 anon key**：PayPal webhook 原本使用 `anon key`，會受到 RLS 限制，觸發政策檢查。

## ✅ 解決方案

### 步驟 1：執行 SQL 修復腳本

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 進入您的專案
3. 前往 **SQL Editor**
4. 執行 `supabase/schema_fix_rls_recursion.sql` 文件中的 SQL 語句

或者直接複製以下 SQL 並執行：

```sql
-- 建立 security definer 函數來檢查管理員權限
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = user_id and is_admin = true
  );
end;
$$;

-- 重新建立管理員 RLS 政策（使用函數而非直接查詢）
drop policy if exists "allow admins to view all profiles" on public.profiles;
drop policy if exists "allow admins to update any profile" on public.profiles;

create policy "allow admins to view all profiles"
  on public.profiles
  for select
  using (
    auth.uid() = id
    or
    public.is_admin(auth.uid())
  );

create policy "allow admins to update any profile"
  on public.profiles
  for update
  using (
    auth.uid() = id
    or
    public.is_admin(auth.uid())
  );
```

### 步驟 2：設定 Service Role Key 環境變數

PayPal webhook 現在使用 `service role key` 來繞過 RLS，需要設定環境變數：

#### 在本地開發環境（.env.local）

1. 在 Supabase Dashboard → **Settings** → **API** 中找到 **Service Role Key**
2. 將它添加到 `.env.local`：

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **重要**：`.env.local` 已經在 `.gitignore` 中，不會被提交到 Git。

#### 在 Vercel 生產環境

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 進入 **Settings** → **Environment Variables**
4. 添加新的環境變數：
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: 您的 Supabase Service Role Key
   - **Environment**: Production, Preview, Development（全部勾選）
5. 點擊 **Save**

### 步驟 3：重新部署（如果已部署）

如果您的應用已經部署到 Vercel：

1. 提交並推送更改：
   ```bash
   git add .
   git commit -m "修復 RLS 無限遞迴問題"
   git push origin main
   ```

2. Vercel 會自動重新部署

## 🔧 技術細節

### Security Definer 函數

`is_admin()` 函數使用 `security definer`，這意味著：
- 函數以擁有者（通常是 `postgres`）的身份執行
- 可以繞過 RLS 檢查
- 避免在 RLS 政策中直接查詢 `profiles` 表造成的遞迴

### Service Role Key

- **用途**：用於服務端操作，完全繞過 RLS
- **安全性**：只能在服務端使用，絕對不能暴露給客戶端
- **適用場景**：
  - Webhook 處理（PayPal IPN）
  - 後台管理任務
  - 系統級操作

## ✅ 驗證修復

### 測試 PayPal Webhook

1. 執行一次模擬訂閱付款
2. 檢查是否還有 `infinite recursion` 錯誤
3. 確認用戶的訂閱狀態已正確更新

### 檢查日誌

如果仍有問題，檢查：
- Vercel 部署日誌
- Supabase Dashboard → **Logs** → **Postgres Logs**

## 📝 相關文件

- `supabase/schema_fix_rls_recursion.sql` - SQL 修復腳本
- `src/lib/supabase/server.ts` - 新增 `createSupabaseServiceRoleClient()` 函數
- `src/app/api/webhooks/paypal/route.ts` - 已更新為使用 service role client

## ⚠️ 注意事項

1. **Service Role Key 安全性**：
   - 絕對不要將 `SUPABASE_SERVICE_ROLE_KEY` 提交到 Git
   - 不要在客戶端代碼中使用
   - 只在服務端 API 路由中使用

2. **RLS 政策**：
   - 修復後的 RLS 政策仍然有效
   - 普通用戶只能查看/更新自己的 profile
   - 管理員可以查看/更新所有 profiles
   - Webhook 使用 service role key 繞過 RLS

3. **向後兼容**：
   - 現有的用戶政策不受影響
   - 管理員功能仍然正常運作
   - 不需要修改其他代碼



