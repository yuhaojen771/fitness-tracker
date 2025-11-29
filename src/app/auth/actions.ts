"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthFormState = {
  /** 是否成功登入／註冊 */
  success: boolean;
  /** 給使用者看的錯誤訊息（中文） */
  error?: string;
};

/**
 * Server Action：處理使用者註冊邏輯
 * - 透過 Supabase Auth 建立帳號 (email/password)
 * - 若成功則自動登入並導向 /dashboard
 */
export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, error: "請輸入 Email 與密碼" };
  }

  const supabase = createSupabaseServerClient();

  // 使用 Supabase Auth 建立帳號
  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    // 將 Supabase 回傳錯誤轉為簡單中文訊息
    return {
      success: false,
      error: `註冊失敗：${error.message}`
    };
  }

  // 成功後導向儀表板；redirect 會中斷後續執行
  redirect("/dashboard");
}

/**
 * Server Action：處理使用者登入邏輯
 * - 透過 email/password 呼叫 Supabase Auth signInWithPassword
 * - 成功登入會在 cookies 中寫入 session，並導向 /dashboard
 */
export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, error: "請輸入 Email 與密碼" };
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return {
      success: false,
      error: "登入失敗，請確認帳號密碼是否正確。"
    };
  }

  redirect("/dashboard");
}

/**
 * Server Action：登出
 * - 呼叫 supabase.auth.signOut 並清除 session cookies
 * - 完成後導向首頁
 */
export async function logoutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  // 登出後直接導向登入頁，避免儀表板殘留舊資料
  redirect("/auth/login");
}


