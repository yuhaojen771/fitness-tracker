"use client";

import { useState } from "react";
import { isPremiumActive, getDaysRemaining } from "@/lib/subscription-utils";
import type { ProfileRow } from "@/types/supabase";

type SubscriptionBannerProps = {
  profile: ProfileRow | null;
  onManageClick: () => void;
};

/**
 * 訂閱到期提醒橫幅
 * - 當訂閱在未來 7 天內到期時顯示
 * - 提醒用戶續訂
 */
export function SubscriptionBanner({ profile, onManageClick }: SubscriptionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // 使用工具函數判斷 premium 狀態
  if (!isPremiumActive(profile) || !profile?.subscription_end_date || isDismissed) {
    return null;
  }

  const endDate = new Date(profile.subscription_end_date);
  const daysRemaining = getDaysRemaining(profile.subscription_end_date);

  // 只在未來 7 天內到期時顯示
  if (!daysRemaining || daysRemaining > 7 || daysRemaining < 0) {
    return null;
  }

  return (
    <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 p-4 dark:border-amber-700 dark:from-amber-900/30 dark:to-amber-800/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-100 sm:text-lg">
              訂閱即將到期
            </h3>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            您的 Premium 訂閱將在{" "}
            <span className="font-semibold">
              {endDate.toLocaleDateString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>{" "}
            到期（剩餘 {daysRemaining} 天）。請及時續訂以繼續享受 Premium 功能。
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onManageClick}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            管理訂閱
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="rounded-md border border-amber-300 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            稍後提醒
          </button>
        </div>
      </div>
    </div>
  );
}

