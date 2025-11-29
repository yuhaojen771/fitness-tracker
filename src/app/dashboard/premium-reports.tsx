"use client";

import type { DailyRecordRow } from "@/types/supabase";

type PremiumReportsProps = {
  records: DailyRecordRow[];
};

/**
 * Premium 進階報告組件
 * - 顯示詳細的健康數據分析
 * - 僅 Premium 用戶可見
 */
export function PremiumReports({ records }: PremiumReportsProps) {
  const weightRecords = records
    .filter((r) => r.weight !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (weightRecords.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="mb-4 text-base font-semibold dark:text-slate-100 sm:text-lg">
          <span className="mr-2 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Premium
          </span>
          進階報告
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400">
          需要至少一筆體重記錄才能生成進階報告
        </p>
      </div>
    );
  }

  // 計算進階統計
  const weights = weightRecords.map((r) => r.weight!);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

  // 計算每週平均體重變化
  const weeklyChanges: number[] = [];
  for (let i = 7; i < weightRecords.length; i += 7) {
    const current = weightRecords[i].weight!;
    const previous = weightRecords[i - 7].weight!;
    weeklyChanges.push(current - previous);
  }
  const avgWeeklyChange =
    weeklyChanges.length > 0
      ? weeklyChanges.reduce((a, b) => a + b, 0) / weeklyChanges.length
      : null;

  // 計算體重穩定性（標準差）
  const variance =
    weights.reduce((sum, w) => sum + Math.pow(w - avgWeight, 2), 0) / weights.length;
  const stdDev = Math.sqrt(variance);

  // 趨勢分析
  const recentWeights = weights.slice(-7);
  const olderWeights = weights.slice(0, Math.min(7, weights.length));
  const recentAvg = recentWeights.reduce((a, b) => a + b, 0) / recentWeights.length;
  const olderAvg =
    olderWeights.length > 0
      ? olderWeights.reduce((a, b) => a + b, 0) / olderWeights.length
      : null;

  const trend =
    olderAvg !== null
      ? recentAvg > olderAvg
        ? "上升"
        : recentAvg < olderAvg
          ? "下降"
          : "穩定"
      : "數據不足";

  const trendColor =
    trend === "下降"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "上升"
        ? "text-red-600 dark:text-red-400"
        : "text-slate-600 dark:text-slate-400";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-100 sm:text-lg">
            <span className="mr-2 rounded-full bg-emerald-200 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
              Premium
            </span>
            進階健康分析報告
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 體重範圍分析 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
              體重範圍分析
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-300">最高體重：</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {maxWeight.toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-300">平均體重：</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {avgWeight.toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-300">最低體重：</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {minWeight.toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-300">體重範圍：</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {(maxWeight - minWeight).toFixed(1)} kg
                </span>
              </div>
            </div>
          </div>

          {/* 趨勢分析 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">趨勢分析</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-300">近期趨勢：</span>
                <span className={`font-medium ${trendColor}`}>{trend}</span>
              </div>
              {avgWeeklyChange !== null && (
                <div className="flex justify-between">
                  <span className="text-emerald-700 dark:text-emerald-300">
                    平均每週變化：
                  </span>
                  <span
                    className={`font-medium ${
                      avgWeeklyChange < 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {avgWeeklyChange > 0 ? "+" : ""}
                    {avgWeeklyChange.toFixed(2)} kg/週
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-300">體重穩定性：</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {stdDev < 1 ? "非常穩定" : stdDev < 2 ? "穩定" : "波動較大"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-300">標準差：</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {stdDev.toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 健康建議 */}
        <div className="mt-6 rounded-md bg-white/50 p-4 dark:bg-black/20">
          <h3 className="mb-2 font-semibold text-emerald-900 dark:text-emerald-100">
            個人化建議
          </h3>
          <ul className="space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
            {trend === "上升" && (
              <li>• 體重呈現上升趨勢，建議增加運動頻率並注意飲食控制</li>
            )}
            {trend === "下降" && (
              <li>• 體重呈現下降趨勢，請確保以健康的方式減重</li>
            )}
            {stdDev >= 2 && (
              <li>• 體重波動較大，建議保持規律的記錄習慣以追蹤變化</li>
            )}
            {avgWeeklyChange !== null && Math.abs(avgWeeklyChange) > 0.5 && (
              <li>
                • 每週變化{" "}
                {Math.abs(avgWeeklyChange).toFixed(1)} kg，建議諮詢專業人士制定更穩定的計劃
              </li>
            )}
            {trend === "穩定" && stdDev < 1 && (
              <li>• 體重維持穩定，請繼續保持現有的健康習慣</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

