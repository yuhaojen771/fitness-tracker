import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { checkDuplicateRequest } from "@/lib/security/webhook-verification";
import crypto from "crypto";

/**
 * 綠界（ECPay）付款結果回傳處理
 * 
 * 處理綠界付款完成後的回傳通知
 * 驗證檢查碼後更新用戶訂閱狀態
 * 
 * 安全措施：
 * - CheckMacValue 驗證（綠界官方驗證）
 * - 重複請求檢查（防止重複處理）
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    
    // 將 FormData 轉換為物件
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });
    
    // 檢查重複請求（使用訂單編號）
    const tradeNo = params.MerchantTradeNo;
    if (tradeNo && checkDuplicateRequest(tradeNo)) {
      console.warn("Duplicate ECPay webhook request detected:", tradeNo);
      // 返回成功，但不再處理（idempotency）
      return new NextResponse("1|OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    }
    
    // 檢查必要的環境變數
    const hashKey = process.env.ECPAY_HASH_KEY;
    const hashIV = process.env.ECPAY_HASH_IV;
    
    if (!hashKey || !hashIV) {
      console.error("ECPay credentials not configured");
      return NextResponse.json(
        { error: "ECPay credentials not configured" },
        { status: 500 }
      );
    }
    
    // 驗證檢查碼（CheckMacValue）
    const receivedCheckMacValue = params.CheckMacValue;
    delete params.CheckMacValue;
    
    // 建立檢查碼
    const sortedKeys = Object.keys(params).sort();
    const checkString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join("&");
    const calculatedCheckMacValue = crypto
      .createHash("sha256")
      .update(`HashKey=${hashKey}&${checkString}&HashIV=${hashIV}`)
      .digest("hex")
      .toUpperCase();
    
    // 驗證檢查碼
    if (receivedCheckMacValue !== calculatedCheckMacValue) {
      console.error("ECPay CheckMacValue verification failed:", {
        received: receivedCheckMacValue,
        calculated: calculatedCheckMacValue
      });
      return NextResponse.json(
        { error: "CheckMacValue verification failed" },
        { status: 400 }
      );
    }
    
    // 檢查付款狀態
    const rtnCode = params.RtnCode;
    const paymentDate = params.PaymentDate;
    // tradeNo 已在上面定義，這裡不需要重複定義
    const customField = params.CustomField1 || "";
    
    // 從自訂欄位取得用戶 ID 和方案
    const [userId, plan] = customField.split("-");
    
    if (!userId || !plan) {
      console.error("Invalid custom field:", customField);
      return NextResponse.json(
        { error: "Invalid custom field" },
        { status: 400 }
      );
    }
    
    // 付款成功（RtnCode = 1 表示付款成功）
    if (rtnCode === "1") {
      // 使用 service role client 繞過 RLS
      const supabase = createSupabaseServiceRoleClient() as any;
      
      // 先查詢現有的訂閱到期日
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("subscription_end_date")
        .eq("id", userId)
        .single();
      
      // 明確指定類型以避免 TypeScript 錯誤
      type ProfileWithSubscription = { subscription_end_date: string | null } | null;
      const profile = existingProfile as ProfileWithSubscription;
      
      let baseDate: Date;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 如果現有到期日還沒到期，在該日期基礎上延長
      if (profile?.subscription_end_date) {
        const existingEndDate = new Date(profile.subscription_end_date);
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
      if (plan === "monthly") {
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
      
      // 移除敏感資訊的日誌記錄
      if (process.env.NODE_ENV === "development") {
        console.log(`ECPay subscription updated for user ${userId.substring(0, 8)}..., plan: ${plan}`);
      }
    }
    
    // 返回成功回應（綠界要求返回 "1|OK"）
    return new NextResponse("1|OK", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  } catch (error: any) {
    console.error("ECPay webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// 處理 GET 請求（用戶從綠界返回）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentStatus = searchParams.get("payment");
  
  // 重定向到 dashboard
  const dashboardUrl = new URL("/dashboard", request.nextUrl.origin);
  if (paymentStatus === "success") {
    dashboardUrl.searchParams.set("payment", "success");
  }
  
  return NextResponse.redirect(dashboardUrl);
}

