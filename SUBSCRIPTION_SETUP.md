# 訂閱功能設定指南

本文檔說明如何設定「個人健康數據追蹤器」的訂閱功能，包括手動金流、訂閱管理和提醒系統。

## 📋 目錄

1. [資料庫設定](#資料庫設定)
2. [手動金流設定](#手動金流設定)
3. [訂閱提醒系統](#訂閱提醒系統)
4. [環境變數設定](#環境變數設定)

## 🗄️ 資料庫設定

### 1. 執行 Schema 更新

執行以下 SQL 來添加 `subscription_end_date` 欄位：

```sql
-- 執行此檔案
supabase/schema_subscription.sql
```

或手動執行：

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_end_date DATE;

COMMENT ON COLUMN public.profiles.subscription_end_date IS 
'Premium 訂閱到期日期，用於自動提醒和訂閱管理';
```

## 💳 手動金流設定

### PayPal Checkout 連結設定

1. **建立 PayPal 付款連結**：
   - 登入 PayPal 商家帳號
   - 前往「工具」→「建立付款連結」
   - 建立兩個連結：
     - 月繳方案：US$3.99
     - 年繳方案：US$39.99

2. **設定環境變數**：

在 `.env.local` 或部署環境中設定：

```env
NEXT_PUBLIC_PAYPAL_MONTHLY_LINK=https://www.paypal.com/checkoutnow?token=YOUR_MONTHLY_TOKEN
NEXT_PUBLIC_PAYPAL_YEARLY_LINK=https://www.paypal.com/checkoutnow?token=YOUR_YEARLY_TOKEN
```

3. **付款完成後的處理**：

目前系統使用模擬升級。實際應用中，您需要：

- **選項 A：手動更新**（MVP 階段）
  - 用戶付款後，手動在 Supabase 後台更新 `is_premium` 和 `subscription_end_date`
  
- **選項 B：Webhook 自動更新**（生產環境）
  - 設定 PayPal IPN (Instant Payment Notification) Webhook
  - 建立 API 路由接收 Webhook，自動更新用戶訂閱狀態
  - 範例路由：`/api/webhooks/paypal`

### 範例 Webhook 處理（未來實作）

```typescript
// app/api/webhooks/paypal/route.ts
export async function POST(request: Request) {
  // 驗證 PayPal IPN
  // 更新用戶的 is_premium 和 subscription_end_date
  // 發送確認郵件
}
```

## 📧 訂閱提醒系統

### Supabase Edge Function 設定

1. **部署 Edge Function**：

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入 Supabase
supabase login

# 連結專案
supabase link --project-ref YOUR_PROJECT_REF

# 部署函式
supabase functions deploy send-subscription-reminder
```

2. **設定環境變數**：

在 Supabase Dashboard → Edge Functions → send-subscription-reminder → Settings：

- `SUPABASE_URL`: 您的 Supabase 專案 URL
- `SUPABASE_SERVICE_ROLE_KEY`: 服務角色金鑰（用於繞過 RLS）

3. **設定 Cron Job**：

在 Supabase Dashboard → Database → Cron Jobs，建立新的排程：

```sql
-- 每天 UTC 00:00 執行
SELECT cron.schedule(
  'send-subscription-reminders',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/send-subscription-reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

或使用外部排程服務（如 GitHub Actions、Vercel Cron）：

```yaml
# .github/workflows/subscription-reminder.yml
name: Send Subscription Reminders
on:
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 00:00
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-subscription-reminder \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

4. **設定郵件發送服務**：

在 `supabase/functions/send-subscription-reminder/index.ts` 中實作實際的郵件發送邏輯。

**選項 A：使用 Supabase Email**（如果可用）

**選項 B：使用第三方服務**（推薦）
- SendGrid
- Resend
- AWS SES
- Mailgun

範例（使用 Resend）：

```typescript
import { Resend } from 'resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: user.email,
  subject: '您的 Premium 訂閱即將到期',
  html: `
    <h1>訂閱即將到期提醒</h1>
    <p>您的 Premium 訂閱將在 ${subscriptionEndDate} 到期。</p>
    <p>請及時續訂以繼續享受 Premium 功能。</p>
    <a href="${renewalLink}">立即續訂</a>
  `
});
```

## 🔧 環境變數設定

完整的環境變數清單：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PayPal（手動金流）
NEXT_PUBLIC_PAYPAL_MONTHLY_LINK=your_monthly_link
NEXT_PUBLIC_PAYPAL_YEARLY_LINK=your_yearly_link

# 郵件服務（Edge Function）
RESEND_API_KEY=your_resend_key
# 或
SENDGRID_API_KEY=your_sendgrid_key
```

## ✅ 測試清單

- [ ] 資料庫 schema 已更新（包含 `subscription_end_date`）
- [ ] PayPal 付款連結已設定並測試
- [ ] 環境變數已正確設定
- [ ] Premium Modal 顯示正確的付款連結
- [ ] 訂閱管理介面可正常開啟
- [ ] 取消訂閱功能正常運作
- [ ] 到期提醒橫幅在 7 天內正確顯示
- [ ] Edge Function 已部署
- [ ] Cron Job 已設定
- [ ] 郵件發送功能已測試

## 📝 注意事項

1. **手動金流階段**：目前為 MVP 版本，付款完成後需手動更新訂閱狀態
2. **生產環境**：建議實作 Webhook 自動更新機制
3. **郵件發送**：確保遵守各國反垃圾郵件法規（如 GDPR、CAN-SPAM）
4. **安全性**：不要在前端暴露服務角色金鑰，僅在 Edge Function 中使用

## 🚀 下一步

1. 實作 PayPal Webhook 自動更新
2. 整合 Stripe 或其他金流服務
3. 添加更多付款方式（信用卡、銀行轉帳等）
4. 實作自動續訂功能
5. 添加訂閱歷史記錄

