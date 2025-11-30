"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPremiumActive } from "@/lib/subscription-utils";
import type { ProfileRow } from "@/types/supabase";

/**
 * 用戶回饋/BUG 回報浮動按鈕組件
 * 
 * 功能說明：
 * - 使用 fixed 定位，永久顯示在瀏覽器頁面的右下角
 * - 點擊後開啟新的瀏覽器標籤頁，導向外部表單（Google Form 或 Tally Form）
 * - 自動在表單 URL 中添加 Premium 會員標記
 * - 在手機螢幕尺寸上確保不會遮擋主要內容
 * 
 * 環境變數設定：
 * 請在 .env.local 或部署環境中設定：
 * NEXT_PUBLIC_FEEDBACK_FORM_URL=https://forms.google.com/your-form-url
 * 或
 * NEXT_PUBLIC_FEEDBACK_FORM_URL=https://tally.so/your-form-url
 */
export function FeedbackButton() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 從環境變數取得回饋表單 URL
  const feedbackFormUrl = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL;

  // 取得用戶的 Premium 狀態
  useEffect(() => {
    async function checkPremiumStatus() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          setIsPremium(false);
          setIsLoading(false);
          return;
        }

        // 查詢用戶的 profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium, subscription_end_date")
          .eq("id", user.id)
          .single();

        if (profile) {
          // 使用 isPremiumActive 檢查是否為有效的 Premium 會員
          setIsPremium(isPremiumActive(profile as ProfileRow));
        } else {
          setIsPremium(false);
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkPremiumStatus();
  }, []);

  // 如果未設定環境變數，不顯示按鈕
  if (!feedbackFormUrl) {
    return null;
  }

  // 建立包含 Premium 標記的表單 URL
  const getFormUrlWithPremium = () => {
    if (!feedbackFormUrl) return feedbackFormUrl;

    try {
      const url = new URL(feedbackFormUrl);
      
      // 添加 Premium 狀態參數
      if (isPremium === true) {
        url.searchParams.set("premium", "true");
        url.searchParams.set("user_type", "premium");
      } else if (isPremium === false) {
        url.searchParams.set("premium", "false");
        url.searchParams.set("user_type", "free");
      }
      // 如果還在載入中，不添加參數
      
      return url.toString();
    } catch {
      // 如果不是有效的 URL，直接返回原 URL 並添加參數
      const separator = feedbackFormUrl.includes("?") ? "&" : "?";
      if (isPremium === true) {
        return `${feedbackFormUrl}${separator}premium=true&user_type=premium`;
      } else if (isPremium === false) {
        return `${feedbackFormUrl}${separator}premium=false&user_type=free`;
      }
      return feedbackFormUrl;
    }
  };

  return (
    <a
      href={getFormUrlWithPremium()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl dark:bg-slate-700 dark:hover:bg-slate-600 sm:bottom-6 sm:right-6"
      aria-label="回饋/回報問題"
    >
      {/* 圖標 */}
      <span className="text-lg" role="img" aria-hidden="true">
        💬
      </span>
      
      {/* 文字標籤（在較大螢幕上顯示） */}
      <span className="hidden text-sm font-medium text-white sm:inline">
        {isPremium ? "⭐ Premium 客服" : "回饋/回報問題"}
      </span>
    </a>
  );
}

