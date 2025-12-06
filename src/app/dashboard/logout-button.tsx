"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Client-side 登出按鈕
 * - 使用 window.location.href 強制刷新，確保登出後立即跳離儀表板
 */
export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      // 強制刷新整個頁面，確保不會殘留舊資料
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error logging out:", error);
      // 即使出錯也強制跳轉
      window.location.href = "/auth/login";
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm font-medium text-slate-600 underline dark:text-slate-400 dark:hover:text-slate-200"
    >
      登出
    </button>
  );
}



