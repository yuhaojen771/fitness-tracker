import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * OAuth Callback 路由處理器
 * - Google OAuth 完成後會導向此路由（帶有 code 參數）
 * - createSupabaseServerClient 會自動處理 OAuth code 並建立 session
 * - 成功後導向 /dashboard，失敗則導向 /auth/login
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // 決定要導回哪個 origin：優先使用 NEXT_PUBLIC_SITE_URL，其次才是當前請求的 origin
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;

  // 如果沒有 code，表示 OAuth 流程異常
  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=missing_code", baseUrl)
    );
  }

  const supabase = createSupabaseServerClient();

  // 使用 code 交換 session（Supabase SSR 會自動處理 cookies）
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", baseUrl)
    );
  }

  // 確保新用戶自動建立 profiles 記錄
  if (data.user) {
    const profileData: Database["public"]["Tables"]["profiles"]["Insert"] = {
      id: data.user.id,
      is_premium: false
    };
    
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // 即使 profile 建立失敗，也允許登入（可以後續手動建立）
    }
  }

  // 成功登入，導向儀表板
  return NextResponse.redirect(new URL("/dashboard", baseUrl));
}

