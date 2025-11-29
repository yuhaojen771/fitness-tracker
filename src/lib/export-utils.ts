import type { DailyRecordRow } from "@/types/supabase";

/**
 * 將記錄匯出為 CSV 格式
 */
export function exportToCSV(records: DailyRecordRow[]): string {
  const headers = ["日期", "體重 (kg)", "飲食記錄"];
  const rows = records.map((record) => {
    const date = new Date(record.date).toLocaleDateString("zh-TW");
    const weight = record.weight ? record.weight.toString() : "";
    const dietNotes = record.diet_notes ? record.diet_notes.replace(/"/g, '""') : "";
    return [date, weight, `"${dietNotes}"`];
  });

  // 使用 CRLF 作為換行，並讓後續下載時加上 UTF-8 BOM，避免在 Windows Excel 中出現亂碼
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
  return csvContent;
}

/**
 * 將記錄匯出為 JSON 格式
 */
export function exportToJSON(records: DailyRecordRow[]): string {
  const data = records.map((record) => ({
    日期: record.date,
    體重: record.weight,
    飲食記錄: record.diet_notes,
    建立時間: record.created_at
  }));
  return JSON.stringify(data, null, 2);
}

/**
 * 下載檔案
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  // 在檔案開頭加上 UTF-8 BOM，確保 Windows Excel 正確辨識編碼
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

