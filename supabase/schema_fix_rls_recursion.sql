-- 修復 RLS 政策無限遞迴問題
-- 問題：管理員政策使用 exists (select from profiles) 會導致遞迴檢查
-- 解決：使用 security definer 函數來繞過 RLS 檢查

-- ============================================
-- 1. 建立 security definer 函數來檢查管理員權限
-- ============================================
-- 這個函數使用 security definer，會以函數擁有者（通常是 postgres）的身份執行
-- 因此可以繞過 RLS 檢查，避免遞迴
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

-- 添加註釋說明
comment on function public.is_admin(uuid) is '檢查用戶是否為管理員，使用 security definer 避免 RLS 遞迴';

-- ============================================
-- 2. 重新建立管理員 RLS 政策（使用函數而非直接查詢）
-- ============================================
-- 刪除舊的政策
drop policy if exists "allow admins to view all profiles" on public.profiles;
drop policy if exists "allow admins to update any profile" on public.profiles;

-- 建立新的 SELECT 政策（使用函數）
create policy "allow admins to view all profiles"
  on public.profiles
  for select
  using (
    -- 普通用戶可以查看自己的 profile
    auth.uid() = id
    or
    -- 管理員可以查看所有 profiles
    public.is_admin(auth.uid())
  );

-- 建立新的 UPDATE 政策（使用函數）
create policy "allow admins to update any profile"
  on public.profiles
  for update
  using (
    -- 普通用戶可以更新自己的 profile
    auth.uid() = id
    or
    -- 管理員可以更新任何 profile
    public.is_admin(auth.uid())
  );

-- ============================================
-- 3. 確保現有的用戶政策仍然有效
-- ============================================
-- 這些政策已經在 schema.sql 中定義，但我們確保它們存在
-- 如果不存在，則建立它們

-- 確保用戶可以讀取自己的 profile（如果政策不存在）
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'profiles'
    and policyname = 'allow users to read own profile'
  ) then
    create policy "allow users to read own profile"
      on public.profiles
      for select using (auth.uid() = id);
  end if;
end $$;

-- 確保用戶可以更新自己的 profile（如果政策不存在）
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'profiles'
    and policyname = 'allow users to update own profile'
  ) then
    create policy "allow users to update own profile"
      on public.profiles
      for update using (auth.uid() = id);
  end if;
end $$;

