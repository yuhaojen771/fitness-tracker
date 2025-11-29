# 台灣付款方案設定指南

由於 Stripe 和 PayPal 在台灣的支援有限，本指南提供適合台灣的付款方案。

> 📖 **訂閱功能比較**：如需了解各服務的訂閱功能和 API 易用性，請參考 [訂閱服務付款方案比較](./SUBSCRIPTION_PAYMENT_COMPARISON.md)

## 🎯 推薦方案

### 方案 1：綠界科技（ECPay）- 最推薦

綠界科技是台灣最常用的第三方金流服務，支援多種付款方式。

#### 優點
- ✅ 完全支援台灣本地銀行
- ✅ 支援多種付款方式（信用卡、ATM 轉帳、超商代碼等）
- ✅ 提供完整的 API 文件
- ✅ 適合台灣本地商家
- ✅ 手續費合理

#### 註冊步驟

1. **前往綠界科技官網**
   - 網址：https://www.ecpay.com.tw/
   - 點擊「立即註冊」

2. **選擇註冊類型**
   - 個人商家
   - 公司商家（推薦）

3. **填寫資料**
   - 基本資料
   - 銀行帳號資訊（用於收款）
   - 身份驗證

4. **取得 API 資訊**
   - 登入後台
   - 前往「系統開發管理」→「系統介接設定」
   - 取得：
     - MerchantID（商店代號）
     - HashKey
     - HashIV

#### 整合步驟

1. **安裝 SDK**

```bash
npm install ecpay-payment
```

2. **建立付款 API**

建立 `app/api/ecpay/create-order/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import ecpay from "ecpay-payment";

const ecpayPayment = new ecpay({
  MerchantID: process.env.ECPAY_MERCHANT_ID!,
  HashKey: process.env.ECPAY_HASH_KEY!,
  HashIV: process.env.ECPAY_HASH_IV!,
  ReturnURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/ecpay/return`,
  OrderResultURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
});

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = await request.json();
    
    const amount = plan === "monthly" ? 120 : 1200; // 台幣價格
    const itemName = plan === "monthly" 
      ? "Premium 訂閱 - 月繳方案" 
      : "Premium 訂閱 - 年繳方案";
    
    const orderParams = {
      MerchantTradeNo: `ORDER${Date.now()}${userId.slice(0, 8)}`,
      MerchantTradeDate: new Date().toISOString().replace(/[-:]/g, "").split(".")[0],
      TotalAmount: amount,
      TradeDesc: itemName,
      ItemName: itemName,
      ReturnURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/ecpay/return`,
      OrderResultURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&plan=${plan}&userId=${userId}`,
      ChoosePayment: "ALL", // 支援所有付款方式
      EncryptType: 1,
    };
    
    const formData = ecpayPayment.payment_client.aio_check_out_all(orderParams);
    
    return NextResponse.json({ formData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

3. **建立回傳處理 API**

建立 `app/api/ecpay/return/route.ts`：

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
      // 付款成功，更新訂閱狀態
      const userId = params.CustomField1; // 從自訂欄位取得
      const plan = params.CustomField2; // 從自訂欄位取得
      
      const supabase = createSupabaseServerClient();
      const subscriptionEndDate = plan === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      
      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          subscription_end_date: subscriptionEndDate.toISOString().split("T")[0],
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

4. **設定環境變數**

```env
ECPAY_MERCHANT_ID=your_merchant_id
ECPAY_HASH_KEY=your_hash_key
ECPAY_HASH_IV=your_hash_iv
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

### 方案 2：藍新金流（NewebPay）

藍新金流也是台灣常用的付款服務。

#### 優點
- ✅ 支援台灣本地銀行
- ✅ 提供完整的 API
- ✅ 適合台灣商家

#### 註冊步驟

1. 前往 https://www.newebpay.com/
2. 註冊商家帳號
3. 取得 API 資訊

#### 整合方式

類似綠界科技，需要：
- 安裝 SDK
- 建立付款 API
- 建立回傳處理 API

---

### 方案 3：手動收款（最簡單，立即可用）

如果暫時不想整合第三方金流，可以使用手動收款方案。

#### 優點
- ✅ 不需要註冊任何服務
- ✅ 可以立即上線
- ✅ 完全控制流程

#### 實作方式

系統已經內建了手動收款顯示功能。您只需要：

1. **不設定任何付款服務環境變數**
2. **設定客服信箱**（可選）：

```env
NEXT_PUBLIC_SUPPORT_EMAIL=your-email@example.com
```

3. **用戶完成付款後，手動更新訂閱狀態**

在 Supabase Dashboard 中：

```sql
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = CURRENT_DATE + INTERVAL '1 year'
WHERE id = 'user-id-here';
```

#### 改進手動收款流程

您可以修改 `premium-modal.tsx` 中的付款資訊，顯示：

- 銀行帳號
- 轉帳方式
- 付款金額
- 聯絡方式

---

### 方案 4：使用 QR Code 付款

結合手動收款，可以使用 QR Code 讓用戶掃碼付款。

#### 實作方式

1. 生成銀行帳號的 QR Code
2. 在 Premium Modal 中顯示 QR Code
3. 用戶掃碼付款後，手動更新訂閱狀態

---

## 📋 方案比較

| 方案 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **綠界科技** | 完整整合，多種付款方式 | 需要註冊和審核 | 正式運營 |
| **藍新金流** | 台灣本地服務 | 需要註冊和審核 | 正式運營 |
| **手動收款** | 最簡單，立即可用 | 需要人工處理 | 小規模運營 |
| **QR Code** | 方便用戶付款 | 仍需要人工處理 | 小規模運營 |

---

## 🚀 推薦流程

### 階段 1：立即上線（現在）

1. ✅ **使用手動收款方案**
   - 不設定任何付款服務
   - 系統會自動顯示付款資訊
   - 用戶完成付款後，手動更新訂閱狀態

2. ✅ **改進付款資訊顯示**
   - 在 Premium Modal 中顯示銀行帳號
   - 顯示付款金額和方式
   - 提供客服聯絡方式

### 階段 2：正式運營（未來）

1. **註冊綠界科技或藍新金流**
2. **整合付款 API**
3. **設定自動更新訂閱狀態**

---

## 💡 目前建議

**對於您的正式上線，建議：**

1. ✅ **先使用手動收款方案**
   - 可以立即上線
   - 不需要等待審核
   - 等用戶數量增加後再整合自動付款

2. ✅ **改進手動收款體驗**
   - 顯示清晰的付款資訊
   - 提供 QR Code（可選）
   - 設定客服信箱

3. ✅ **未來整合綠界科技**
   - 等產品穩定後
   - 用戶數量增加時
   - 再整合自動付款服務

---

## 📝 快速開始（手動收款）

1. **設定客服信箱**（在 `.env.local` 或 Vercel）：

```env
NEXT_PUBLIC_SUPPORT_EMAIL=your-email@example.com
```

2. **不設定任何付款服務環境變數**

3. **用戶完成付款後，手動更新訂閱狀態**

在 Supabase Dashboard 中執行：

```sql
UPDATE public.profiles
SET 
  is_premium = true,
  subscription_end_date = CURRENT_DATE + INTERVAL '1 year'
WHERE id = 'user-id-here';
```

---

## 🆘 需要協助？

如果您需要：
- **整合綠界科技**：我可以協助實作完整的整合代碼
- **整合藍新金流**：我可以協助評估和整合
- **改進手動收款流程**：我可以協助建立更專業的付款資訊顯示

請告訴我您的需求！

