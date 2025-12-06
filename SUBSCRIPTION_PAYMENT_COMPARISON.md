# 訂閱服務付款方案比較

本文件比較各付款服務的訂閱功能和 API 易用性，幫助您選擇最適合的方案。

## 📊 方案比較表

| 服務 | 訂閱/自動續訂 | API 易用性 | 台灣支援 | 手續費 | 推薦度 |
|------|--------------|-----------|---------|--------|--------|
| **綠界科技（ECPay）** | ✅ 支援定期定額 | ⭐⭐⭐⭐ | ✅ 完全支援 | 約 2-3% | ⭐⭐⭐⭐⭐ |
| **藍新金流（NewebPay）** | ✅ 支援定期扣款 | ⭐⭐⭐⭐ | ✅ 完全支援 | 約 2-3% | ⭐⭐⭐⭐ |
| **Stripe** | ✅ 完整訂閱系統 | ⭐⭐⭐⭐⭐ | ❌ 台灣不支援 | 約 3.4% | ⭐⭐⭐ |
| **PayPal** | ✅ 支援訂閱 | ⭐⭐⭐ | ❌ 需要美國銀行 | 約 3.6% | ⭐⭐ |

---

## 🏆 推薦方案：綠界科技（ECPay）

### 為什麼推薦綠界科技？

#### ✅ 訂閱功能完整
- **定期定額扣款**：支援月繳、年繳等定期扣款
- **自動續訂**：用戶授權後自動扣款
- **訂閱管理**：可以查詢、修改、取消訂閱
- **Webhook 通知**：付款成功/失敗自動通知

#### ✅ API 易用性高
- **完整的 SDK**：提供 Node.js SDK，整合簡單
- **詳細的文件**：API 文件完整，範例豐富
- **技術支援**：提供技術支援服務
- **測試環境**：提供沙盒環境測試

#### ✅ 台灣本地服務
- **完全支援台灣**：不需要外國銀行帳號
- **多種付款方式**：信用卡、ATM、超商代碼等
- **本地客服**：中文客服支援

---

## 📋 詳細功能比較

### 綠界科技（ECPay）

#### 訂閱功能
- ✅ **定期定額扣款**：支援信用卡定期扣款
- ✅ **自動續訂**：設定後自動扣款
- ✅ **訂閱管理**：查詢、修改、取消訂閱
- ✅ **Webhook**：付款成功/失敗通知

#### API 易用性
- ✅ **Node.js SDK**：`ecpay-payment` 套件
- ✅ **RESTful API**：標準 REST API
- ✅ **完整文件**：https://www.ecpay.com.tw/Service/API_Dwnld
- ✅ **範例代碼**：提供多種語言範例

#### 整合難度
- **簡單**：使用 SDK 約 1-2 小時可完成基本整合
- **中等**：完整訂閱功能約 1-2 天

---

### 藍新金流（NewebPay）

#### 訂閱功能
- ✅ **定期扣款**：支援信用卡定期扣款
- ✅ **自動續訂**：設定後自動扣款
- ✅ **訂閱管理**：查詢、修改、取消訂閱
- ✅ **Webhook**：付款通知

#### API 易用性
- ✅ **RESTful API**：標準 REST API
- ✅ **完整文件**：提供 API 文件
- ⚠️ **無官方 SDK**：需要自行實作

#### 整合難度
- **中等**：需要自行實作 API 呼叫，約 2-3 天

---

### Stripe

#### 訂閱功能
- ✅ **完整訂閱系統**：最強大的訂閱功能
- ✅ **自動續訂**：完整的訂閱管理
- ✅ **多種計費模式**：月繳、年繳、使用量計費等
- ✅ **Webhook**：完整的事件通知

#### API 易用性
- ✅ **官方 SDK**：`stripe` 和 `@stripe/stripe-js`
- ✅ **最佳文件**：業界最完善的 API 文件
- ✅ **豐富範例**：大量範例和教學

#### 整合難度
- **簡單**：使用 SDK 約 1-2 小時可完成基本整合
- **簡單**：完整訂閱功能約半天

#### ⚠️ 限制
- ❌ **台灣不支援**：無法在台灣註冊商家帳號

---

## 🎯 最終推薦

### 方案 1：綠界科技（ECPay）- 最推薦 ⭐⭐⭐⭐⭐

**適合場景**：
- ✅ 台灣本地商家
- ✅ 需要訂閱/自動續訂功能
- ✅ 需要快速整合
- ✅ 需要多種付款方式

**優點**：
- 訂閱功能完整
- API 易用，有 SDK
- 台灣完全支援
- 文件完整

**缺點**：
- 手續費略高（約 2-3%）

---

### 方案 2：藍新金流（NewebPay）- 次選 ⭐⭐⭐⭐

**適合場景**：
- ✅ 台灣本地商家
- ✅ 需要訂閱功能
- ✅ 可以自行實作 API

**優點**：
- 訂閱功能完整
- 台灣完全支援
- 手續費合理

**缺點**：
- 無官方 SDK，需要自行實作
- 整合時間較長

---

## 🚀 綠界科技訂閱功能實作

### 步驟 1：註冊並取得 API 資訊

1. 前往 https://www.ecpay.com.tw/
2. 註冊商家帳號
3. 前往「系統開發管理」→「系統介接設定」
4. 取得：
   - MerchantID（商店代號）
   - HashKey
   - HashIV

### 步驟 2：安裝 SDK

```bash
npm install ecpay-payment
```

### 步驟 3：建立定期定額訂閱 API

建立 `app/api/ecpay/create-subscription/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import ecpay from "ecpay-payment";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ecpayPayment = new ecpay({
  MerchantID: process.env.ECPAY_MERCHANT_ID!,
  HashKey: process.env.ECPAY_HASH_KEY!,
  HashIV: process.env.ECPAY_HASH_IV!,
  ReturnURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/ecpay/subscription-return`,
  OrderResultURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
});

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = await request.json();
    
    const amount = plan === "monthly" ? 120 : 1200;
    const periodAmount = plan === "monthly" ? 120 : 1200;
    const periodType = plan === "monthly" ? "M" : "Y"; // M=月, Y=年
    const frequency = plan === "monthly" ? 1 : 1; // 每幾個週期扣款一次
    
    const subscriptionParams = {
      MerchantTradeNo: `SUB${Date.now()}${userId.slice(0, 8)}`,
      MerchantTradeDate: new Date().toISOString().replace(/[-:]/g, "").split(".")[0],
      TotalAmount: amount, // 首次付款金額
      TradeDesc: `Premium 訂閱 - ${plan === "monthly" ? "月繳" : "年繳"}方案`,
      ItemName: `Premium 訂閱 - ${plan === "monthly" ? "月繳" : "年繳"}方案`,
      ReturnURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/ecpay/subscription-return`,
      OrderResultURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success&plan=${plan}&userId=${userId}`,
      ChoosePayment: "Credit", // 僅信用卡支援定期定額
      PeriodAmount: periodAmount, // 定期定額金額
      PeriodType: periodType, // 週期類型
      Frequency: frequency, // 頻率
      ExecTimes: 999, // 執行次數（999 = 無限期）
      PeriodReturnURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/ecpay/period-return`, // 定期扣款回傳 URL
    };
    
    const formData = ecpayPayment.payment_client.aio_check_out_all(subscriptionParams);
    
    return NextResponse.json({ formData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 步驟 4：處理定期扣款通知

建立 `app/api/ecpay/period-return/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ecpay from "ecpay-payment";

const ecpayPayment = new ecpay({
  MerchantID: process.env.ECPAY_MERCHANT_ID!,
  HashKey: process.env.ECPAY_HASH_KEY!,
  HashIV: process.env.ECPAY_HASH_IV!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: any = {};
    
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });
    
    // 驗證回傳資料
    const isValid = ecpayPayment.checkout(params);
    
    if (isValid && params.RtnCode === "1") {
      // 定期扣款成功，更新訂閱到期日
      const userId = params.CustomField1;
      const plan = params.CustomField2;
      
      const supabase = createSupabaseServerClient();
      
      // 取得當前到期日
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_end_date")
        .eq("id", userId)
        .single();
      
      let newEndDate: Date;
      if (profile?.subscription_end_date) {
        const currentEndDate = new Date(profile.subscription_end_date);
        // 在當前到期日基礎上延長
        if (plan === "monthly") {
          currentEndDate.setMonth(currentEndDate.getMonth() + 1);
        } else {
          currentEndDate.setFullYear(currentEndDate.getFullYear() + 1);
        }
        newEndDate = currentEndDate;
      } else {
        // 如果沒有到期日，從今天開始計算
        newEndDate = new Date();
        if (plan === "monthly") {
          newEndDate.setMonth(newEndDate.getMonth() + 1);
        } else {
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        }
      }
      
      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          subscription_end_date: newEndDate.toISOString().split("T")[0],
        })
        .eq("id", userId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 步驟 5：更新 Premium Modal

修改 `premium-modal.tsx`，使用綠界科技訂閱 API：

```typescript
const handleECPaySubscription = async () => {
  const response = await fetch("/api/ecpay/create-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan: selectedPlan,
      userId: user.id,
    }),
  });
  
  const { formData } = await response.json();
  
  // 建立表單並提交到綠界科技
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";
  
  Object.keys(formData).forEach((key) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = formData[key];
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
};
```

---

## 📝 環境變數設定

在 `.env.local` 或 Vercel 中設定：

```env
# 綠界科技 API 資訊
ECPAY_MERCHANT_ID=your_merchant_id
ECPAY_HASH_KEY=your_hash_key
ECPAY_HASH_IV=your_hash_iv

# 應用網址
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## ✅ 總結

### 最佳選擇：綠界科技（ECPay）

**理由**：
1. ✅ **訂閱功能完整**：支援定期定額、自動續訂
2. ✅ **API 易用**：有官方 SDK，整合簡單
3. ✅ **台灣支援**：完全支援台灣本地商家
4. ✅ **文件完整**：API 文件和範例豐富
5. ✅ **技術支援**：提供技術支援服務

**整合時間**：
- 基本整合：1-2 小時
- 完整訂閱功能：1-2 天

---

## 🆘 需要協助？

如果您需要：
- **完整實作綠界科技訂閱功能**：我可以提供完整的代碼
- **整合其他服務**：我可以協助評估和整合
- **測試訂閱流程**：我可以協助建立測試環境

請告訴我您的需求！



