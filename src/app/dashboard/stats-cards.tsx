"use client";

import { useState, useEffect } from "react";
import type { DailyRecordRow } from "@/types/supabase";
import { formatWeight } from "@/lib/weight-utils";
import type { WeightUnit } from "@/lib/weight-utils";

type StatsCardsProps = {
  records: DailyRecordRow[];
};

/**
 * Dashboard 統計卡片組件
 * - 顯示平均體重、體重變化、記錄總數等統計資訊
 */
export function StatsCards({ records }: StatsCardsProps) {
  // 從 localStorage 讀取單位設定
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("weightUnit");
      if (saved === "lb" || saved === "kg") {
        setWeightUnit(saved);
      }
      
      // 監聽 localStorage 變化（當用戶切換單位時）
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "weightUnit" && (e.newValue === "lb" || e.newValue === "kg")) {
          setWeightUnit(e.newValue);
        }
      };
      
      // 監聽自定義事件（同頁面內切換單位時觸發）
      const handleUnitChange = () => {
        const saved = localStorage.getItem("weightUnit");
        if (saved === "lb" || saved === "kg") {
          setWeightUnit(saved);
        }
      };
      
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("weightUnitChange", handleUnitChange);
      
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("weightUnitChange", handleUnitChange);
      };
    }
  }, []);

  // 取得有體重數據的記錄，按日期升序排列（最早到最新）
  const weightRecords = records
    .filter((r) => r.weight !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 計算統計數據
  const totalRecords = records.length;
  const weightRecordsCount = weightRecords.length;

  // 平均體重
  const averageWeight =
    weightRecords.length > 0
      ? weightRecords.reduce((sum, r) => sum + (r.weight || 0), 0) /
        weightRecords.length
      : null;

  // 體重變化（最新 vs 最早）
  // weightRecords 已按日期升序排列，所以：
  // - weightRecords[0] 是最早的記錄（最早的日期，最初的體重）
  // - weightRecords[weightRecords.length - 1] 是最新的記錄（最新的日期，現在的體重）
  // 計算：最新體重 - 最早體重
  // 結果：正數 = 體重增加（上升，紅色），負數 = 體重減少（下降，綠色）
  let weightChange: number | null = null;
  if (weightRecords.length >= 2) {
    const earliestWeight = weightRecords[0].weight || 0;
    const latestWeight = weightRecords[weightRecords.length - 1].weight || 0;
    weightChange = latestWeight - earliestWeight;
  }

  // 最近記錄天數
  const recentDays = records.length > 0
    ? Math.ceil(
        (new Date().getTime() - new Date(records[records.length - 1].date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // 最近記錄的日期（records 是按日期倒序排列，所以 records[0] 是最新的）
  const lastRecordDate = records.length > 0 ? new Date(records[0].date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 計算距離最近記錄的天數
  let daysSinceLastRecord: number | null = null;
  if (lastRecordDate) {
    lastRecordDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastRecordDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 如果記錄日期是今天或未來，顯示「今天」
    if (diffDays <= 0) {
      daysSinceLastRecord = 0;
    } else {
      daysSinceLastRecord = diffDays;
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 記錄總數 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">記錄總數</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totalRecords}
            </p>
          </div>
          <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-700">
            <svg
              className="h-6 w-6 text-slate-600 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 平均體重 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">平均體重</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {averageWeight ? formatWeight(averageWeight, weightUnit) : "—"}
            </p>
            {weightRecordsCount > 0 && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                基於 {weightRecordsCount} 筆記錄
              </p>
            )}
          </div>
          <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <svg
              className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 體重變化 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">體重變化</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {weightChange !== null
                ? `${weightChange > 0 ? "+" : weightChange < 0 ? "-" : ""}${formatWeight(Math.abs(weightChange), weightUnit)}`
                : "—"}
            </p>
            {weightChange !== null && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                與最初記錄比較
              </p>
            )}
          </div>
          <div
            className={`rounded-full p-3 ${
              weightChange !== null && weightChange < 0
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : weightChange !== null && weightChange > 0
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-slate-100 dark:bg-slate-700"
            }`}
          >
            <svg
              className={`h-6 w-6 ${
                weightChange !== null && weightChange < 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : weightChange !== null && weightChange > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-600 dark:text-slate-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {weightChange !== null && weightChange < 0 ? (
                // 下降圖示（綠色，體重減少）
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              ) : (
                // 上升圖示（紅色，體重增加）
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* 最近記錄 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">最近記錄</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {daysSinceLastRecord !== null
                ? daysSinceLastRecord === 0
                  ? "今天"
                  : `${daysSinceLastRecord} 天前`
                : "—"}
            </p>
            {lastRecordDate && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {lastRecordDate.toLocaleDateString("zh-TW", {
                  month: "short",
                  day: "numeric"
                })}
              </p>
            )}
          </div>
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

