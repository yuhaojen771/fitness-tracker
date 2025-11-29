"use client";

import { useState } from "react";
import type { DailyRecordRow, ProfileRow } from "@/types/supabase";

type WeightChartProps = {
  records: DailyRecordRow[];
  profile?: ProfileRow | null;
};

/**
 * 簡單的體重趨勢折線圖組件
 * - 使用 SVG 繪製折線圖
 * - 顯示最近 30 天的體重變化趨勢
 */
export function WeightChart({ records, profile }: WeightChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    date: string;
    weight: number;
  } | null>(null);

  if (records.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 dark:text-slate-500">
        尚無體重數據
      </div>
    );
  }

  // 圖表尺寸
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };

  // 計算體重範圍（包含目標體重）
  const weights = records.map((r) => r.weight!).filter((w) => w !== null);
  let minWeight = Math.min(...weights);
  let maxWeight = Math.max(...weights);
  
  // 如果有目標體重，將其納入範圍計算
  if (profile?.target_weight) {
    minWeight = Math.min(minWeight, profile.target_weight);
    maxWeight = Math.max(maxWeight, profile.target_weight);
  }
  
  const weightRange = maxWeight - minWeight || 1; // 避免除以零
  
  // 計算日期範圍（包含目標日期）
  const dates = records.map((r) => new Date(r.date).getTime());
  let minDate = Math.min(...dates);
  let maxDate = Math.max(...dates);
  
  // 如果有目標日期，將其納入範圍計算
  if (profile?.target_date) {
    const targetDate = new Date(profile.target_date).getTime();
    minDate = Math.min(minDate, targetDate);
    maxDate = Math.max(maxDate, targetDate);
  }
  
  const dateRange = maxDate - minDate || 1;

  // 計算 X 軸（日期）和 Y 軸（體重）的縮放比例
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 生成折線圖的點（基於日期位置，而不是索引）
  // 確保按日期排序
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const points = sortedRecords.map((record) => {
    const recordDate = new Date(record.date).getTime();
    const x = padding.left + ((recordDate - minDate) / dateRange) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      ((record.weight! - minWeight) / weightRange) * chartHeight;
    return { x, y, date: record.date, weight: record.weight! };
  });
  
  // 計算目標體重線的 Y 座標
  const targetWeightY = profile?.target_weight
    ? padding.top +
      chartHeight -
      ((profile.target_weight - minWeight) / weightRange) * chartHeight
    : null;
  
  // 計算目標日期線的 X 座標
  const targetDateX = profile?.target_date
    ? padding.left +
      ((new Date(profile.target_date).getTime() - minDate) / dateRange) * chartWidth
    : null;

  // 生成折線路徑
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // 生成 Y 軸刻度標籤（體重）
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    const value = minWeight + (weightRange / (yTicks - 1)) * i;
    return {
      value: Math.round(value * 10) / 10,
      y: padding.top + chartHeight - (i / (yTicks - 1)) * chartHeight
    };
  });

  // 生成 X 軸刻度標籤（日期）- 基於日期範圍，包含目標日期
  const xTickCount = Math.min(records.length, 7);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const dateValue = minDate + (i / (xTickCount - 1 || 1)) * dateRange;
    const date = new Date(dateValue);
    return {
      date: date.toISOString().split("T")[0],
      x: padding.left + (i / (xTickCount - 1 || 1)) * chartWidth
    };
  });

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
      >
        {/* 網格線（Y 軸） */}
        {yTickValues.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={padding.left - 10}
              y={tick.y + 4}
              textAnchor="end"
              className="text-sm fill-slate-600 dark:fill-slate-400 sm:text-xs"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* X 軸標籤 */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-sm fill-slate-600 dark:fill-slate-400 sm:text-xs"
        >
          日期
        </text>

        {/* Y 軸標籤 */}
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          className="text-sm fill-slate-600 dark:fill-slate-400 sm:text-xs"
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          體重 (kg)
        </text>

        {/* 目標體重線（水平虛線） */}
        {targetWeightY !== null && (
          <g>
            <line
              x1={padding.left}
              y1={targetWeightY}
              x2={width - padding.right}
              y2={targetWeightY}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.7}
            />
            <text
              x={width - padding.right + 5}
              y={targetWeightY + 4}
              textAnchor="start"
              className="text-xs fill-emerald-600 dark:fill-emerald-400"
              fontWeight="bold"
            >
              目標: {profile?.target_weight?.toFixed(1)} kg
            </text>
          </g>
        )}

        {/* 目標日期線（垂直虛線） */}
        {targetDateX !== null && (
          <g>
            <line
              x1={targetDateX}
              y1={padding.top}
              x2={targetDateX}
              y2={height - padding.bottom}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.7}
            />
            <text
              x={targetDateX}
              y={padding.top - 5}
              textAnchor="middle"
              className="text-xs fill-amber-600 dark:fill-amber-400"
              fontWeight="bold"
            >
              目標日期
            </text>
            <text
              x={targetDateX}
              y={height - padding.bottom + 15}
              textAnchor="middle"
              className="text-xs fill-amber-600 dark:fill-amber-400"
            >
              {profile?.target_date
                ? new Date(profile.target_date).toLocaleDateString("zh-TW", {
                    month: "short",
                    day: "numeric"
                  })
                : ""}
            </text>
          </g>
        )}

        {/* 折線 */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 數據點 */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint?.date === point.date ? 6 : 4}
              fill={hoveredPoint?.date === point.date ? "#2563eb" : "#3b82f6"}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}

        {/* 懸停提示框 */}
        {hoveredPoint && (
          <g>
            {/* 背景 */}
            <rect
              x={hoveredPoint.x - 60}
              y={hoveredPoint.y - 50}
              width={120}
              height={40}
              rx={4}
              fill="rgba(15, 23, 42, 0.9)"
              className="dark:fill-slate-800"
            />
            {/* 文字 */}
            <text
              x={hoveredPoint.x}
              y={hoveredPoint.y - 30}
              textAnchor="middle"
              className="text-sm fill-white dark:fill-slate-100 sm:text-xs"
              fontWeight="bold"
            >
              {new Date(hoveredPoint.date).toLocaleDateString("zh-TW", {
                month: "short",
                day: "numeric"
              })}
            </text>
            <text
              x={hoveredPoint.x}
              y={hoveredPoint.y - 15}
              textAnchor="middle"
              className="text-sm fill-white dark:fill-slate-100 sm:text-xs"
            >
              {hoveredPoint.weight.toFixed(1)} kg
            </text>
            {/* 指向數據點的線 */}
            <line
              x1={hoveredPoint.x}
              y1={hoveredPoint.y - 50}
              x2={hoveredPoint.x}
              y2={hoveredPoint.y}
              stroke="rgba(15, 23, 42, 0.9)"
              strokeWidth={1}
              className="dark:stroke-slate-800"
            />
          </g>
        )}

        {/* X 軸日期標籤 */}
        {xTicks.map((tick, i) => {
          const date = new Date(tick.date);
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <text
              key={i}
              x={tick.x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-sm fill-slate-600 dark:fill-slate-400 sm:text-xs"
            >
              {dateStr}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

