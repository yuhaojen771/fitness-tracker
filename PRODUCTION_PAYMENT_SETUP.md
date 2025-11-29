# 正式上線付款設定指南

本指南說明如何為正式上線設定付款功能，不使用模擬訂閱。

## 🎯 方案選擇

### 方案 1：手動收款 + 手動更新（最簡單，立即可用）

適合小規模運營，用戶數量不多時使用。

#### 優點
- ✅ 不需要整合任何付款服務
- ✅ 不需要銀行帳號驗證
- ✅ 可以立即上線
- ✅ 完全控制付款流程

#### 設定步驟

1. **設定客服信箱**（可選）

在 `.env.local` 或 Vercel 環境變數中設定：

```env
NEXT_PUBLIC_SUPPORT_EMAIL=your-email@example.com
```

2. **修改付款資訊**

在 `premium-modal.tsx` 中，系統會自動顯示付款資訊。您可以修改顯示的內容：

- 銀行帳號
- 轉帳方式
- 聯絡方式

3. **手動更新訂閱狀態**

用戶完成付款後，在 Supabase Dashboard 中手動更新：

```sql
-- 更新為 Premium 會員（年繳方案，1 年後到期）
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = CURRENT_DATE + INTERVAL '1 year'
WHERE id = 'user-id-here';
```

---

### 方案 2：整合 Stripe（推薦用於正式環境）

Stripe 支援全球多個國家，不需要美國銀行帳號。

#### 優點
- ✅ 支援全球多個國家（包括台灣、香港、新加坡等）
- ✅ 不需要美國銀行帳號
- ✅ 提供完整的 API 和 Webhook 整合
- ✅ 支援多種付款方式（信用卡、Apple Pay、Google Pay 等）
- ✅ 自動處理付款和訂閱管理

#### 快速整合步驟

1. **註冊 Stripe 帳號**
   - 前往 [Stripe 官網](https://stripe.com/)
   - 選擇您的國家/地區註冊
   - 完成商家驗證

2. **取得 API 金鑰**
   - 在 Stripe Dashboard → Developers → API keys
   - 複製 **Publishable key** 和 **Secret key**

3. **設定環境變數**

在 `.env.local` 或 Vercel 中設定：

```env
# Stripe 公開金鑰（客戶端使用）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe 私密金鑰（伺服器端使用，不要暴露給客戶端）
STRIPE_SECRET_KEY=sk_live_...

# Stripe Webhook 密鑰（用於驗證 Webhook）
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. **安裝 Stripe SDK**

```bash
npm install stripe @stripe/stripe-js
```

5. **建立付款 API 路由**

建立 `app/api/stripe/create-checkout/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = await request.json();
    
    const priceId = plan === "monthly" 
      ? process.env.STRIPE_MONTHLY_PRICE_ID!
      : process.env.STRIPE_YEARLY_PRICE_ID!;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      client_reference_id: userId,
      metadata: {
        plan,
        userId,
      },
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

6. **建立 Webhook 路由**

建立 `app/api/stripe/webhook/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }
  
  // 處理訂閱成功事件
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as "monthly" | "yearly";
    
    if (userId) {
      const supabase = createSupabaseServerClient();
      const subscriptionEndDate = plan === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 天後
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 年後
      
      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          subscription_end_date: subscriptionEndDate.toISOString().split("T")[0],
        })
        .eq("id", userId);
    }
  }
  
  return NextResponse.json({ received: true });
}
```

7. **更新 Premium Modal**

修改 `premium-modal.tsx`，使用 Stripe Checkout：

```typescript
const handleStripeCheckout = async () => {
  const response = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan: selectedPlan,
      userId: user.id, // 需要從 props 傳入
    }),
  });
  
  const { url } = await response.json();
  if (url) {
    window.location.href = url;
  }
};
```

---

### 方案 3：使用其他付款服務

根據您的目標市場選擇：

- **台灣**：綠界科技（ECPay）、藍新金流（NewebPay）
- **東南亞**：MOLPay
- **印度**：Razorpay
- **中國**：支付寶、微信支付

---

## 📋 正式上線檢查清單

### 環境設定
- [ ] 移除或隱藏模擬訂閱功能
- [ ] 設定付款服務（Stripe、PayPal 或其他）
- [ ] 設定環境變數
- [ ] 測試付款流程

### 功能測試
- [ ] 測試付款連結是否正常
- [ ] 測試付款完成後的狀態更新
- [ ] 測試訂閱到期提醒
- [ ] 測試取消訂閱功能

### 安全設定
- [ ] 確認環境變數不會暴露給客戶端
- [ ] 設定 Webhook 驗證
- [ ] 檢查付款金額是否正確
- [ ] 確認用戶身份驗證

### 客服準備
- [ ] 設定客服信箱
- [ ] 準備付款問題處理流程
- [ ] 準備退款政策
- [ ] 準備訂閱管理說明

---

## 🚀 快速上線（手動收款方案）

如果您想立即上線，使用手動收款方案：

1. **不設定任何付款服務環境變數**
2. **系統會自動顯示付款資訊**
3. **用戶完成付款後，手動在 Supabase 更新訂閱狀態**

這樣就可以立即上線，等用戶數量增加後再整合自動付款服務。

---

## 📚 相關文檔

- [Stripe 整合指南](./STRIPE_SETUP.md) - Stripe 詳細整合步驟（如需要）
- [付款方式替代方案](./PAYMENT_ALTERNATIVES.md) - 各種付款方案比較
- [訂閱功能設定指南](./SUBSCRIPTION_SETUP.md) - 訂閱功能完整說明

---

## 🆘 需要協助？

如果您需要：
- **整合 Stripe**：我可以協助實作完整的 Stripe 整合
- **整合其他付款服務**：我可以協助評估和整合
- **改進手動收款流程**：我可以協助建立管理工具

請告訴我您的需求！

