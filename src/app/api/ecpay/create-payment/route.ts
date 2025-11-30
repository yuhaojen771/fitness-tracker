import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * 綠界（ECPay）付款訂單建立 API
 * 
 * 建立綠界付款訂單，返回付款頁面 URL
 * 使用綠界 All-in-One 付款方式
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
    
    // 檢查綠界環境變數
    const merchantID = process.env.ECPAY_MERCHANT_ID;
    const hashKey = process.env.ECPAY_HASH_KEY;
    const hashIV = process.env.ECPAY_HASH_IV;
    const isTestMode = process.env.ECPAY_TEST_MODE === "true" || !process.env.ECPAY_TEST_MODE;
    
    if (!merchantID || !hashKey || !hashIV) {
      console.error("ECPay credentials not configured:", {
        hasMerchantID: !!merchantID,
        hasHashKey: !!hashKey,
        hasHashIV: !!hashIV
      });
      return NextResponse.json(
        { 
          error: "綠界金流未設定。請在環境變數中設定 ECPAY_MERCHANT_ID、ECPAY_HASH_KEY 和 ECPAY_HASH_IV" 
        },
        { status: 400 }
      );
    }
    
    // 設定價格（新台幣）
    const prices = {
      monthly: 120, // NT$120/月
      yearly: 1200  // NT$1,200/年
    };
    
    const amount = prices[plan as "monthly" | "yearly"];
    const planName = plan === "monthly" ? "月繳方案" : "年繳方案";
    
    // 建立訂單編號（使用時間戳 + 用戶 ID 前 8 碼）
    const orderNo = `EC${Date.now()}${user.id.substring(0, 8).replace(/-/g, "")}`;
    
    // 建立自訂欄位：userId-plan（用於 Webhook 識別）
    const customField = `${user.id}-${plan}`;
    
    // 建立訂單資料
    const orderData: Record<string, string> = {
      MerchantID: merchantID,
      MerchantTradeNo: orderNo,
      MerchantTradeDate: new Date().toISOString().replace(/[-:T]/g, "").substring(0, 14), // YYYYMMDDHHmmss
      PaymentType: "aio",
      TotalAmount: amount.toString(),
      TradeDesc: `Premium 訂閱 - ${planName}`,
      ItemName: `健康追蹤 App Premium 會員 - ${planName}`,
      ReturnURL: `${process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")}/api/webhooks/ecpay/return`,
      OrderResultURL: `${process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")}/api/webhooks/ecpay/return`,
      ClientBackURL: `${process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")}/dashboard?payment=success`,
      CustomField1: customField, // 用戶 ID 和方案
      EncryptType: "1", // SHA256
    };
    
    // 建立檢查碼（CheckMacValue）
    // 綠界要求：參數按照字母順序排序，然後加上 HashKey 和 HashIV，最後進行 SHA256 加密
    const sortedKeys = Object.keys(orderData).sort();
    const checkString = sortedKeys
      .map(key => `${key}=${orderData[key]}`)
      .join("&");
    const checkMacValue = crypto
      .createHash("sha256")
      .update(`HashKey=${hashKey}&${checkString}&HashIV=${hashIV}`)
      .digest("hex")
      .toUpperCase();
    
    orderData.CheckMacValue = checkMacValue;
    
    // 選擇付款頁面 URL（測試或正式）
    const paymentUrl = isTestMode
      ? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
      : "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";
    
    // 移除敏感資訊的日誌記錄（生產環境）
    if (process.env.NODE_ENV === "development") {
      console.log("ECPay payment order created:", {
        plan,
        userId: user.id.substring(0, 8) + "...", // 只記錄部分 ID
        orderNo,
        amount,
        customField: customField.substring(0, 20) + "..." // 只記錄部分 customField
      });
    }
    
    // 返回付款表單資料（前端需要提交表單到綠界）
    return NextResponse.json({
      paymentUrl,
      orderData,
      orderNo,
      customField
    });
  } catch (error: any) {
    console.error("ECPay payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "建立付款訂單失敗" },
      { status: 500 }
    );
  }
}

