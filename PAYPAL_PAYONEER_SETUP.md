# PayPal + Payoneer 整合設定指南

本指南說明如何將 PayPal 與 Payoneer 結合使用，實現完整的收款和付款流程。

## 🎯 架構說明

### PayPal + Payoneer 工作流程

1. **用戶付款** → 使用 PayPal 付款
2. **PayPal 收款** → 款項進入 PayPal 帳戶
3. **Payoneer 提領** → 從 PayPal 提領到 Payoneer（或直接使用 Payoneer 收款）

### 兩種整合方式

#### 方式 A：PayPal 收款 + Payoneer 提領（推薦）

- 用戶使用 PayPal 付款
- 款項進入 PayPal 帳戶
- 定期從 PayPal 提領到 Payoneer
- 從 Payoneer 提領到本地銀行

#### 方式 B：Payoneer 直接收款

- 使用 Payoneer 的付款請求功能
- 用戶透過 Payoneer 付款
- 款項直接進入 Payoneer

---

## 📋 PayPal 串接步驟

### 步驟 1：建立 PayPal 商家帳號

1. **前往 PayPal Business**
   - 網址：https://www.paypal.com/businessmanage
   - 註冊或登入商家帳號

2. **連結 Payoneer 帳戶**（可選）
   - 在 PayPal 設定中，可以連結 Payoneer 作為提領帳戶
   - 或手動從 PayPal 提領到 Payoneer

### 步驟 2：建立付款按鈕/連結

#### 方法 A：使用 PayPal Button Generator（最簡單）

1. **前往 PayPal Button Generator**
   - 網址：https://www.paypal.com/buttonfactory/
   - 或登入 PayPal Business Dashboard → 工具 → PayPal 按鈕

2. **建立月繳方案按鈕**
   - 按鈕類型：選擇「**購買**」（Buy Now）
   - 商品名稱：`Premium 訂閱 - 月繳方案`
   - 價格：`3.99`
   - 貨幣：`USD`
   - 點擊「建立按鈕」

3. **取得按鈕 ID**
   - 從生成的 HTML 代碼中取得 `hosted_button_id`
   - 或直接複製付款連結

4. **建立年繳方案按鈕**
   - 重複步驟 2，價格設為 `39.99`

#### 方法 B：使用 PayPal Checkout API（進階）

如果需要更靈活的控制，可以使用 PayPal Checkout API。

### 步驟 3：設定環境變數

在 `.env.local` 或 Vercel 環境變數中設定：

```env
# PayPal 正式環境付款連結
NEXT_PUBLIC_PAYPAL_LIVE_URL=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID

# 或分別設定月繳和年繳（向後兼容）
NEXT_PUBLIC_PAYPAL_MONTHLY_LINK=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MONTHLY_BUTTON_ID
NEXT_PUBLIC_PAYPAL_YEARLY_LINK=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YEARLY_BUTTON_ID
```

### 步驟 4：設定 PayPal Webhook（自動更新訂閱狀態）

#### 4.1 建立 Webhook 端點

建立 `app/api/webhooks/paypal/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: any = {};
    
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });
    
    // PayPal IPN 驗證
    const verifyUrl = process.env.NODE_ENV === "production"
      ? "https://ipnpb.paypal.com/cgi-bin/webscr"
      : "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr";
    
    // 驗證 IPN（簡化版，實際應完整驗證）
    const verificationParams = new URLSearchParams({
      cmd: "_notify-validate",
      ...params,
    });
    
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      body: verificationParams,
    });
    
    const verificationResult = await verifyResponse.text();
    
    if (verificationResult === "VERIFIED") {
      // 付款成功處理
      if (params.payment_status === "Completed") {
        const customField = params.custom || params.item_number; // 從自訂欄位取得用戶 ID
        const plan = params.item_name?.includes("月繳") ? "monthly" : "yearly";
        
        if (customField) {
          const supabase = createSupabaseServerClient();
          
          // 解析用戶 ID（假設格式為 userId-plan）
          const [userId] = customField.split("-");
          
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
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("PayPal Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### 4.2 在 PayPal 設定 Webhook

1. 登入 PayPal Business Dashboard
2. 前往「**帳戶設定**」→「**網站偏好設定**」
3. 找到「**即時付款通知 (IPN)**」
4. 設定通知 URL：`https://your-domain.com/api/webhooks/paypal`
5. 選擇要接收的事件類型

---

## 💰 Payoneer 提領設定

### 從 PayPal 提領到 Payoneer

1. **在 PayPal 中設定提領**
   - 登入 PayPal Business Dashboard
   - 前往「**錢包**」→「**提領資金**」
   - 選擇「**提領到銀行帳戶**」
   - 連結 Payoneer 帳戶（如果支援）

2. **或手動提領**
   - 從 PayPal 提領到 Payoneer 的銀行帳戶
   - 或使用 Payoneer 的收款功能

### Payoneer 收款設定

如果直接使用 Payoneer 收款：

1. **建立付款請求**
   - 登入 Payoneer Dashboard
   - 建立付款請求連結
   - 分享給用戶

2. **整合到應用**
   - 可以將 Payoneer 付款連結整合到 Premium Modal
   - 類似 PayPal 的整合方式

---

## 🔧 完整整合代碼

### 更新 Premium Modal

系統已經支援 PayPal 連結，您只需要：

1. **設定環境變數**

```env
NEXT_PUBLIC_PAYPAL_LIVE_URL=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID
```

2. **系統會自動使用 PayPal 連結**

當用戶點擊「立即訂閱」時，會自動跳轉到 PayPal 付款頁面。

### 添加用戶 ID 到 PayPal 按鈕

為了在 Webhook 中識別用戶，需要在 PayPal 按鈕中添加自訂欄位：

1. **在 PayPal Button Generator 中**
   - 建立按鈕時，在「**自訂欄位**」中添加用戶 ID
   - 或使用 `item_number` 欄位

2. **動態生成付款連結**

修改 Premium Modal，動態添加用戶 ID：

```typescript
// 在 premium-modal.tsx 中
const paypalUrl = process.env.NEXT_PUBLIC_PAYPAL_LIVE_URL;
const userCustomField = `${userId}-${selectedPlan}`;

// 添加自訂欄位到 PayPal URL
const finalPaypalUrl = paypalUrl?.includes('?')
  ? `${paypalUrl}&custom=${encodeURIComponent(userCustomField)}`
  : `${paypalUrl}?custom=${encodeURIComponent(userCustomField)}`;
```

---

## 📝 完整實作範例

### 1. 建立 PayPal 付款 API（可選，用於動態生成）

建立 `app/api/paypal/create-payment/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = await request.json();
    
    // 取得基礎 PayPal 連結
    const baseUrl = process.env.NEXT_PUBLIC_PAYPAL_LIVE_URL || 
                   (plan === "monthly" 
                     ? process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_LINK 
                     : process.env.NEXT_PUBLIC_PAYPAL_YEARLY_LINK);
    
    if (!baseUrl) {
      return NextResponse.json(
        { error: "PayPal URL not configured" },
        { status: 400 }
      );
    }
    
    // 添加用戶 ID 到自訂欄位
    const customField = `${userId}-${plan}`;
    const finalUrl = baseUrl.includes('?')
      ? `${baseUrl}&custom=${encodeURIComponent(customField)}`
      : `${baseUrl}?custom=${encodeURIComponent(customField)}`;
    
    return NextResponse.json({ url: finalUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 2. 更新 Premium Modal 使用動態連結

修改 `premium-modal.tsx`：

```typescript
const handlePayPalPayment = async () => {
  // 使用動態生成的 PayPal 連結
  const response = await fetch("/api/paypal/create-payment", {
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

## ✅ 檢查清單

### PayPal 設定
- [ ] 註冊 PayPal 商家帳號
- [ ] 建立付款按鈕（月繳和年繳）
- [ ] 取得按鈕 ID 或付款連結
- [ ] 設定環境變數 `NEXT_PUBLIC_PAYPAL_LIVE_URL`
- [ ] 設定 IPN Webhook URL：`https://your-domain.com/api/webhooks/paypal`
- [ ] 測試 Webhook 接收

### Payoneer 設定
- [ ] 確認 Payoneer 帳戶已審核通過
- [ ] 在 PayPal 中設定提領到 Payoneer（可選）
- [ ] 或設定 Payoneer 直接收款（可選）

### 應用整合
- [ ] 更新環境變數（本地和 Vercel）
- [ ] 部署應用
- [ ] 測試付款流程
- [ ] 測試 Webhook 自動更新訂閱狀態
- [ ] 確認訂閱狀態正確更新

### 功能驗證
- [ ] 用戶點擊「立即訂閱」跳轉到 PayPal
- [ ] 完成付款後 Webhook 收到通知
- [ ] 訂閱狀態自動更新為 Premium
- [ ] 到期日正確計算（月繳 +1 個月，年繳 +1 年）
- [ ] 取消訂閱功能正常

---

## 🚀 快速開始

### 步驟 1：建立 PayPal 付款按鈕

1. **前往 PayPal Button Generator**
   - 網址：https://www.paypal.com/buttonfactory/
   - 或登入 PayPal Business Dashboard → 工具 → PayPal 按鈕

2. **建立月繳方案按鈕**
   - 按鈕類型：選擇「**購買**」（Buy Now）
   - 商品名稱：`Premium 訂閱 - 月繳方案`
   - 價格：`3.99`
   - 貨幣：`USD`
   - 點擊「建立按鈕」

3. **取得按鈕 ID**
   - 從生成的 HTML 代碼中取得 `hosted_button_id`
   - 格式：`https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID`

4. **建立年繳方案按鈕**
   - 重複步驟 2，價格設為 `39.99`

### 步驟 2：設定環境變數

在 `.env.local` 或 Vercel 環境變數中設定：

```env
# 【推薦】分別設定月繳和年繳按鈕（最靈活）
# 月繳方案 PayPal 付款連結
NEXT_PUBLIC_PAYPAL_MONTHLY_LINK=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_MONTHLY_BUTTON_ID

# 年繳方案 PayPal 付款連結
NEXT_PUBLIC_PAYPAL_YEARLY_LINK=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_YEARLY_BUTTON_ID

# 【備選】如果月繳和年繳使用同一個按鈕，可以使用統一連結
# NEXT_PUBLIC_PAYPAL_LIVE_URL=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID
```

**重要**：將 `YOUR_MONTHLY_BUTTON_ID` 和 `YOUR_YEARLY_BUTTON_ID` 替換為您在步驟 1 取得的實際按鈕 ID。

### 步驟 3：設定 PayPal Webhook（自動更新訂閱狀態）

#### 3.1 取得您的 Vercel 部署 URL

**不需要購買網域！** 您可以使用 Vercel 提供的免費域名。

1. **查看您的 Vercel 部署 URL**
   - 前往 [Vercel Dashboard](https://vercel.com/dashboard)
   - 選擇您的專案
   - 在專案概覽頁面，您會看到部署 URL
   - 格式通常是：`https://your-project-name.vercel.app`

2. **如果還沒有部署**
   - 先完成 Vercel 部署（參考 [Vercel 部署指南](./VERCEL_DEPLOYMENT.md)）
   - 部署完成後會自動獲得免費域名

#### 3.2 設定 PayPal IPN 通知 URL

1. **登入 PayPal Business Dashboard**
   - 前往：https://www.paypal.com/businessmanage
   - 使用您的 PayPal 商家帳號登入

2. **前往 IPN 設定頁面**
   - 點擊右上角「**設定**」（Settings）圖示
   - 或前往「**帳戶設定**」→「**網站偏好設定**」
   - 找到「**即時付款通知 (IPN)**」區塊
   - 點擊「**更新**」或「**設定**」

3. **輸入通知 URL**
   - 在「**通知 URL**」欄位中輸入：
     ```
     https://your-project-name.vercel.app/api/webhooks/paypal
     ```
   - **將 `your-project-name.vercel.app` 替換為您實際的 Vercel 域名**
   - 例如：`https://fitness-tracker-abc123.vercel.app/api/webhooks/paypal`

4. **儲存設定**
   - 點擊「**儲存**」或「**啟用**」
   - PayPal 會驗證 URL 是否可訪問

#### 3.3 測試 Webhook（可選但推薦）

1. **使用 PayPal IPN 測試工具**
   - 在 PayPal Business Dashboard 中
   - 前往「**工具**」→「**IPN 測試工具**」
   - 或直接訪問：https://developer.paypal.com/developer/ipnSimulator
   - 輸入您的 Webhook URL
   - 發送測試通知

2. **檢查 Vercel 日誌**
   - 前往 Vercel Dashboard → 您的專案 → Deployments
   - 查看最新的部署日誌
   - 確認 Webhook 端點有收到請求

3. **驗證功能**
   - 完成一筆測試付款
   - 檢查 Supabase 中的訂閱狀態是否自動更新

#### 3.4 如果使用自訂網域（可選）

如果您之後購買了自訂網域：

1. **在 Vercel 設定自訂網域**
   - 前往 Vercel Dashboard → 您的專案 → Settings → Domains
   - 添加您的自訂網域
   - 按照指示設定 DNS

2. **更新 PayPal IPN URL**
   - 將 PayPal IPN 通知 URL 更新為：
     ```
     https://your-custom-domain.com/api/webhooks/paypal
     ```

### 步驟 4：部署應用

1. **推送代碼到 GitHub**
2. **在 Vercel 設定環境變數**
   - 前往 Vercel Dashboard → Settings → Environment Variables
   - 新增 `NEXT_PUBLIC_PAYPAL_LIVE_URL`
   - 選擇環境：Production
3. **重新部署**

### 步驟 5：測試付款流程

1. **測試付款**
   - 在正式環境中點擊「立即訂閱」
   - 完成 PayPal 付款流程
   - 確認 Webhook 收到通知
   - 確認訂閱狀態自動更新

### 步驟 6：Payoneer 提領設定

1. **從 PayPal 提領到 Payoneer**
   - 登入 PayPal Business Dashboard
   - 前往「**錢包**」→「**提領資金**」
   - 選擇提領方式（銀行帳戶或 Payoneer）
   - 設定提領金額和頻率

2. **或使用 Payoneer 直接收款**（可選）
   - 登入 Payoneer Dashboard
   - 建立付款請求
   - 整合到應用中

---

## 💡 Payoneer 使用建議

### 方式 1：PayPal 收款 → Payoneer 提領

1. 用戶透過 PayPal 付款
2. 款項進入 PayPal 帳戶
3. 定期從 PayPal 提領到 Payoneer
4. 從 Payoneer 提領到本地銀行

### 方式 2：Payoneer 直接收款

1. 使用 Payoneer 的付款請求功能
2. 建立付款連結
3. 整合到應用中（類似 PayPal 的方式）

---

## 📚 相關資源

- [PayPal Business Dashboard](https://www.paypal.com/businessmanage)
- [PayPal Button Generator](https://www.paypal.com/buttonfactory/)
- [PayPal IPN 文件](https://developer.paypal.com/docs/api-basics/notifications/ipn/)
- [Payoneer 官網](https://www.payoneer.com/)

---

## 🆘 需要協助？

如果您需要：
- **完整實作 PayPal Webhook**：我可以提供完整的驗證和處理代碼
- **整合 Payoneer 付款**：我可以協助評估和整合
- **動態生成付款連結**：我可以協助實作

請告訴我您的需求！

