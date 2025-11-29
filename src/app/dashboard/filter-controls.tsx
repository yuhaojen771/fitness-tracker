"use client";

import { useState, useEffect } from "react";
import type { DailyRecordRow } from "@/types/supabase";

type FilterControlsProps = {
  records: DailyRecordRow[];
  onFilteredRecordsChange: (filtered: DailyRecordRow[]) => void;
};

type SortOption = "date-desc" | "date-asc" | "weight-desc" | "weight-asc";

export function FilterControls({
  records,
  onFilteredRecordsChange
}: FilterControlsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  // 應用篩選和排序
  const applyFilters = () => {
    let filtered = [...records];

    // 日期範圍篩選
    if (startDate) {
      filtered = filtered.filter((r) => r.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((r) => r.date <= endDate);
    }

    // 關鍵字搜尋（搜尋飲食記錄 / 日期 / 體重）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      // 嘗試將輸入解析為日期，支援幾種常見格式：
      // - 2025-11-27
      // - 2025/11/27
      // - 2025年11月27日
      let isoDateFromQuery: string | null = null;
      try {
        const normalized = query
          .replace(/年|\/|\./g, "-")
          .replace(/月/g, "-")
          .replace(/日/g, "")
          .trim();
        const date = new Date(normalized);
        if (!Number.isNaN(date.getTime())) {
          isoDateFromQuery = date.toISOString().split("T")[0];
        }
      } catch {
        isoDateFromQuery = null;
      }

      filtered = filtered.filter(
        (r) =>
          r.diet_notes?.toLowerCase().includes(query) ||
          // 直接比對 ISO 日期字串（YYYY-MM-DD）
          r.date.includes(query) ||
          // 比對解析後的 ISO 日期
          (isoDateFromQuery ? r.date === isoDateFromQuery : false) ||
          // 比對本地化後的日期字串（例如 2025/11/27、2025年11月27日）
          new Date(r.date)
            .toLocaleDateString("zh-TW")
            .toLowerCase()
            .includes(query) ||
          r.weight?.toString().includes(query)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "weight-desc":
          const weightB = b.weight ?? 0;
          const weightA = a.weight ?? 0;
          return weightB - weightA;
        case "weight-asc":
          const weightA2 = a.weight ?? 0;
          const weightB2 = b.weight ?? 0;
          return weightA2 - weightB2;
        default:
          return 0;
      }
    });

    onFilteredRecordsChange(filtered);
  };

  // 當篩選條件改變時自動應用
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, startDate, endDate, sortBy, records]);

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSortBy("date-desc");
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold dark:text-slate-100 sm:text-lg">篩選與搜尋</h3>
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 sm:text-sm"
        >
          清除篩選
        </button>
      </div>

      <div className="space-y-4">
        {/* 關鍵字搜尋 */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
            搜尋
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋日期、體重或飲食記錄..."
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>

        {/* 日期範圍 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="w-full">
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
              開始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div className="w-full">
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
              結束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>

        {/* 排序 */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
            排序方式
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="date-desc">日期（新到舊）</option>
            <option value="date-asc">日期（舊到新）</option>
            <option value="weight-desc">體重（高到低）</option>
            <option value="weight-asc">體重（低到高）</option>
          </select>
        </div>
      </div>
    </div>
  );
}

