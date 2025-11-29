create extension if not exists "pgcrypto";

-- 建立 profiles 表：用於追蹤用戶是否為付費會員
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_premium boolean not null default false,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "allow users to read own profile"
  on public.profiles
  for select using (auth.uid() = id);

create policy "allow users to update own profile"
  on public.profiles
  for update using (auth.uid() = id);

-- 建立 daily_records 表：儲存每日體重與飲食文字
create table if not exists public.daily_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weight numeric,
  diet_notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint daily_records_user_date_unique unique (user_id, date)
);

alter table public.daily_records enable row level security;

create policy "allow users to manage own daily records"
  on public.daily_records
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

