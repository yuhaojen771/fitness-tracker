import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

/**
 * PayPal IPN (Instant Payment Notification) Webhook 處理
 * 
 * 當用戶完成 PayPal 付款後，PayPal 會發送 IPN 通知到此端點
 * 我們驗證通知後，自動更新用戶的訂閱狀態
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    
    // 將 FormData 轉換為物件
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });
    
    // PayPal IPN 驗證 URL
    // 根據環境選擇正式或沙盒 URL
    const verifyUrl = process.env.NODE_ENV === "production"
      ? "https://ipnpb.paypal.com/cgi-bin/webscr"
      : "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr";
    
    // 建立驗證請求（PayPal 要求回傳 cmd=_notify-validate）
    const verificationParams = new URLSearchParams({
      cmd: "_notify-validate",
    });
    
    // 將所有原始參數添加到驗證請求中
    Object.keys(params).forEach((key) => {
      verificationParams.append(key, params[key]);
    });
    
    // 向 PayPal 驗證 IPN
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Next.js-PayPal-IPN-Handler",
      },
      body: verificationParams.toString(),
    });
    
    const verificationResult = await verifyResponse.text();
    
    // 如果驗證失敗，記錄錯誤並返回
    if (verificationResult !== "VERIFIED") {
      console.error("PayPal IPN verification failed:", verificationResult);
      return NextResponse.json(
        { error: "IPN verification failed" },
        { status: 400 }
      );
    }
    
    // 驗證成功，處理付款通知
    const paymentStatus = params.payment_status;
    const txnType = params.txn_type;
    
    // 處理付款完成事件
    if (paymentStatus === "Completed" && (txnType === "web_accept" || txnType === "subscr_payment")) {
      // 從自訂欄位取得用戶 ID 和方案
      // PayPal 按鈕的自訂欄位格式：userId-plan
      const customField = params.custom || params.item_number || "";
      const [userId, plan] = customField.split("-");
      
      if (!userId) {
        console.error("No user ID found in PayPal IPN:", params);
        return NextResponse.json(
          { error: "User ID not found" },
          { status: 400 }
        );
      }
      
      // 判斷訂閱方案（如果無法從 custom 取得，嘗試從商品名稱判斷）
      const itemName = params.item_name || "";
      const detectedPlan = plan || (itemName.includes("月繳") ? "monthly" : "yearly");
      
      // 使用 service role client 繞過 RLS，避免無限遞迴問題
      const supabase = createSupabaseServiceRoleClient();
      
      // 先查詢現有的訂閱到期日
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("subscription_end_date")
        .eq("id", userId)
        .single();
      
      let baseDate: Date;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 如果現有到期日還沒到期，在該日期基礎上延長
      if (existingProfile?.subscription_end_date) {
        const existingEndDate = new Date(existingProfile.subscription_end_date);
        existingEndDate.setHours(0, 0, 0, 0);
        
        if (existingEndDate >= today) {
          baseDate = existingEndDate;
        } else {
          baseDate = today;
        }
      } else {
        baseDate = today;
      }
      
      // 計算新的訂閱到期日期
      const subscriptionEndDate = new Date(baseDate);
      if (detectedPlan === "monthly") {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      } else {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
      }
      
      // 更新用戶的訂閱狀態
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          subscription_end_date: subscriptionEndDate.toISOString().split("T")[0],
        })
        .eq("id", userId);
      
      if (updateError) {
        console.error("Error updating subscription:", updateError);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 }
        );
      }
      
      console.log(`Subscription updated for user ${userId}, plan: ${detectedPlan}`);
    }
    
    // 處理訂閱取消事件
    if (txnType === "subscr_cancel" || txnType === "subscr_eot") {
      const customField = params.custom || params.item_number || "";
      const [userId] = customField.split("-");
      
      if (userId) {
        // 使用 service role client 繞過 RLS，避免無限遞迴問題
        const supabase = createSupabaseServiceRoleClient();
        
        // 取消訂閱：將 is_premium 設為 false，但保留 subscription_end_date
        // 這樣用戶可以繼續使用 Premium 功能直到到期日
        await supabase
          .from("profiles")
          .update({
            is_premium: false,
            // subscription_end_date 保持不變，讓用戶可以使用到到期日
          })
          .eq("id", userId);
        
        console.log(`Subscription cancelled for user ${userId}`);
      }
    }
    
    // 返回成功回應（PayPal 要求返回 200 狀態碼）
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("PayPal Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// 允許 GET 請求用於 PayPal IPN 測試
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "PayPal IPN endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

