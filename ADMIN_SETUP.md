# 管理者後台設置指南

## 📋 概述

管理者後台允許系統管理員手動開通用戶的 Premium 訂閱，並查看所有用戶列表。這對於處理手動 PayPal 交易或其他特殊情況非常有用。

## 🔧 設置步驟

### 1. 執行資料庫遷移

首先，需要在 Supabase 資料庫中執行遷移腳本以添加 `is_admin` 欄位：

1. 登入 Supabase Dashboard
2. 進入 **SQL Editor**
3. 執行 `supabase/schema_admin.sql` 文件中的 SQL 語句

或者直接在 SQL Editor 中執行：

```sql
-- 添加 is_admin 欄位
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 添加註釋說明
COMMENT ON COLUMN public.profiles.is_admin IS '管理員標記，true 表示該用戶為系統管理員，可訪問管理後台';

-- 創建管理員專用的 RLS 政策
DROP POLICY IF EXISTS "allow admins to view all profiles" ON public.profiles;
CREATE POLICY "allow admins to view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "allow admins to update any profile" ON public.profiles;
CREATE POLICY "allow admins to update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### 2. 設置管理員帳號

將特定用戶設為管理員有三種方式：

#### 方式 A：通過 SQL Editor 使用 Email ⭐ **最簡單推薦**

1. 登入 Supabase Dashboard
2. 進入 **Table Editor** → 選擇 `profiles` 表
3. 找到要設為管理員的用戶記錄
4. 將該記錄的 `is_admin` 欄位設為 `true`
5. 保存更改

#### 方式 B：通過 SQL Editor（使用 User ID）

```sql
-- 將特定用戶設為管理員（替換 YOUR_USER_ID 為實際的用戶 ID）
UPDATE public.profiles
SET is_admin = true
WHERE id = 'YOUR_USER_ID';

-- 查看所有管理員
SELECT id, is_admin FROM public.profiles WHERE is_admin = true;
```

#### 方式 C：通過 SQL Editor（使用 Email）⭐ **推薦**

這是**最簡單的方法**，直接使用 Email 來設定管理員：

```sql
-- 通過 Email 將用戶設為管理員（替換 your-email@example.com 為實際的 Email）
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);

-- 查看該 Email 是否已設為管理員（包含 Email 資訊）
SELECT 
  p.id,
  u.email,
  p.is_admin,
  p.is_premium,
  p.subscription_end_date
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-email@example.com';

-- 查看所有管理員的 Email
SELECT 
  u.email,
  p.is_admin,
  p.is_premium,
  p.updated_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true
ORDER BY p.updated_at DESC;
```

**使用範例：**

```sql
-- 範例：將 admin@example.com 設為管理員
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'admin@example.com'
);

-- 確認設定成功
SELECT 
  u.email,
  p.is_admin
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@example.com';
```

**移除管理員權限（通過 Email）：**

```sql
-- 移除特定 Email 的管理員權限
UPDATE public.profiles
SET is_admin = false
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);
```

### 3. 獲取 User ID

要獲取用戶的 User ID（用於設置管理員或開通訂閱）：

1. 登入 Supabase Dashboard
2. 進入 **Authentication** → **Users**
3. 找到目標用戶
4. 複製 **User UID**（這是 User ID）

## 🎯 使用管理後台

### 訪問後台

1. 使用管理員帳號登入應用
2. 訪問 `/admin` 路由
3. 如果權限不足，系統會自動導向儀表板

### 手動開通 Premium 訂閱

1. 在「手動開通 Premium 訂閱」表單中：
   - 輸入用戶的 **User ID**（UUID 格式）
   - 選擇訂閱方案（月度或年度）
   - （可選）設定自訂到期日期
2. 點擊「開通 Premium 訂閱」按鈕
3. 系統會自動更新用戶的訂閱狀態和到期日期

### 查看用戶列表

- 用戶列表會自動載入所有註冊用戶
- 顯示資訊包括：
  - User ID（前 8 個字符）
  - Email（需要配置 Admin API 才能顯示）
  - Premium 狀態
  - 訂閱到期日期
  - 最後更新時間

## ⚠️ 注意事項

### Email 顯示限制

目前用戶列表中的 Email 欄位可能顯示為空，因為獲取用戶 Email 需要 Supabase Admin API 支援。有兩種解決方案：

#### 方案 A：手動查詢（簡單但需手動操作）

1. 在 Supabase Dashboard 的 **Authentication** → **Users** 中查看用戶 Email
2. 使用 User ID 進行對應

#### 方案 B：配置 Admin API（推薦，可自動顯示 Email）

需要配置 Supabase Admin API 來獲取用戶 Email。這需要：

1. 在環境變數中添加 `SUPABASE_SERVICE_ROLE_KEY`
2. 創建一個服務端 API 路由來使用 Admin API 查詢用戶資訊
3. 更新 `admin/actions.ts` 中的 `getAllUsersAction` 函數

詳細配置步驟請參考 Supabase 文檔：[Admin API](https://supabase.com/docs/reference/javascript/admin-api)

### 安全性

- 只有 `is_admin = true` 的用戶才能訪問 `/admin` 路由
- RLS（Row Level Security）政策確保只有管理員可以：
  - 查看所有用戶的 profiles
  - 更新任何用戶的訂閱狀態
- 建議定期審查管理員名單，確保只有可信人員擁有管理權限

### 資料庫政策

RLS 政策已設置為：
- 管理員可以查看所有 profiles（用於用戶列表）
- 管理員可以更新任何 profile（用於開通訂閱）
- 普通用戶仍然只能查看和更新自己的 profile

## 🔄 常見操作

### 移除管理員權限

```sql
UPDATE public.profiles
SET is_admin = false
WHERE id = 'USER_ID';
```

### 批量設置管理員

```sql
-- 根據 Email 前綴設置（範例）
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%@yourcompany.com'
);
```

## 📝 測試清單

- [ ] 資料庫遷移已執行（`is_admin` 欄位已添加）
- [ ] RLS 政策已創建
- [ ] 至少一個用戶已設置為管理員
- [ ] 管理員可以訪問 `/admin` 路由
- [ ] 非管理員訪問 `/admin` 會被導向儀表板
- [ ] 手動開通訂閱功能正常運作
- [ ] 用戶列表可以正常顯示
- [ ] 訂閱狀態更新後可以正確反映在用戶列表中

## 🚀 下一步

1. 配置 Supabase Admin API 以顯示用戶 Email（可選）
2. 添加更多管理功能（如取消訂閱、修改到期日期等）
3. 添加審計日誌記錄管理操作
4. 實現批量操作功能

