"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateSubscriptionEndDate, formatSubscriptionEndDate } from "@/lib/subscription-utils";
import type { DailyRecordRow } from "@/types/supabase";

type ActionState = {
  success: boolean;
  error?: string;
};

/**
 * Server Action：建立或更新每日記錄
 * - 使用 upsert 確保同一天只有一筆記錄
 * - 成功後重新驗證 dashboard 頁面以更新資料
 */
export async function saveDailyRecordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  // 取得目前登入的使用者
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  const date = String(formData.get("date") ?? "");
  const weightStr = String(formData.get("weight") ?? "").trim();
  const dietNotes = String(formData.get("diet_notes") ?? "").trim();

  // 驗證日期
  if (!date) {
    return { success: false, error: "請選擇日期" };
  }

  // 轉換體重為數字（可選）
  const weight = weightStr ? parseFloat(weightStr) : null;
  if (weightStr) {
    if (isNaN(weight!) || weight! <= 0) {
      return { success: false, error: "體重必須是大於 0 的數字" };
    }
    // 驗證體重範圍（20-500 公斤，約 44-1100 磅）
    if (weight! < 20 || weight! > 500) {
      return { success: false, error: "體重必須在 20-500 公斤之間（約 44-1100 磅）" };
    }
  }

  // 使用 upsert 建立或更新記錄（根據 user_id + date 的唯一約束）
  // 使用類型斷言避免 TypeScript 編譯時的類型推斷問題
  const dailyRecordsTable = supabase.from("daily_records") as any;
  const { error } = await dailyRecordsTable.upsert(
    {
      user_id: user.id,
      date,
      weight,
      diet_notes: dietNotes || null
    },
    {
      onConflict: "user_id,date"
    }
  );

  if (error) {
    console.error("Save record error:", error);
    return { success: false, error: "儲存失敗，請稍後再試" };
  }

  // 重新驗證 dashboard 頁面以更新顯示的資料
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action：刪除每日記錄
 */
export async function deleteDailyRecordAction(recordId: string): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  // 刪除記錄（RLS 會確保只能刪除自己的記錄）
  const { error } = await supabase
    .from("daily_records")
    .delete()
    .eq("id", recordId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete record error:", error);
    return { success: false, error: "刪除失敗，請稍後再試" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action：升級為 Premium 會員（模擬訂閱）
 * - 將用戶的 is_premium 設為 true
 * - 實際應用中應該串接真實的金流服務（如 Stripe）
 * @param plan - 訂閱方案："monthly" 或 "yearly"
 */
export async function upgradeToPremiumAction(plan: "monthly" | "yearly" = "yearly"): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  // 先查詢現有的 profile，檢查是否有未到期的 subscription_end_date
  // 使用類型斷言避免 TypeScript 編譯時的類型推斷問題
  const profilesTable = supabase.from("profiles") as any;
  const { data: existingProfile } = await profilesTable
    .select("subscription_end_date")
    .eq("id", user.id)
    .single();

  let baseDate: Date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 如果現有 subscription_end_date 存在且還沒到期，在該日期基礎上延長
  // 否則從今天開始計算
  if (existingProfile?.subscription_end_date) {
    const existingEndDate = new Date(existingProfile.subscription_end_date);
    existingEndDate.setHours(0, 0, 0, 0);
    
    // 如果現有到期日還沒到期，在該日期基礎上延長
    if (existingEndDate >= today) {
      baseDate = existingEndDate;
    } else {
      // 如果已過期，從今天開始計算
      baseDate = today;
    }
  } else {
    // 沒有現有到期日，從今天開始計算
    baseDate = today;
  }

  // 計算新的訂閱到期日期（在基礎日期上延長）
  const subscriptionEndDate = calculateSubscriptionEndDate(plan, baseDate);
  const subscriptionEndDateStr = formatSubscriptionEndDate(subscriptionEndDate);

  // 更新 profiles 表的 is_premium 和 subscription_end_date 欄位
  // 重用之前定義的 profilesTable 變數
  const { error } = await profilesTable.upsert(
    {
      id: user.id,
      is_premium: true,
      subscription_end_date: subscriptionEndDateStr
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Upgrade premium error:", error);
    // 提供更詳細的錯誤訊息以便調試
    const errorMessage = error.code === "42501" 
      ? "權限不足：請確認資料庫 RLS 政策已正確設定（需要 INSERT 和 UPDATE 權限）"
      : error.message || "升級失敗，請稍後再試";
    return { success: false, error: errorMessage };
  }

  console.log(`User ${user.id} upgraded to Premium with ${plan} plan, expires on ${subscriptionEndDateStr}`);

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action：取消訂閱 / 停止提醒
 * - 只將 is_premium 設為 false（標記為不續訂）
 * - 保留 subscription_end_date 不變，讓 premium 功能保留至到期日
 * - 這樣可以停止提醒郵件的發送，但用戶仍可使用 premium 功能至到期日
 */
export async function cancelSubscriptionAction(): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  // 只將 is_premium 設為 false，保留 subscription_end_date
  // 這樣 premium 功能會保留至到期日，但不會續訂
  // 使用類型斷言避免 TypeScript 編譯時的類型推斷問題
  const profilesTable = supabase.from("profiles") as any;
  const { error } = await profilesTable
    .update({
      is_premium: false
      // 不更新 subscription_end_date，保留原到期日
    })
    .eq("id", user.id);

  if (error) {
    console.error("Cancel subscription error:", error);
    return { success: false, error: "取消訂閱失敗，請稍後再試" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action：重設訂閱狀態（僅開發模式）
 * - 將 is_premium 設為 false
 * - 將 subscription_end_date 設為 null
 * - 完全恢復成未訂閱狀態
 */
export async function resetSubscriptionAction(): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  // 將 is_premium 設為 false，subscription_end_date 設為 null
  // 使用類型斷言避免 TypeScript 編譯時的類型推斷問題
  const profilesTable = supabase.from("profiles") as any;
  const { error } = await profilesTable
    .update({
      is_premium: false,
      subscription_end_date: null
    })
    .eq("id", user.id);

  if (error) {
    console.error("Reset subscription error:", error);
    return { success: false, error: "重設失敗，請稍後再試" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action：更新目標設定
 * 使用 useFormState 時，action 需要接受 (prevState, formData) 兩個參數
 */
export async function updateTargetAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  const targetWeightStr = String(formData.get("target_weight") ?? "").trim();
  const targetDate = String(formData.get("target_date") ?? "").trim();

  const targetWeight = targetWeightStr ? parseFloat(targetWeightStr) : null;

  if (targetWeightStr && (isNaN(targetWeight!) || targetWeight! <= 0)) {
    return { success: false, error: "目標體重必須是大於 0 的數字" };
  }

  // 使用類型斷言避免 TypeScript 編譯時的類型推斷問題
  const profilesTable = supabase.from("profiles") as any;
  const { error } = await profilesTable.upsert(
    {
      id: user.id,
      target_weight: targetWeight,
      target_date: targetDate || null
      // 不再更新起始體重和起始日期，使用第一筆記錄自動計算
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Update target error:", error);
    // 提供更詳細的錯誤訊息以便調試
    const errorMessage = error.code === "42703" 
      ? "資料庫欄位不存在：請確認已執行 schema_update.sql 來添加目標設定欄位"
      : error.code === "42501"
      ? "權限不足：請確認資料庫 RLS 政策已正確設定"
      : error.message || "更新失敗，請稍後再試";
    return { success: false, error: errorMessage };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action：批量刪除記錄
 */
export async function batchDeleteRecordsAction(recordIds: string[]): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  if (!recordIds || recordIds.length === 0) {
    return { success: false, error: "請選擇要刪除的記錄" };
  }

  const { error } = await supabase
    .from("daily_records")
    .delete()
    .in("id", recordIds)
    .eq("user_id", user.id);

  if (error) {
    console.error("Batch delete error:", error);
    return { success: false, error: "批量刪除失敗，請稍後再試" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

