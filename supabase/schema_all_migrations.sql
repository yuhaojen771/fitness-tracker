-- 完整的 profiles 表 migration
-- 包含所有必要的欄位和政策

-- ============================================
-- 1. 添加 subscription_end_date 欄位
-- ============================================
alter table public.profiles
add column if not exists subscription_end_date date;

-- 添加註釋說明
comment on column public.profiles.subscription_end_date is 'Premium 訂閱到期日期，用於自動提醒和訂閱管理';

-- ============================================
-- 2. 添加目標設定欄位
-- ============================================
alter table public.profiles
add column if not exists target_weight numeric,
add column if not exists target_date date,
add column if not exists starting_weight numeric,
add column if not exists starting_date date;

-- ============================================
-- 3. 添加 INSERT 政策（允許用戶建立自己的 profile）
-- ============================================
-- 先刪除政策（如果已存在）
drop policy if exists "allow users to insert own profile" on public.profiles;

-- 建立新的 INSERT 政策
create policy "allow users to insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

