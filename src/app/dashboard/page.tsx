import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import type { DailyRecordRow, ProfileRow } from "@/types/supabase";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  // 在 Server Component 中讀取目前登入的使用者
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // 若尚未登入，直接導向登入頁
  if (!user) {
    redirect("/auth/login");
  }

  // 讀取用戶的 profile 資料（包含 is_premium 狀態）
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile: ProfileRow | null = profileData || null;

  // 如果沒有 profile，自動建立一個（預設 is_premium = false）
  let finalProfile = profile;
  if (!profile) {
    // 使用類型斷言避免 TypeScript 編譯時的類型推斷問題
    const profilesTable = supabase.from("profiles") as any;
    const { data: newProfile, error: insertError } = await profilesTable
      .insert({
        id: user.id,
        is_premium: false,
        is_admin: false
      })
      .select()
      .single();

    if (newProfile && !insertError) {
      finalProfile = newProfile;
    } else if (insertError) {
      // 如果插入失敗（可能是因為已經存在），嘗試重新讀取
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (existingProfile) {
        finalProfile = existingProfile;
      }
    }
  }

  // 讀取用戶的所有每日記錄，按日期倒序排列
  const { data: recordsData, error: recordsError } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const records: DailyRecordRow[] = recordsData || [];

  if (recordsError) {
    console.error("Error fetching records:", recordsError);
  }

  // 判斷是否為開發環境
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <section className="space-y-4">
      {/* 開發環境測試模式提示橫幅 */}
      {isDevelopment && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-900/20">
          <div className="flex items-start gap-2">
            <span className="text-lg shrink-0">⚠️</span>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              測試模式啟用：請手動檢查 Supabase 中的 is_premium 欄位進行狀態更新。
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">儀表板</h1>
          <p className="text-slate-600 text-sm dark:text-slate-400">
            嗨，{user.email}，開始追蹤你的健康數據吧！
          </p>
        </div>
      </div>

      {/* Dashboard Client Component：包含表單、列表、圖表和 Premium 功能 */}
      <DashboardClient
        userEmail={user.email || ""}
        profile={finalProfile}
        records={records}
      />
    </section>
  );
}

