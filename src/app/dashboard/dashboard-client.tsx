"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useFormState, useFormStatus } from "react-dom";
import { saveDailyRecordAction, deleteDailyRecordAction, upgradeToPremiumAction } from "./actions";
import { StatsCards } from "./stats-cards";
import { TargetTracker } from "./target-tracker";
import { FilterControls } from "./filter-controls";
import { ExportControls } from "./export-controls";
import { BatchActions } from "./batch-actions";
import { SubscriptionBanner } from "./subscription-banner";
import { SubscriptionManagement } from "./subscription-management";
import { Toast } from "@/components/toast";
import { getWeightRange } from "@/lib/weight-utils";
import { isPremiumActive } from "@/lib/subscription-utils";
import type { DailyRecordRow, ProfileRow } from "@/types/supabase";

// 動態載入較重的元件以減少初始 bundle 大小
const PremiumModal = dynamic(
  () => import("./premium-modal").then((mod) => mod.PremiumModal),
  { ssr: false }
);

const WeightChart = dynamic(
  () => import("./weight-chart").then((mod) => mod.WeightChart),
  { ssr: false }
);

const PremiumReports = dynamic(
  () => import("./premium-reports").then((mod) => mod.PremiumReports),
  { ssr: false }
);

type DashboardClientProps = {
  userEmail: string;
  profile: ProfileRow | null;
  records: DailyRecordRow[];
};

const initialState = {
  success: false,
  error: ""
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
    >
      {pending ? "儲存中..." : "儲存記錄"}
    </button>
  );
}

export function DashboardClient({
  userEmail,
  profile,
  records
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  // 使用工具函數判斷 premium 狀態（基於 subscription_end_date）
  // 這樣取消訂閱後，premium 功能仍會保留至到期日
  const isPremium = isPremiumActive(profile);
  // 免費用戶僅顯示最近 7 天的記錄，但仍會在資料庫中保存全部記錄
  // 使用 useMemo 避免每次 render 都產生新陣列，導致 useEffect 無限循環
  const visibleRecords = useMemo(() => {
    if (isPremium) {
      return records;
    }
    // 計算 7 天前的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // 過濾出最近 7 天內的記錄（包括今天）
    return records.filter((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate >= sevenDaysAgo;
    });
  }, [records, isPremium]);

  const [state, formAction] = useFormState(saveDailyRecordAction, initialState);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isSubscriptionManagementOpen, setIsSubscriptionManagementOpen] = useState(false);

  // 檢查 URL 參數，如果 ?premium=true 且用戶不是 Premium，自動打開 modal
  useEffect(() => {
    const premiumParam = searchParams.get("premium");
    if (premiumParam === "true" && !isPremium) {
      setIsPremiumModalOpen(true);
      // 清除 URL 參數，避免重新載入時再次打開
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/dashboard");
      }
    }
  }, [searchParams, isPremium]);
  const [editingRecord, setEditingRecord] = useState<DailyRecordRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filteredRecords, setFilteredRecords] = useState<DailyRecordRow[]>(visibleRecords);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dietNotesLength, setDietNotesLength] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({ message: "", type: "info", isVisible: false });
  
  // 體重單位狀態（從 localStorage 讀取，預設為公斤）
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("weightUnit");
      return (saved === "lb" || saved === "kg") ? saved : "kg";
    }
    return "kg";
  });

  // 取得今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split("T")[0];

  // 如果正在編輯，使用編輯的記錄資料；否則使用今天的日期
  const formDate = editingRecord?.date || today;
  const formDietNotes = editingRecord?.diet_notes || "";
  
  // 當編輯記錄改變時，更新字數計數
  useEffect(() => {
    setDietNotesLength(formDietNotes.length);
  }, [formDietNotes]);
  
  // 根據單位轉換體重顯示值
  const getFormWeight = (): string => {
    if (!editingRecord?.weight) return "";
    if (weightUnit === "lb") {
      const pounds = editingRecord.weight * 2.20462;
      return pounds.toFixed(1);
    }
    return editingRecord.weight.toString();
  };
  const formWeight = getFormWeight();

  // 處理表單提交成功後的重置
  useEffect(() => {
    if (state.success) {
      setEditingRecord(null);
      setToast({
        message: "記錄已成功儲存！",
        type: "success",
        isVisible: true
      });
    } else if (state.error) {
      setToast({
        message: state.error,
        type: "error",
        isVisible: true
      });
    }
  }, [state.success, state.error]);

  // 處理刪除記錄
  function handleDelete(recordId: string) {
    if (!confirm("確定要刪除這筆記錄嗎？")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteDailyRecordAction(recordId);
      if (result.success) {
        // 如果刪除的是正在編輯的記錄，清除編輯狀態
        if (editingRecord?.id === recordId) {
          setEditingRecord(null);
        }
        setToast({
          message: "記錄已成功刪除",
          type: "success",
          isVisible: true
        });
      } else {
        setToast({
          message: result.error || "刪除失敗",
          type: "error",
          isVisible: true
        });
      }
    });
  }

  // 處理編輯記錄
  function handleEdit(record: DailyRecordRow) {
    setEditingRecord(record);
    // 滾動到表單
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 處理 Premium 按鈕點擊
  function handlePremiumClick() {
    if (isPremium) {
      // 已經是 Premium，滾動到 Premium 報告區塊
      const premiumSection = document.getElementById("premium-reports");
      if (premiumSection) {
        premiumSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // 開啟 Premium Modal
      setIsPremiumModalOpen(true);
    }
  }

  // 處理 Premium 升級
  async function handleUpgrade(plan: "monthly" | "yearly") {
    const result = await upgradeToPremiumAction(plan);
    if (result.success) {
      setIsPremiumModalOpen(false);
      const planText = plan === "monthly" ? "月繳" : "年繳";
      setToast({
        message: `升級成功！你現在是 Premium 會員（${planText}方案）了。`,
        type: "success",
        isVisible: true
      });
      // 延遲重新載入以顯示 Toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setToast({
        message: result.error || "升級失敗，請稍後再試",
        type: "error",
        isVisible: true
      });
    }
  }

  // 取得最近 30 天的記錄（用於圖表）
  // 免費用戶：僅顯示最近 7 天；Premium 用戶則顯示最近 30 天
  const chartSourceRecords = isPremium ? records : visibleRecords;
  const recentRecords = chartSourceRecords
    .filter((r) => r.weight !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(isPremium ? -30 : -7);

  // Premium 長期趨勢資料（例如最近 90 天），僅 Premium 用戶可見
  const longTermRecords = records
    .filter((r) => r.weight !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-90);

  // 當 records 改變時更新 filteredRecords
  useEffect(() => {
    setFilteredRecords(visibleRecords);
    // 清除選取狀態，因為記錄可能已改變
    setSelectedIds(new Set());
  }, [visibleRecords]);

  // 處理記錄變更（用於批量操作後重新載入）
  const handleRecordsChange = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 訂閱管理按鈕 - 放在最頂部，方便用戶訪問 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsSubscriptionManagementOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border-2 border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-100 hover:border-emerald-400 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>{isPremium ? "管理訂閱" : "訂閱狀態"}</span>
        </button>
      </div>

      {/* 統計卡片 */}
      <StatsCards records={visibleRecords} />

      {/* 目標追蹤 */}
      <TargetTracker profile={profile} records={records} />

      {/* 表單區塊 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="mb-4 text-base font-semibold dark:text-slate-100 sm:text-lg">
          {editingRecord ? "編輯記錄" : "新增每日記錄"}
        </h2>

        <form
          key={editingRecord?.id || "new"}
          action={formAction}
          className="space-y-4"
          onSubmit={(e) => {
            // 在提交前處理單位轉換
            const form = e.currentTarget;
            const weightInput = form.querySelector<HTMLInputElement>('input[name="weight"]');
            if (weightInput && weightInput.value && weightUnit === "lb") {
              const pounds = parseFloat(weightInput.value);
              if (!isNaN(pounds)) {
                const kilograms = pounds / 2.20462;
                weightInput.value = kilograms.toFixed(1);
              }
            }
          }}
        >

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                required
                defaultValue={formDate}
                max={today}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  體重
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWeightUnit("kg");
                      if (typeof window !== "undefined") {
                        localStorage.setItem("weightUnit", "kg");
                        window.dispatchEvent(new Event("weightUnitChange"));
                      }
                    }}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      weightUnit === "kg"
                        ? "bg-slate-900 text-white dark:bg-slate-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    公斤
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWeightUnit("lb");
                      if (typeof window !== "undefined") {
                        localStorage.setItem("weightUnit", "lb");
                        window.dispatchEvent(new Event("weightUnitChange"));
                      }
                    }}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      weightUnit === "lb"
                        ? "bg-slate-900 text-white dark:bg-slate-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    磅
                  </button>
                </div>
              </div>
              <input
                type="number"
                name="weight"
                step="0.1"
                min={getWeightRange(weightUnit).min}
                max={getWeightRange(weightUnit).max}
                defaultValue={formWeight}
                placeholder={weightUnit === "kg" ? "例如：65.5" : "例如：144.3"}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                範圍：{getWeightRange(weightUnit).min}-{getWeightRange(weightUnit).max} {weightUnit === "kg" ? "公斤" : "磅"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                飲食記錄
              </label>
              <span className={`text-xs ${dietNotesLength > 1000 ? 'text-red-500' : dietNotesLength > 900 ? 'text-amber-500' : 'text-slate-500'} dark:text-slate-400`}>
                {dietNotesLength}/1000
              </span>
            </div>
            <textarea
              name="diet_notes"
              rows={4}
              maxLength={1000}
              defaultValue={formDietNotes}
              placeholder="記錄今天的飲食內容..."
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              onChange={(e) => {
                setDietNotesLength(e.target.value.length);
              }}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              最多 1000 個字元（約 500 個中文字），防止輸入過長內容造成系統負擔
            </p>
          </div>

          {state.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          {state.success && (
            <p className="text-sm text-emerald-600">記錄已儲存！</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SubmitButton />
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

      {/* 篩選與搜尋 */}
      {visibleRecords.length > 0 && (
        <FilterControls
          records={visibleRecords}
          onFilteredRecordsChange={setFilteredRecords}
          isPremium={isPremium}
          onPremiumRequired={() => setIsPremiumModalOpen(true)}
        />
      )}

      {/* 歷史記錄列表 - 移到前面方便手機用戶快速查看 */}
      <div id="history-records" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold dark:text-slate-100 sm:text-lg">
            歷史記錄{!isPremium && "（最近 7 天）"}
          </h2>
          {visibleRecords.length > 0 && (
            <ExportControls 
              records={filteredRecords} 
              isPremium={isPremium}
              onPremiumRequired={() => setIsPremiumModalOpen(true)}
            />
          )}
        </div>

        {visibleRecords.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            尚無記錄，開始新增你的第一筆記錄吧！
          </p>
        ) : (
          <>
            <BatchActions
              records={filteredRecords}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
              onRecordsChange={handleRecordsChange}
            />

            {filteredRecords.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400">
                沒有符合條件的記錄
              </p>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between sm:p-4"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(record.id)}
                        onChange={() => {
                          const newSelected = new Set(selectedIds);
                          if (newSelected.has(record.id)) {
                            newSelected.delete(record.id);
                          } else {
                            newSelected.add(record.id);
                          }
                          setSelectedIds(newSelected);
                        }}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-base">
                            {new Date(record.date).toLocaleDateString("zh-TW", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </span>
                          {record.weight && (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300 sm:text-sm">
                              {record.weight} kg
                            </span>
                          )}
                        </div>
                        {record.diet_notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                            {record.diet_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(record)}
                        className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        disabled={isPending}
                        className="flex-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 sm:flex-none"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Premium 按鈕和報告 */}
      <div className="space-y-4">
        {!isPremium && (
          <div className="rounded-lg border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 dark:border-emerald-700 dark:from-emerald-900/30 dark:to-emerald-800/30 sm:p-6">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="mb-1 text-base font-bold text-emerald-900 dark:text-emerald-100 sm:text-lg">
                  ⭐ 升級 Premium 會員
                </h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  解鎖完整歷史記錄、長期趨勢分析、數據匯出與進階報告功能
                </p>
              </div>
              <button
                type="button"
                onClick={handlePremiumClick}
                className="w-full rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600 sm:w-auto"
              >
                立即升級 Premium
              </button>
            </div>
          </div>
        )}
        {isPremium && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePremiumClick}
              className="rounded-md bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
            >
              ✓ Premium 會員
            </button>
          </div>
        )}

        {/* Premium 進階報告（僅 Premium 用戶可見） */}
        {isPremium && (
          <div id="premium-reports">
            <PremiumReports records={records} />
          </div>
        )}
      </div>

      {/* 體重趨勢圖 */}
      {recentRecords.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <h2 className="mb-2 text-base font-semibold dark:text-slate-100 sm:text-lg">
            體重趨勢（最近 {isPremium ? "30 天" : "7 天（免費）"}）
          </h2>
          <WeightChart records={recentRecords} profile={profile} />
        </div>
      )}

      {/* Premium 長期趨勢圖（僅 Premium 用戶可見，非 Premium 顯示付費牆） */}
      {records.length > 7 && (
        <div className="relative rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-100 sm:text-lg">
              長期體重趨勢（最多 90 天）
            </h2>
            {!isPremium && (
              <span className="rounded-full bg-emerald-200 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                Premium
              </span>
            )}
          </div>

          {isPremium ? (
            longTermRecords.length > 0 ? (
              <WeightChart records={longTermRecords} profile={profile} />
            ) : (
              <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">
                目前沒有足夠的歷史體重資料，請持續紀錄幾週後再回來查看長期趨勢。
              </p>
            )
          ) : (
            <div className="relative mt-2 overflow-hidden rounded-md border border-emerald-200 bg-white/40 dark:border-emerald-700 dark:bg-emerald-900/30">
              {/* 模糊的預覽圖表 */}
              {longTermRecords.length > 0 && (
                <div className="pointer-events-none blur-sm">
                  <WeightChart records={longTermRecords} profile={profile} />
                </div>
              )}

              {/* 付費牆覆蓋層 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/70 px-4 text-center text-sm text-emerald-50 sm:text-base">
                <p className="mb-2 font-semibold">解鎖長期體重趨勢圖表</p>
                <p className="mb-3 text-xs text-emerald-100 sm:text-sm">
                  升級 Premium 後即可查看 90 天以上的體重變化、進階分析與完整歷史紀錄。
                </p>
                <button
                  type="button"
                  onClick={handlePremiumClick}
                  className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-400 sm:text-sm"
                >
                  查看 Premium 方案
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Premium Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={(plan) => handleUpgrade(plan)}
      />

      {/* 訂閱管理 Modal */}
      <SubscriptionManagement
        profile={profile}
        isOpen={isSubscriptionManagementOpen}
        onClose={() => setIsSubscriptionManagementOpen(false)}
        onUpdate={() => window.location.reload()}
      />

      {/* Toast 通知 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

