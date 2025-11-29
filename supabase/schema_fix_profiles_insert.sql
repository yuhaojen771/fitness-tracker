-- 為 profiles 表添加 INSERT 政策
-- 允許用戶建立自己的 profile 記錄（用於首次升級或建立資料時）

-- 先刪除政策（如果已存在）
drop policy if exists "allow users to insert own profile" on public.profiles;

-- 建立新的 INSERT 政策
create policy "allow users to insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

