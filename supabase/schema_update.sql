-- 為 profiles 表新增目標設定欄位
alter table public.profiles
add column if not exists target_weight numeric,
add column if not exists target_date date,
add column if not exists starting_weight numeric,
add column if not exists starting_date date;

