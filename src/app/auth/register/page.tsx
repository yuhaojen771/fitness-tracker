import { redirect } from "next/navigation";

/**
 * 註冊頁面已改為使用 Google OAuth 登入
 * 直接重定向到登入頁面
 */
export default function RegisterPage() {
  redirect("/auth/login");
}


