"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateSubscriptionEndDate, formatSubscriptionEndDate } from "@/lib/subscription-utils";
import type { ProfileRow } from "@/types/supabase";

type AdminActionState = {
  success: boolean;
  error?: string;
};

/**
 * 檢查當前用戶是否為管理員
 */
async function checkAdminPermission(): Promise<{ isAdmin: boolean; userId: string | null }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false, userId: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return {
    isAdmin: profile?.is_admin === true,
    userId: user.id
  };
}

/**
 * Server Action：手動開通用戶 Premium 訂閱
 * 允許管理員根據 Email 或 User ID 開通訂閱
 */
export async function grantPremiumSubscriptionAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  // 檢查管理員權限
  const { isAdmin } = await checkAdminPermission();
  if (!isAdmin) {
    return { success: false, error: "權限不足：僅限管理員操作" };
  }

  const identifier = String(formData.get("identifier") ?? "").trim(); // Email 或 User ID
  const plan = String(formData.get("plan") ?? "yearly") as "monthly" | "yearly";
  const customEndDate = String(formData.get("custom_end_date") ?? "").trim();

  if (!identifier) {
    return { success: false, error: "請輸入用戶 Email 或 User ID" };
  }

  const supabase = createSupabaseServerClient();

  // 判斷是 Email 還是 User ID
  let userId: string | null = null;

  // 檢查是否為 UUID（User ID）
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(identifier)) {
    // 是 User ID
    userId = identifier;
  } else {
    // 可能是 Email，需要通過 auth.users 查找
    // 注意：Supabase client 無法直接查詢 auth.users，需要使用 admin API
    // 這裡我們先嘗試直接使用 identifier 作為 user_id
    // 實際應用中，應該通過 Supabase Admin API 查找
    return {
      success: false,
      error: "目前僅支援 User ID。Email 查找功能需要 Supabase Admin API 支援。"
    };
  }

  // 計算訂閱到期日期
  let subscriptionEndDate: string;
  if (customEndDate) {
    subscriptionEndDate = customEndDate;
  } else {
    const endDate = calculateSubscriptionEndDate(plan);
    subscriptionEndDate = formatSubscriptionEndDate(endDate);
  }

  // 更新用戶的訂閱狀態
  const profilesTable = supabase.from("profiles") as any;
  const { error } = await profilesTable
    .upsert(
      {
        id: userId,
        is_premium: true,
        subscription_end_date: subscriptionEndDate
      },
      { onConflict: "id" }
    )
    .eq("id", userId);

  if (error) {
    console.error("Grant premium subscription error:", error);
    return { success: false, error: `開通失敗：${error.message}` };
  }

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Server Action：根據 Email 開通 Premium（需要 Admin API）
 * 這是一個改進版本，使用 User ID 查找
 */
export async function grantPremiumByEmailAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const { isAdmin } = await checkAdminPermission();
  if (!isAdmin) {
    return { success: false, error: "權限不足：僅限管理員操作" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const plan = String(formData.get("plan") ?? "yearly") as "monthly" | "yearly";
  const customEndDate = String(formData.get("custom_end_date") ?? "").trim();

  if (!email) {
    return { success: false, error: "請輸入用戶 Email" };
  }

  // 注意：由於無法直接查詢 auth.users，這裡需要管理員手動輸入 User ID
  // 或者使用 Supabase Admin API（需要服務端配置）
  return {
    success: false,
    error: "Email 查找功能需要配置 Supabase Admin API。請使用 User ID 或聯繫技術人員配置。"
  };
}

/**
 * Server Action：獲取所有用戶列表（僅管理員）
 */
export async function getAllUsersAction(): Promise<{
  success: boolean;
  users?: Array<{
    id: string;
    email: string;
    is_premium: boolean;
    subscription_end_date: string | null;
    updated_at: string;
  }>;
  error?: string;
}> {
  const { isAdmin } = await checkAdminPermission();
  if (!isAdmin) {
    return { success: false, error: "權限不足：僅限管理員操作" };
  }

  const supabase = createSupabaseServerClient();

  // 獲取所有 profiles（RLS 政策會自動過濾，只有管理員可以看到所有）
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, is_premium, subscription_end_date, updated_at")
    .order("updated_at", { ascending: false });

  if (profilesError) {
    console.error("Get all users error:", profilesError);
    return { success: false, error: `查詢失敗：${profilesError.message}` };
  }

  // 注意：獲取用戶 email 需要 Supabase Admin API
  // 由於客戶端限制，這裡先返回基本資訊
  // email 可以通過 Supabase Dashboard 或 Admin API 獲取
  const users = (profiles || []).map((profile) => {
    return {
      id: profile.id,
      email: "", // 需要在 Supabase Dashboard 的 Authentication 中查看，或配置 Admin API
      is_premium: profile.is_premium,
      subscription_end_date: profile.subscription_end_date,
      updated_at: profile.updated_at
    };
  });

  return {
    success: true,
    users
  };
}

/**
 * Server Action：通過 User ID 查找用戶 Email（需要 Admin API 支援）
 */
export async function getUserEmailByIdAction(userId: string): Promise<{
  success: boolean;
  email?: string;
  error?: string;
}> {
  const { isAdmin } = await checkAdminPermission();
  if (!isAdmin) {
    return { success: false, error: "權限不足" };
  }

  // 注意：Supabase client 無法直接查詢 auth.users
  // 需要使用 Supabase Admin API 或服務端配置
  return {
    success: false,
    error: "需要配置 Supabase Admin API 才能查詢用戶 Email"
  };
}

