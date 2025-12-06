-- ============================================
-- 記帳功能資料表 Schema
-- ============================================

-- 建立 expense_categories 表：記帳類別
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text, -- 類別圖示（emoji 或 icon name）
  color text, -- 類別顏色（hex code）
  is_default boolean not null default false, -- 是否為預設類別（不可刪除）
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint expense_categories_user_name_unique unique (user_id, name)
);

-- 建立 expense_records 表：記帳記錄
create table if not exists public.expense_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('expense', 'income')), -- 支出或收入
  amount numeric(12, 2) not null check (amount > 0), -- 金額（必須大於 0）
  category_id uuid references public.expense_categories (id) on delete set null, -- 類別（可為 null，用於未分類）
  date date not null, -- 日期
  note text, -- 備註（可選）
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 建立索引以提升查詢效能
create index if not exists expense_records_user_id_idx on public.expense_records (user_id);
create index if not exists expense_records_date_idx on public.expense_records (date);
create index if not exists expense_records_type_idx on public.expense_records (type);
create index if not exists expense_records_category_id_idx on public.expense_records (category_id);
create index if not exists expense_categories_user_id_idx on public.expense_categories (user_id);

-- 啟用 Row Level Security (RLS)
alter table public.expense_categories enable row level security;
alter table public.expense_records enable row level security;

-- RLS 政策：用戶只能管理自己的類別
create policy "allow users to manage own expense categories"
  on public.expense_categories
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS 政策：用戶只能管理自己的記帳記錄
create policy "allow users to manage own expense records"
  on public.expense_records
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 插入預設類別（在用戶首次使用時自動建立）
-- 這些是系統預設類別，每個用戶都會有自己的副本
-- 注意：實際插入會在應用層處理，因為需要 user_id

-- 建立更新 updated_at 的觸發器函數
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 為 expense_categories 建立觸發器
create trigger update_expense_categories_updated_at
  before update on public.expense_categories
  for each row
  execute function update_updated_at_column();

-- 為 expense_records 建立觸發器
create trigger update_expense_records_updated_at
  before update on public.expense_records
  for each row
  execute function update_updated_at_column();

