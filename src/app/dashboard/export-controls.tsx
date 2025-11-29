"use client";

import { exportToCSV, exportToJSON, downloadFile } from "@/lib/export-utils";
import type { DailyRecordRow } from "@/types/supabase";

type ExportControlsProps = {
  records: DailyRecordRow[];
  isPremium: boolean;
  onPremiumRequired?: () => void;
};

export function ExportControls({ records, isPremium, onPremiumRequired }: ExportControlsProps) {
  const handleExportCSV = () => {
    // 檢查 Premium 權限
    if (!isPremium) {
      if (onPremiumRequired) {
        onPremiumRequired();
      } else {
        alert("此功能僅限 Premium 會員使用。請升級以解鎖數據匯出功能。");
      }
      return;
    }

    if (records.length === 0) {
      alert("沒有記錄可以匯出");
      return;
    }
    const csv = exportToCSV(records);
    const filename = `健康記錄_${new Date().toISOString().split("T")[0]}.csv`;
    downloadFile(csv, filename, "text/csv;charset=utf-8;");
  };

  const handleExportJSON = () => {
    // 檢查 Premium 權限
    if (!isPremium) {
      if (onPremiumRequired) {
        onPremiumRequired();
      } else {
        alert("此功能僅限 Premium 會員使用。請升級以解鎖數據匯出功能。");
      }
      return;
    }

    if (records.length === 0) {
      alert("沒有記錄可以匯出");
      return;
    }
    const json = exportToJSON(records);
    const filename = `健康記錄_${new Date().toISOString().split("T")[0]}.json`;
    downloadFile(json, filename, "application/json");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleExportCSV}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:px-4 sm:text-sm"
        title={!isPremium ? "點擊以升級 Premium 會員" : ""}
      >
        📥 匯出 CSV
      </button>
      <button
        type="button"
        onClick={handleExportJSON}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:px-4 sm:text-sm"
        title={!isPremium ? "點擊以升級 Premium 會員" : ""}
      >
        📥 匯出 JSON
      </button>
    </div>
  );
}

