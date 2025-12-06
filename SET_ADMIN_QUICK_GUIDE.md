# 🚀 快速設定管理員指南

## 最簡單的方法：通過 Email 設定管理員

### 步驟 1：登入 Supabase Dashboard

1. 前往 [Supabase Dashboard](https://app.supabase.com)
2. 選擇你的專案

### 步驟 2：打開 SQL Editor

1. 在左側選單中點擊 **SQL Editor**
2. 點擊 **New Query** 創建新查詢

### 步驟 3：執行 SQL 查詢

複製以下 SQL 並**將 Email 替換為你要設為管理員的用戶 Email**：

```sql
-- 將 'your-email@example.com' 替換為實際的管理員 Email
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);
```

**範例：**

如果你要將 `admin@yourcompany.com` 設為管理員，執行：

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'admin@yourcompany.com'
);
```

### 步驟 4：確認設定成功

執行以下查詢來確認：

```sql
SELECT 
  u.email AS "管理員 Email",
  p.is_admin AS "是否為管理員",
  p.is_premium AS "Premium 狀態"
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-email@example.com';
```

如果看到 `is_admin = true`，表示設定成功！

### 步驟 5：測試訪問管理後台

1. 使用該 Email 登入應用
2. 訪問 `/admin` 路由
3. 應該可以看到管理後台頁面

---

## 📋 其他常用查詢

### 查看所有管理員

```sql
SELECT 
  u.email,
  p.is_admin,
  p.updated_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true
ORDER BY p.updated_at DESC;
```

### 移除管理員權限

```sql
UPDATE public.profiles
SET is_admin = false
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);
```

### 查看特定用戶的完整資訊

```sql
SELECT 
  u.email,
  u.created_at AS "註冊時間",
  p.is_admin,
  p.is_premium,
  p.subscription_end_date AS "訂閱到期日"
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-email@example.com';
```

---

## ⚠️ 注意事項

1. **Email 必須已經註冊**：該 Email 必須是已經在系統中註冊的用戶
2. **大小寫敏感**：Email 查詢是大小寫敏感的，請確保輸入正確
3. **確認 Email**：設定前建議先確認該 Email 是否已註冊
   ```sql
   SELECT email, created_at 
   FROM auth.users 
   WHERE email = 'your-email@example.com';
   ```

---

## 🎯 完整範例流程

假設你要將 `admin@example.com` 設為管理員：

```sql
-- 1. 先確認該 Email 是否已註冊
SELECT email, created_at 
FROM auth.users 
WHERE email = 'admin@example.com';

-- 2. 設定為管理員
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'admin@example.com'
);

-- 3. 確認設定成功
SELECT 
  u.email,
  p.is_admin,
  p.is_premium
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@example.com';
```

如果一切正常，你會看到 `is_admin = true`，然後就可以使用該帳號登入並訪問 `/admin` 管理後台了！



