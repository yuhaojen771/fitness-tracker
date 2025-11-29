import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * PayPal 付款連結生成 API
 * 
 * 動態生成包含用戶 ID 的 PayPal 付款連結
 * 這樣在 Webhook 中可以識別是哪個用戶完成付款
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證用戶身份
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { plan } = await request.json();
    
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }
    
    // 取得基礎 PayPal 連結
    // 優先使用分別的月繳/年繳連結，如果沒有則使用統一連結
    let baseUrl: string | undefined;
    
    if (plan === "monthly") {
      // 月繳方案：優先使用月繳專用連結
      baseUrl = process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_LINK || 
                process.env.NEXT_PUBLIC_PAYPAL_LIVE_URL;
    } else {
      // 年繳方案：優先使用年繳專用連結
      baseUrl = process.env.NEXT_PUBLIC_PAYPAL_YEARLY_LINK || 
                process.env.NEXT_PUBLIC_PAYPAL_LIVE_URL;
    }
    
    // 如果都沒有設定，檢查是否有測試連結（開發環境）
    if (!baseUrl || baseUrl === "#") {
      baseUrl = process.env.NEXT_PUBLIC_PAYPAL_TEST_URL;
    }
    
    if (!baseUrl || baseUrl === "#") {
      return NextResponse.json(
        { error: "PayPal URL not configured. Please set NEXT_PUBLIC_PAYPAL_MONTHLY_LINK and NEXT_PUBLIC_PAYPAL_YEARLY_LINK, or NEXT_PUBLIC_PAYPAL_LIVE_URL" },
        { status: 400 }
      );
    }
    
    // 建立自訂欄位：userId-plan
    // PayPal 會將此欄位在 IPN 通知中回傳，用於識別用戶
    const customField = `${user.id}-${plan}`;
    
    // 將用戶 ID 和方案添加到 PayPal URL
    // PayPal 支援 custom 參數來傳遞自訂資料
    const url = new URL(baseUrl);
    url.searchParams.set("custom", customField);
    
    // 也可以使用 item_number 參數（某些 PayPal 按鈕類型支援）
    url.searchParams.set("item_number", customField);
    
    return NextResponse.json({ 
      url: url.toString(),
      customField // 返回自訂欄位供調試使用
    });
  } catch (error: any) {
    console.error("PayPal payment creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

