# 快速修復：default_amount 欄位缺失

## 問題描述

如果看到錯誤訊息：
```
建立失敗 : Could not find the 'default_amount' column of 'expense_categories' in the schema cache
```

這表示資料庫中還沒有 `default_amount` 欄位。

## 解決方案

### 步驟 1：前往 Supabase Dashboard

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 點擊左側選單的 **SQL Editor**

### 步驟 2：執行 Migration

在 SQL Editor 中，複製並執行以下 SQL：

```sql
-- 為 expense_categories 表添加 default_amount 欄位（次類別的預設金額）
alter table public.expense_categories
add column if not exists default_amount numeric(12, 2);

-- 添加註解說明
comment on column public.expense_categories.default_amount is '次類別的預設金額（可選），選擇此次類別時可自動填入金額';
```

### 步驟 3：確認執行成功

執行後應該會看到：
```
Success. No rows returned
```

### 步驟 4：測試功能

1. 重新整理應用程式頁面
2. 嘗試新增次類別並設定預設金額
3. 確認功能正常運作

## 完整的 Migration 文件

完整的 migration 文件位於：
- `supabase/schema_expense_default_amount.sql`

如果需要執行完整的 migration，請參考該文件。

## 相關文件

- [EXPENSE_SETUP.md](./EXPENSE_SETUP.md) - 完整的記帳功能設定指南

