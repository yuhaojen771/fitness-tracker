# 記帳功能設定指南

本文檔說明如何設定記帳功能的資料庫和環境。

## 📋 資料庫設定

### 步驟 1：執行資料庫 Migration

在 Supabase Dashboard 中執行以下 SQL：

1. 前往 Supabase Dashboard → SQL Editor
2. 複製 `supabase/schema_expense.sql` 的內容
3. 貼上並執行

或者直接執行：

```sql
-- 執行 schema_expense.sql 中的所有 SQL 語句
```

### 步驟 2：驗證資料表

確認以下資料表已建立：

- ✅ `expense_categories` - 記帳類別表
- ✅ `expense_records` - 記帳記錄表

確認 RLS (Row Level Security) 已啟用：

- ✅ `expense_categories` 的 RLS 政策
- ✅ `expense_records` 的 RLS 政策

## 🎯 功能說明

### 核心功能

1. **記帳記錄**
   - 新增支出/收入記錄
   - 編輯記錄
   - 刪除記錄
   - 按月份查看記錄

2. **類別管理**
   - 預設類別（不可刪除）
   - 自訂類別（可新增/編輯/刪除）
   - 類別圖示和顏色

3. **統計功能**
   - 月度總支出
   - 月度總收入
   - 月度結餘
   - 支出分類統計（圓餅圖/長條圖）

### 預設類別

系統會在用戶首次使用時自動建立以下預設類別：

**支出類別：**
- 🍽️ 餐飲
- 🚗 交通
- 🛍️ 購物
- 🎮 娛樂
- 🏥 醫療
- 📚 教育
- 📝 其他

**收入類別：**
- 💰 薪資
- 📈 投資
- 🎁 獎金

## 🚀 使用方式

### 訪問記帳功能

1. 登入後，在導航列點擊「記帳」切換到記帳工具
2. 或直接訪問 `/expense/dashboard`

### 新增記帳

1. 在記帳表單中選擇類型（支出/收入）
2. 輸入金額
3. 選擇類別（可選）
4. 選擇日期（預設為今天）
5. 輸入備註（可選）
6. 點擊「儲存記錄」

### 管理類別

1. 點擊「管理類別」按鈕
2. 新增自訂類別：
   - 輸入類別名稱
   - 選擇圖示（emoji）
   - 選擇顏色
3. 編輯或刪除自訂類別

## 📊 資料結構

### expense_records 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid | 主鍵 |
| user_id | uuid | 用戶 ID |
| type | text | 類型：'expense' 或 'income' |
| amount | numeric(12,2) | 金額 |
| category_id | uuid | 類別 ID（可為 null） |
| date | date | 日期 |
| note | text | 備註（可選） |
| created_at | timestamptz | 建立時間 |
| updated_at | timestamptz | 更新時間 |

### expense_categories 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid | 主鍵 |
| user_id | uuid | 用戶 ID |
| name | text | 類別名稱 |
| icon | text | 圖示（emoji） |
| color | text | 顏色（hex code） |
| is_default | boolean | 是否為預設類別 |
| created_at | timestamptz | 建立時間 |
| updated_at | timestamptz | 更新時間 |

## 🔒 安全性

- ✅ 所有資料表都啟用了 RLS (Row Level Security)
- ✅ 用戶只能查看和管理自己的記錄
- ✅ 預設類別不可刪除
- ✅ 有記錄使用的類別不可刪除

## 🐛 故障排除

### 問題：無法看到記帳功能

**解決方案：**
1. 確認已執行 `schema_expense.sql`
2. 確認 RLS 政策已正確設定
3. 確認用戶已登入

### 問題：無法新增類別

**解決方案：**
1. 確認類別名稱不重複
2. 確認類別名稱不超過 20 個字元
3. 檢查瀏覽器控制台是否有錯誤訊息

### 問題：無法刪除類別

**解決方案：**
1. 確認不是預設類別（預設類別不可刪除）
2. 確認沒有記錄使用此類別
3. 先刪除使用此類別的記錄，再刪除類別

## 📝 未來功能規劃

- [ ] 匯出 CSV/Excel
- [ ] 搜尋和篩選功能
- [ ] 年度統計報表
- [ ] 預算設定和提醒
- [ ] 圖表視覺化（圓餅圖、長條圖）
- [ ] AI 自動分類（v2）

## 🔗 相關文件

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 部署指南
- [SUPABASE_GOOGLE_OAUTH_SETUP.md](./SUPABASE_GOOGLE_OAUTH_SETUP.md) - OAuth 設定

