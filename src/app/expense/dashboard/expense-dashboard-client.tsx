"use client";

import { useState, useMemo, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  saveExpenseRecordAction,
  deleteExpenseRecordAction,
  saveExpenseCategoryAction,
  deleteExpenseCategoryAction
} from "./actions";
import type { ExpenseRecordRow, ExpenseCategoryRow } from "@/types/supabase";

type ExpenseDashboardClientProps = {
  records: ExpenseRecordRow[];
  categories: ExpenseCategoryRow[];
};

const initialState = {
  success: false,
  error: ""
};

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white"
    >
      {pending ? "處理中..." : text}
    </button>
  );
}

export function ExpenseDashboardClient({
  records,
  categories: initialCategories
}: ExpenseDashboardClientProps) {
  const [state, formAction] = useFormState(saveExpenseRecordAction, initialState);
  const [categoryState, categoryFormAction] = useFormState(saveExpenseCategoryAction, initialState);
  const [editingRecord, setEditingRecord] = useState<ExpenseRecordRow | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all"); // 主類別篩選
  const [categories, setCategories] = useState(initialCategories);

  // 組織類別結構（主類別和次類別）
  const organizedCategories = useMemo(() => {
    const mainCategories = categories.filter((c) => !c.parent_category_id);
    const subCategories = categories.filter((c) => c.parent_category_id);
    
    return mainCategories.map((main) => ({
      ...main,
      subCategories: subCategories.filter((sub) => sub.parent_category_id === main.id)
    }));
  }, [categories]);

  // 當 categories 更新時同步
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // 計算月度統計
  const monthlyStats = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const filteredRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
    });

    const expenses = filteredRecords.filter((r) => r.type === "expense");
    const incomes = filteredRecords.filter((r) => r.type === "income");

    const totalExpense = expenses.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalIncome = incomes.reduce((sum, r) => sum + Number(r.amount), 0);

    // 按類別統計支出
    const categoryStats = expenses.reduce((acc, record) => {
      const categoryId = record.category_id || "未分類";
      const category = categories.find((c) => c.id === record.category_id);
      const categoryName = category?.name || "未分類";
      const categoryIcon = category?.icon || "📝";

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryName,
          icon: categoryIcon,
          amount: 0,
          count: 0
        };
      }
      acc[categoryId].amount += Number(record.amount);
      acc[categoryId].count += 1;
      return acc;
    }, {} as Record<string, { id: string; name: string; icon: string; amount: number; count: number }>);

    const categoryStatsArray = Object.values(categoryStats).sort((a, b) => b.amount - a.amount);

    // 根據主類別篩選記錄
    let finalRecords = filteredRecords;
    if (selectedCategoryFilter !== "all") {
      // 如果選擇了主類別，只顯示該主類別及其次類別的記錄
      const mainCategoryId = selectedCategoryFilter;
      const subCategoryIds = categories
        .filter((c) => c.parent_category_id === mainCategoryId)
        .map((c) => c.id);
      const allCategoryIds = [mainCategoryId, ...subCategoryIds];
      
      finalRecords = filteredRecords.filter((record) => {
        if (!record.category_id) return false;
        return allCategoryIds.includes(record.category_id);
      });
    }

    return {
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
      categoryStats: categoryStatsArray,
      records: finalRecords
    };
  }, [records, selectedMonth, categories, selectedCategoryFilter]);

  // 當表單成功提交後重置
  useEffect(() => {
    if (state.success) {
      setEditingRecord(null);
      // 重新載入頁面以更新資料
      window.location.reload();
    }
  }, [state.success]);

  useEffect(() => {
    if (categoryState.success) {
      setIsCategoryModalOpen(false);
      window.location.reload();
    }
  }, [categoryState.success]);

  // 處理刪除
  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此記錄嗎？")) {
      return;
    }
    const result = await deleteExpenseRecordAction(id);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "刪除失敗");
    }
  };

  // 取得今天的日期（YYYY-MM-DD）
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* 月度統計卡片 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">總支出</p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
            ${monthlyStats.totalExpense.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">總收入</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${monthlyStats.totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">結餘</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              monthlyStats.balance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            ${monthlyStats.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 月份選擇 */}
      <div className="flex items-center justify-between">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={() => setIsCategoryModalOpen(true)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          管理類別
        </button>
      </div>

      {/* 記帳表單 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold">
          {editingRecord ? "編輯記帳" : "新增記帳"}
        </h2>
        <form action={formAction} className="space-y-4">
          {editingRecord && <input type="hidden" name="id" value={editingRecord.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                類型 *
              </label>
              <select
                name="type"
                required
                defaultValue={editingRecord?.type || "expense"}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                金額 *
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0.01"
                step="0.01"
                defaultValue={editingRecord?.amount || ""}
                placeholder="0.00"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                類別
              </label>
              <select
                name="category_id"
                defaultValue={editingRecord?.category_id || ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="">未分類</option>
                {organizedCategories.map((mainCat) => (
                  <optgroup key={mainCat.id} label={`${mainCat.icon} ${mainCat.name}`}>
                    <option value={mainCat.id}>
                      {mainCat.icon} {mainCat.name}
                    </option>
                    {mainCat.subCategories.map((subCat) => (
                      <option key={subCat.id} value={subCat.id}>
                        &nbsp;&nbsp;{subCat.icon} {subCat.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                日期 *
              </label>
              <input
                type="date"
                name="date"
                required
                defaultValue={editingRecord?.date || today}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              備註
            </label>
            <textarea
              name="note"
              rows={2}
              defaultValue={editingRecord?.note || ""}
              placeholder="選填"
              maxLength={500}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {state.error}
            </p>
          )}

          {state.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">記錄已儲存！</p>
          )}

          <div className="flex gap-3">
            <SubmitButton text={editingRecord ? "更新記錄" : "儲存記錄"} />
            {editingRecord && (
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                取消編輯
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 類別統計 */}
      {monthlyStats.categoryStats.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold">支出分類統計</h2>
          <div className="space-y-2">
            {monthlyStats.categoryStats.map((stat) => {
              const percentage =
                monthlyStats.totalExpense > 0
                  ? ((stat.amount / monthlyStats.totalExpense) * 100).toFixed(1)
                  : "0";
              return (
                <div key={stat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {stat.icon} {stat.name} ({stat.count} 筆)
                    </span>
                    <span className="font-medium">
                      ${stat.amount.toLocaleString()} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 記帳列表 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">記帳記錄</h2>
          {/* 主類別篩選 */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="all">全部類別</option>
            {organizedCategories.map((mainCat) => (
              <option key={mainCat.id} value={mainCat.id}>
                {mainCat.icon} {mainCat.name}
              </option>
            ))}
          </select>
        </div>
        {monthlyStats.records.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">尚無記錄</p>
        ) : (
          <div className="space-y-2">
            {monthlyStats.records.map((record) => {
              const category = categories.find((c) => c.id === record.category_id);
              const parentCategory = category?.parent_category_id
                ? categories.find((c) => c.id === category.parent_category_id)
                : null;
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category?.icon || "📝"}</span>
                      <div>
                        <p className="text-sm font-medium">
                          {parentCategory && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {parentCategory.icon} {parentCategory.name} /{" "}
                            </span>
                          )}
                          {category?.name || "未分類"}
                          {record.note && (
                            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                              - {record.note}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(record.date).toLocaleDateString("zh-TW")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold ${
                        record.type === "expense"
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {record.type === "expense" ? "-" : "+"}
                      ${Number(record.amount).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingRecord(record)}
                        className="rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 類別管理 Modal */}
      {isCategoryModalOpen && (
        <CategoryManagementModal
          categories={categories}
          onClose={() => setIsCategoryModalOpen(false)}
          formAction={categoryFormAction}
          categoryState={categoryState}
          onDelete={async (id) => {
            const result = await deleteExpenseCategoryAction(id);
            if (result.success) {
              window.location.reload();
            } else {
              alert(result.error || "刪除失敗");
            }
          }}
        />
      )}
    </div>
  );
}

// 類別管理 Modal 組件
function CategoryManagementModal({
  categories,
  onClose,
  formAction,
  categoryState,
  onDelete
}: {
  categories: ExpenseCategoryRow[];
  onClose: () => void;
  formAction: any; // useFormState 返回的 formAction 類型
  categoryState: { success: boolean; error?: string };
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryRow | null>(null);
  const [isSubCategory, setIsSubCategory] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>("");

  // 組織類別結構
  const mainCategories = categories.filter((c) => !c.parent_category_id);
  const subCategories = categories.filter((c) => c.parent_category_id);
  
  const defaultMainCategories = mainCategories.filter((c) => c.is_default);
  const customMainCategories = mainCategories.filter((c) => !c.is_default);
  
  // 按主類別組織次類別
  const organizedSubCategories = mainCategories.map((main) => ({
    main,
    subs: subCategories.filter((sub) => sub.parent_category_id === main.id)
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">管理類別</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        {/* 新增類別表單 */}
        <form action={formAction} className="mb-6 space-y-3 border-b border-slate-200 pb-4 dark:border-slate-700">
          {editingCategory && <input type="hidden" name="id" value={editingCategory.id} />}
          
          {/* 類別類型選擇 */}
          {!editingCategory && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubCategory(false);
                  setSelectedParentCategory("");
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  !isSubCategory
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"
                }`}
              >
                主類別
              </button>
              <button
                type="button"
                onClick={() => setIsSubCategory(true)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isSubCategory
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"
                }`}
              >
                次類別
              </button>
            </div>
          )}

          {/* 主類別選擇（新增或編輯次類別時顯示） */}
          {isSubCategory && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                選擇主類別
              </label>
              <select
                value={editingCategory?.parent_category_id || selectedParentCategory}
                onChange={(e) => setSelectedParentCategory(e.target.value)}
                required
                disabled={!!editingCategory} // 編輯時不可更改主類別
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">請選擇主類別</option>
                {mainCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 隱藏欄位：parent_category_id */}
          {isSubCategory && (
            <input
              type="hidden"
              name="parent_category_id"
              value={editingCategory?.parent_category_id || selectedParentCategory}
            />
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              name="name"
              required
              maxLength={20}
              defaultValue={editingCategory?.name || ""}
              placeholder="類別名稱"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            />
            <input
              type="text"
              name="icon"
              maxLength={2}
              defaultValue={editingCategory?.icon || ""}
              placeholder="圖示 (emoji)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            />
            <input
              type="color"
              name="color"
              defaultValue={editingCategory?.color || "#6b7280"}
              className="h-10 rounded-md border border-slate-300 dark:border-slate-600"
            />
          </div>
          {categoryState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{categoryState.error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              {editingCategory ? "更新" : "新增"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setIsSubCategory(false);
                  setSelectedParentCategory("");
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300"
              >
                取消
              </button>
            )}
          </div>
        </form>

        {/* 類別列表 */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* 預設主類別 */}
          {defaultMainCategories.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                預設主類別
              </h3>
              <div className="space-y-1">
                {defaultMainCategories.map((cat) => {
                  const subs = subCategories.filter((sub) => sub.parent_category_id === cat.id);
                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between rounded-md border border-slate-200 p-2 dark:border-slate-700">
                        <span>
                          {cat.icon} {cat.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">預設</span>
                      </div>
                      {/* 次類別 */}
                      {subs.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900"
                            >
                              <span className="text-sm">
                                &nbsp;&nbsp;{sub.icon} {sub.name}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategory(sub);
                                    setIsSubCategory(true);
                                    setSelectedParentCategory(sub.parent_category_id || "");
                                  }}
                                  className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                  編輯
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDelete(sub.id)}
                                  className="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  刪除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 自訂主類別 */}
          {customMainCategories.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                自訂主類別
              </h3>
              <div className="space-y-1">
                {customMainCategories.map((cat) => {
                  const subs = subCategories.filter((sub) => sub.parent_category_id === cat.id);
                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between rounded-md border border-slate-200 p-2 dark:border-slate-700">
                        <span>
                          {cat.icon} {cat.name}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsSubCategory(false);
                              setSelectedParentCategory("");
                            }}
                            className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(cat.id)}
                            className="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                      {/* 次類別 */}
                      {subs.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900"
                            >
                              <span className="text-sm">
                                &nbsp;&nbsp;{sub.icon} {sub.name}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategory(sub);
                                    setIsSubCategory(true);
                                    setSelectedParentCategory(sub.parent_category_id || "");
                                  }}
                                  className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                  編輯
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDelete(sub.id)}
                                  className="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  刪除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

