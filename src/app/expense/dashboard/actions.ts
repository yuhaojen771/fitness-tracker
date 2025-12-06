"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ExpenseRecordRow, ExpenseCategoryRow } from "@/types/supabase";

type ActionState = {
  success: boolean;
  error?: string;
};

/**
 * Server Action：建立或更新記帳記錄
 */
export async function saveExpenseRecordAction(
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

  const id = String(formData.get("id") ?? "").trim();
  const type = String(formData.get("type") ?? "expense");
  const amountStr = String(formData.get("amount") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;
  const date = String(formData.get("date") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;

  // 驗證
  if (!date) {
    return { success: false, error: "請選擇日期" };
  }

  if (!amountStr) {
    return { success: false, error: "請輸入金額" };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "金額必須是大於 0 的數字" };
  }

  if (type !== "expense" && type !== "income") {
    return { success: false, error: "類型必須是支出或收入" };
  }

  // 驗證備註長度
  const MAX_NOTE_LENGTH = 500;
  if (note && note.length > MAX_NOTE_LENGTH) {
    return {
      success: false,
      error: `備註最多只能輸入 ${MAX_NOTE_LENGTH} 個字元（目前：${note.length} 個字元）`
    };
  }

  const expenseRecordsTable = supabase.from("expense_records") as any;

  if (id) {
    // 更新現有記錄
    const { error } = await expenseRecordsTable
      .update({
        type,
        amount,
        category_id: categoryId,
        date,
        note
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Update expense record error:", error);
      return { success: false, error: "更新失敗，請稍後再試" };
    }
  } else {
    // 建立新記錄
    const { error } = await expenseRecordsTable.insert({
      user_id: user.id,
      type,
      amount,
      category_id: categoryId,
      date,
      note
    });

    if (error) {
      console.error("Create expense record error:", error);
      return { success: false, error: "儲存失敗，請稍後再試" };
    }
  }

  revalidatePath("/expense/dashboard");
  return { success: true };
}

/**
 * Server Action：刪除記帳記錄
 */
export async function deleteExpenseRecordAction(recordId: string): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  const expenseRecordsTable = supabase.from("expense_records") as any;
  const { error } = await expenseRecordsTable.delete().eq("id", recordId).eq("user_id", user.id);

  if (error) {
    console.error("Delete expense record error:", error);
    return { success: false, error: "刪除失敗，請稍後再試" };
  }

  revalidatePath("/expense/dashboard");
  return { success: true };
}

/**
 * Server Action：建立或更新類別
 */
export async function saveExpenseCategoryAction(
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

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "").trim() || null;

  if (!name) {
    return { success: false, error: "請輸入類別名稱" };
  }

  // 驗證名稱長度
  if (name.length > 20) {
    return { success: false, error: "類別名稱最多 20 個字元" };
  }

  const expenseCategoriesTable = supabase.from("expense_categories") as any;

  if (id) {
    // 更新現有類別
    const { error } = await expenseCategoriesTable
      .update({
        name,
        icon,
        color
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Update expense category error:", error);
      return { success: false, error: "更新失敗，請稍後再試" };
    }
  } else {
    // 建立新類別
    const { error } = await expenseCategoriesTable.insert({
      user_id: user.id,
      name,
      icon,
      color,
      is_default: false
    });

    if (error) {
      console.error("Create expense category error:", error);
      // 如果是重複名稱錯誤
      if (error.code === "23505") {
        return { success: false, error: "此類別名稱已存在" };
      }
      return { success: false, error: "建立失敗，請稍後再試" };
    }
  }

  revalidatePath("/expense/dashboard");
  return { success: true };
}

/**
 * Server Action：刪除類別
 */
export async function deleteExpenseCategoryAction(categoryId: string): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "請先登入" };
  }

  // 檢查是否為預設類別
  const expenseCategoriesTable = supabase.from("expense_categories") as any;
  const { data: category } = await expenseCategoriesTable
    .select("is_default")
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .single();

  if (category?.is_default) {
    return { success: false, error: "無法刪除預設類別" };
  }

  // 檢查是否有記錄使用此類別
  const expenseRecordsTable = supabase.from("expense_records") as any;
  const { data: records } = await expenseRecordsTable
    .select("id")
    .eq("category_id", categoryId)
    .eq("user_id", user.id)
    .limit(1);

  if (records && records.length > 0) {
    return { success: false, error: "此類別仍有記帳記錄，無法刪除" };
  }

  const { error } = await expenseCategoriesTable
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete expense category error:", error);
    return { success: false, error: "刪除失敗，請稍後再試" };
  }

  revalidatePath("/expense/dashboard");
  return { success: true };
}

