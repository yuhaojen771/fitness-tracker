-- 為 profiles 表新增 subscription_end_date 欄位
-- 用於追蹤 Premium 訂閱到期日期
alter table public.profiles
add column if not exists subscription_end_date date;

-- 添加註釋說明
comment on column public.profiles.subscription_end_date is 'Premium 訂閱到期日期，用於自動提醒和訂閱管理';



