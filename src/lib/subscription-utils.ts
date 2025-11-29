/**
 * 訂閱相關工具函數
 */

import type { ProfileRow } from "@/types/supabase";

/**
 * 檢查用戶是否為有效的 Premium 會員
 * 基於 subscription_end_date 判斷，而不是 is_premium
 * 這樣可以確保取消訂閱後，premium 功能仍保留至到期日
 */
export function isPremiumActive(profile: ProfileRow | null): boolean {
  if (!profile || !profile.subscription_end_date) {
    return false;
  }

  const endDate = new Date(profile.subscription_end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // 如果到期日期在今天或之後，則為有效
  return endDate >= today;
}

/**
 * 計算訂閱到期日期
 * @param plan - 訂閱方案："monthly" 或 "yearly"
 * @param startDate - 開始日期（可選，預設為今天）
 */
export function calculateSubscriptionEndDate(
  plan: "monthly" | "yearly",
  startDate: Date = new Date()
): Date {
  // 使用 UTC 日期避免時區問題
  const year = startDate.getUTCFullYear();
  const month = startDate.getUTCMonth();
  const day = startDate.getUTCDate();
  
  const endDate = new Date(Date.UTC(year, month, day));
  
  if (plan === "monthly") {
    // 加一個月
    endDate.setUTCMonth(month + 1);
  } else {
    // 加一年
    endDate.setUTCFullYear(year + 1);
  }
  
  return endDate;
}

/**
 * 格式化訂閱到期日期為字串（YYYY-MM-DD）
 */
export function formatSubscriptionEndDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * 計算剩餘天數
 */
export function getDaysRemaining(subscriptionEndDate: string | null): number | null {
  if (!subscriptionEndDate) {
    return null;
  }

  const endDate = new Date(subscriptionEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

