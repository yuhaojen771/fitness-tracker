"use client";

import { exportToCSV, exportToJSON, downloadFile } from "@/lib/export-utils";
import type { DailyRecordRow } from "@/types/supabase";

type ExportControlsProps = {
  records: DailyRecordRow[];
};

export function ExportControls({ records }: ExportControlsProps) {
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert("沒有記錄可以匯出");
      return;
    }
    const csv = exportToCSV(records);
    const filename = `健康記錄_${new Date().toISOString().split("T")[0]}.csv`;
    downloadFile(csv, filename, "text/csv;charset=utf-8;");
  };

  const handleExportJSON = () => {
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
      >
        📥 匯出 CSV
      </button>
      <button
        type="button"
        onClick={handleExportJSON}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:px-4 sm:text-sm"
      >
        📥 匯出 JSON
      </button>
    </div>
  );
}

