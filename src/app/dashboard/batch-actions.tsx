"use client";

import { useState, useTransition } from "react";
import { batchDeleteRecordsAction } from "./actions";
import type { DailyRecordRow } from "@/types/supabase";

type BatchActionsProps = {
  records: DailyRecordRow[];
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
  onRecordsChange: () => void;
};

export function BatchActions({
  records,
  selectedIds,
  onSelectedIdsChange,
  onRecordsChange
}: BatchActionsProps) {
  const [isPending, startTransition] = useTransition();

  const selectAll = () => {
    if (selectedIds.size === records.length) {
      onSelectedIdsChange(new Set());
    } else {
      onSelectedIdsChange(new Set(records.map((r) => r.id)));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      alert("請選擇要刪除的記錄");
      return;
    }

    if (!confirm(`確定要刪除 ${selectedIds.size} 筆記錄嗎？此操作無法復原。`)) {
      return;
    }

    startTransition(async () => {
      const result = await batchDeleteRecordsAction(Array.from(selectedIds));
      if (result.success) {
        onSelectedIdsChange(new Set());
        onRecordsChange();
        alert("記錄已成功刪除");
      } else {
        alert(result.error || "刪除失敗");
      }
    });
  };

  if (records.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 sm:p-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedIds.size === records.length && records.length > 0}
          onChange={selectAll}
          className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-700"
        />
        <span className="text-xs text-slate-700 dark:text-slate-300 sm:text-sm">
          全選 ({selectedIds.size} / {records.length})
        </span>
      </div>

      {selectedIds.size > 0 && (
        <>
          <button
            type="button"
            onClick={handleBatchDelete}
            disabled={isPending}
            className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 sm:px-4 sm:text-sm"
          >
            {isPending ? "刪除中..." : `刪除選取 (${selectedIds.size})`}
          </button>
          <button
            type="button"
            onClick={() => onSelectedIdsChange(new Set())}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 sm:px-4 sm:text-sm"
          >
            取消選取
          </button>
        </>
      )}
    </div>
  );
}

