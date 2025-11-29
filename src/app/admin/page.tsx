import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminClient } from "./admin-client";
import type { ProfileRow } from "@/types/supabase";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();

  // 檢查用戶是否登入
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 檢查用戶是否為管理員
  // 使用類型斷言避免 TypeScript 編譯時的類型推斷問題
  const profilesTable = supabase.from("profiles") as any;
  const { data: profileData } = await profilesTable
    .select("*")
    .eq("id", user.id)
    .single();

  const profile: ProfileRow | null = profileData || null;

  // 如果沒有 profile 或不是管理員，導向儀表板
  if (!profile || !profile.is_admin) {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">管理後台</h1>
          <p className="text-slate-600 text-sm dark:text-slate-400">
            管理員：{user.email}
          </p>
        </div>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-500"
        >
          <span>返回儀表板</span>
        </a>
      </div>

      <AdminClient />
    </section>
  );
}

