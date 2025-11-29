import { LoginClient } from "./login-client";

type LoginPageProps = {
  searchParams: { error?: string };
};

/**
 * 登入頁面（Server Component）
 * - 讀取 URL 參數中的錯誤訊息並傳遞給 Client Component
 * - 使用 Google OAuth 登入，無需 Email/Password 註冊
 */
export default function LoginPage({ searchParams }: LoginPageProps) {
  let initialError: string | null = null;

  // 從 URL 參數讀取錯誤訊息（當 OAuth callback 失敗時會帶回）
  if (searchParams.error === "missing_code") {
    initialError = "OAuth 流程異常，請重新嘗試登入。";
  } else if (searchParams.error === "oauth_failed") {
    initialError = "Google 登入失敗，請稍後再試。";
  }

  return <LoginClient initialError={initialError} />;
}


