-- ============================================
-- 記帳功能：為次類別添加預設金額欄位
-- ============================================

-- 為 expense_categories 表添加 default_amount 欄位（次類別的預設金額）
alter table public.expense_categories
add column if not exists default_amount numeric(12, 2);

-- 添加註解說明
comment on column public.expense_categories.default_amount is '次類別的預設金額（可選），選擇此次類別時可自動填入金額';

