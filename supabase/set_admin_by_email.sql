-- 快速設定管理員的 SQL 腳本
-- 使用方法：將 'your-email@example.com' 替換為實際的管理員 Email

-- ============================================
-- 方式 1：通過 Email 設定單一管理員
-- ============================================
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);

-- 確認設定是否成功
SELECT 
  u.email AS "管理員 Email",
  p.is_admin AS "是否為管理員",
  p.is_premium AS "Premium 狀態",
  p.subscription_end_date AS "訂閱到期日",
  p.updated_at AS "最後更新時間"
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-email@example.com';

-- ============================================
-- 方式 2：查看所有管理員列表
-- ============================================
SELECT 
  u.email AS "管理員 Email",
  p.is_admin AS "是否為管理員",
  p.is_premium AS "Premium 狀態",
  p.updated_at AS "最後更新時間"
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true
ORDER BY p.updated_at DESC;

-- ============================================
-- 方式 3：移除管理員權限（通過 Email）
-- ============================================
-- UPDATE public.profiles
-- SET is_admin = false
-- WHERE id IN (
--   SELECT id FROM auth.users
--   WHERE email = 'your-email@example.com'
-- );

-- ============================================
-- 方式 4：批量設定管理員（根據 Email 域名）
-- ============================================
-- 例如：將所有 @yourcompany.com 的用戶設為管理員
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id IN (
--   SELECT id FROM auth.users
--   WHERE email LIKE '%@yourcompany.com'
-- );

