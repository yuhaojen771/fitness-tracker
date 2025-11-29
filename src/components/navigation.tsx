"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";
import type { User } from "@supabase/supabase-js";

/**
 * 導覽列組件
 * - 檢查用戶登入狀態
 * - 根據狀態顯示不同的導覽項目
 */
export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 檢查登入狀態
    async function checkAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // 監聽認證狀態變化
    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 處理登出
  async function handleLogout() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      setUser(null);
      // 保險做法：改用硬導向，確保整個 App 狀態與 cookies 同步刷新
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      } else {
        router.replace("/auth/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  return (
    <nav className="mx-auto max-w-4xl px-4 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Fitness Tracker
        </Link>
        
        {/* 桌面版導覽 */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="space-x-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              健康記錄
            </Link>
            <Link
              href="/bmi-calculator"
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              BMI 計算機
            </Link>
            {isLoading ? (
              <span className="text-slate-400 dark:text-slate-500">載入中...</span>
            ) : user ? (
              <>
                <Link
                  href="/dashboard?premium=true"
                  className="rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800"
                >
                  ⭐ Premium
                </Link>
                <span className="text-slate-600 dark:text-slate-400">
                  {user.email?.split("@")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800"
                >
                  ⭐ Premium
                </Link>
                <Link
                  href="/auth/login"
                  className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  登入
                </Link>
              </>
            )}
          </div>
          <ThemeToggle />
        </div>

        {/* 行動版漢堡選單按鈕 */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="切換選單"
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 行動版選單 */}
      {isMobileMenuOpen && (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700 md:hidden">
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            健康記錄
          </Link>
          <Link
            href="/bmi-calculator"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            BMI 計算機
          </Link>
          {isLoading ? (
            <span className="block px-3 py-2 text-sm text-slate-400 dark:text-slate-500">
              載入中...
            </span>
          ) : user ? (
            <>
              <Link
                href="/dashboard?premium=true"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800"
              >
                ⭐ Premium
              </Link>
              <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                {user.email?.split("@")[0]}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800"
              >
                ⭐ Premium
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                登入
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

