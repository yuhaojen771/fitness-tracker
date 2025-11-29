-- 為 profiles 表新增 is_admin 欄位
-- 用於管理員後台權限控制

-- 添加 is_admin 欄位
alter table public.profiles
add column if not exists is_admin boolean not null default false;

-- 添加註釋說明
comment on column public.profiles.is_admin is '管理員標記，true 表示該用戶為系統管理員，可訪問管理後台';

-- 創建管理員專用的 RLS 政策
-- 允許管理員查看所有 profiles（用於用戶列表）
drop policy if exists "allow admins to view all profiles" on public.profiles;
create policy "allow admins to view all profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- 允許管理員更新任何用戶的訂閱狀態
drop policy if exists "allow admins to update any profile" on public.profiles;
create policy "allow admins to update any profile"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

