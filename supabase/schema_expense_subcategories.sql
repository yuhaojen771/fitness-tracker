-- ============================================
-- 記帳功能：新增次類別支援
-- ============================================

-- 為 expense_categories 表添加 parent_category_id 欄位（支援次類別）
alter table public.expense_categories
add column if not exists parent_category_id uuid references public.expense_categories (id) on delete cascade;

-- 建立索引以提升查詢效能
create index if not exists expense_categories_parent_id_idx on public.expense_categories (parent_category_id);

-- 更新唯一約束，允許同一主類別下有多個同名次類別
-- 先刪除舊的唯一約束
alter table public.expense_categories
drop constraint if exists expense_categories_user_name_unique;

-- 建立新的唯一約束（user_id + parent_category_id + name）
-- 這樣同一主類別下不能有重複的次類別名稱，但不同主類別下可以有相同名稱的次類別
create unique index if not exists expense_categories_user_parent_name_unique 
on public.expense_categories (user_id, coalesce(parent_category_id, '00000000-0000-0000-0000-000000000000'::uuid), name);

