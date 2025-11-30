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
    
    let plan: string;
    try {
      const body = await request.json();
      plan = body.plan;
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      console.error("Invalid plan:", plan);
      return NextResponse.json(
        { error: `Invalid plan: ${plan}. Must be "monthly" or "yearly"` },
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
      console.error("PayPal URL not configured for plan:", plan, {
        monthly: process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_LINK,
        yearly: process.env.NEXT_PUBLIC_PAYPAL_YEARLY_LINK,
        live: process.env.NEXT_PUBLIC_PAYPAL_LIVE_URL,
        test: process.env.NEXT_PUBLIC_PAYPAL_TEST_URL
      });
      return NextResponse.json(
        { 
          error: `PayPal 付款連結未設定。請在環境變數中設定 ${plan === "monthly" ? "NEXT_PUBLIC_PAYPAL_MONTHLY_LINK" : "NEXT_PUBLIC_PAYPAL_YEARLY_LINK"} 或 NEXT_PUBLIC_PAYPAL_LIVE_URL` 
        },
        { status: 400 }
      );
    }
    
    // 建立自訂欄位：userId-plan
    // PayPal 會將此欄位在 IPN 通知中回傳，用於識別用戶
    const customField = `${user.id}-${plan}`;
    
    // 將用戶 ID 和方案添加到 PayPal URL
    // PayPal 支援 custom 參數來傳遞自訂資料
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("custom", customField);
      
      // 也可以使用 item_number 參數（某些 PayPal 按鈕類型支援）
      url.searchParams.set("item_number", customField);
      
      // 移除敏感資訊的日誌記錄（生產環境）
      if (process.env.NODE_ENV === "development") {
        console.log("PayPal payment URL created:", {
          plan,
          userId: user.id.substring(0, 8) + "...", // 只記錄部分 ID
          customField,
          url: url.toString()
        });
      }
      
      return NextResponse.json({ 
        url: url.toString(),
        customField // 返回自訂欄位供調試使用
      });
    } catch (urlError: any) {
      console.error("Failed to create PayPal URL:", urlError);
      return NextResponse.json(
        { error: `無效的 PayPal 連結格式: ${urlError.message}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("PayPal payment creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

