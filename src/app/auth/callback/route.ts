import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * OAuth Callback 路由處理器
 * - Google OAuth 完成後會導向此路由（帶有 code 參數）
 * - createSupabaseServerClient 會自動處理 OAuth code 並建立 session
 * - 成功後導向 /dashboard，失敗則導向 /auth/login
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // 決定要導回哪個 origin：優先使用 NEXT_PUBLIC_SITE_URL，其次才是當前請求的 origin
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;

  // 記錄環境變數狀態（用於調試）
  console.log("[OAuth Callback] Request URL:", requestUrl.href);
  console.log("[OAuth Callback] Base URL:", baseUrl);
  console.log("[OAuth Callback] NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL || "未設置");

  // 檢查是否有 OAuth 錯誤參數
  if (errorParam) {
    console.error("[OAuth Callback] OAuth error:", errorParam, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/login?error=oauth_error&details=${encodeURIComponent(errorParam)}`, baseUrl)
    );
  }

  // 如果沒有 code，表示 OAuth 流程異常
  if (!code) {
    console.error("[OAuth Callback] Missing code parameter");
    return NextResponse.redirect(
      new URL("/auth/login?error=missing_code", baseUrl)
    );
  }

  const supabase = createSupabaseServerClient();

  // 使用 code 交換 session（Supabase SSR 會自動處理 cookies）
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("[OAuth Callback] Session exchange error:", error);
    return NextResponse.redirect(
      new URL(`/auth/login?error=oauth_failed&details=${encodeURIComponent(error?.message || "unknown")}`, baseUrl)
    );
  }

  // 確保新用戶自動建立 profiles 記錄
  if (data.user) {
    // 使用類型斷言避免 TypeScript 編譯時的類型推斷問題
    // 這是一個已知的 Supabase TypeScript 類型推斷限制
      const profilesTable = supabase.from("profiles") as any;
      const { error: profileError } = await profilesTable.upsert(
        {
          id: data.user.id,
          is_premium: false,
          is_admin: false
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // 即使 profile 建立失敗，也允許登入（可以後續手動建立）
    }
  }

  // 成功登入，導向儀表板
  return NextResponse.redirect(new URL("/dashboard", baseUrl));
}

