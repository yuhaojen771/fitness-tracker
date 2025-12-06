import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExpenseDashboardClient } from "./expense-dashboard-client";
import type { ExpenseRecordRow, ExpenseCategoryRow } from "@/types/supabase";

export default async function ExpenseDashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 讀取記帳記錄
  const { data: recordsData, error: recordsError } = await supabase
    .from("expense_records")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const records: ExpenseRecordRow[] = recordsData || [];

  if (recordsError) {
    console.error("Error fetching expense records:", recordsError);
  }

  // 讀取類別
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("expense_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  let categories: ExpenseCategoryRow[] = categoriesData || [];

  // 如果用戶沒有類別，建立預設類別
  if (categories.length === 0) {
    const defaultCategories = [
      { name: "餐飲", icon: "🍽️", color: "#ef4444", is_default: true },
      { name: "交通", icon: "🚗", color: "#3b82f6", is_default: true },
      { name: "購物", icon: "🛍️", color: "#8b5cf6", is_default: true },
      { name: "娛樂", icon: "🎮", color: "#f59e0b", is_default: true },
      { name: "醫療", icon: "🏥", color: "#10b981", is_default: true },
      { name: "教育", icon: "📚", color: "#6366f1", is_default: true },
      { name: "其他", icon: "📝", color: "#6b7280", is_default: true },
      { name: "薪資", icon: "💰", color: "#10b981", is_default: true },
      { name: "投資", icon: "📈", color: "#10b981", is_default: true },
      { name: "獎金", icon: "🎁", color: "#10b981", is_default: true }
    ];

    const expenseCategoriesTable = supabase.from("expense_categories") as any;
    const { data: newCategories } = await expenseCategoriesTable
      .insert(
        defaultCategories.map((cat) => ({
          user_id: user.id,
          ...cat
        }))
      )
      .select();

    if (newCategories) {
      categories = newCategories;
    }
  }

  if (categoriesError) {
    console.error("Error fetching expense categories:", categoriesError);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">記帳儀表板</h1>
          <p className="text-slate-600 text-sm dark:text-slate-400">
            記錄您的收支，掌握財務狀況
          </p>
        </div>
      </div>

      <ExpenseDashboardClient records={records} categories={categories} />
    </section>
  );
}

