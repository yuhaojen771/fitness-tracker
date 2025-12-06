"use client";

import { useState } from "react";
import { calculateBMI, analyzeBMI, cmToMeters, type BMIAnalysis } from "@/lib/bmi-utils";

export function BmiCalculatorClient() {
  const [heightUnit, setHeightUnit] = useState<"cm" | "m">("cm");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const heightValue = parseFloat(height);
  const weightValue = parseFloat(weight);

  // 轉換身高為公尺
  const heightInMeters = heightUnit === "cm" ? cmToMeters(heightValue) : heightValue;

  // 計算 BMI 和分析
  let bmiAnalysis: BMIAnalysis | null = null;
  if (heightInMeters > 0 && weightValue > 0) {
    const bmi = calculateBMI(weightValue, heightInMeters);
    bmiAnalysis = analyzeBMI(bmi);
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200",
      emerald:
        "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200",
      yellow:
        "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200",
      red: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30 text-red-900 dark:text-red-200"
    };
    return colors[color] || colors.emerald;
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold dark:text-slate-100 sm:text-2xl">BMI 計算機</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          輸入身高與體重即可快速取得 BMI 值與健康分析。
        </p>
      </div>

      <div className="grid gap-4">
        {/* 身高單位選擇 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            身高單位
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setHeightUnit("cm");
                setHeight("");
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                heightUnit === "cm"
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              公分 (cm)
            </button>
            <button
              type="button"
              onClick={() => {
                setHeightUnit("m");
                setHeight("");
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                heightUnit === "m"
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              公尺 (m)
            </button>
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            身高（{heightUnit === "cm" ? "公分" : "公尺"}）
          </span>
          <input
            type="number"
            step={heightUnit === "cm" ? "1" : "0.01"}
            min="0"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            placeholder={heightUnit === "cm" ? "例如：170" : "例如：1.70"}
            className="w-full rounded-md border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">體重（公斤）</span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder="例如：65.5"
            className="w-full rounded-md border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </label>

        {/* BMI 結果 */}
        {bmiAnalysis && (
          <div className={`rounded-md border p-4 sm:p-6 ${getColorClasses(bmiAnalysis.color)}`}>
            <div className="mb-4 space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-2xl font-bold sm:text-3xl">
                  BMI：{bmiAnalysis.bmi.toFixed(1)}
                </p>
                <span className="rounded-full bg-white/50 px-2 py-1 text-xs font-medium dark:bg-black/20 sm:px-3 sm:text-sm">
                  {bmiAnalysis.categoryName}
                </span>
              </div>
              <p className="text-xs opacity-90 sm:text-sm">{bmiAnalysis.description}</p>
            </div>

            <div className="mt-4 border-t border-current/20 pt-4">
              <p className="mb-2 text-xs font-semibold sm:text-sm">健康建議：</p>
              <ul className="space-y-1 text-xs sm:text-sm">
                {bmiAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* BMI 範圍參考 */}
            <div className="mt-4 rounded-md bg-white/50 p-2 text-xs dark:bg-black/20 sm:p-3">
              <p className="mb-1 font-semibold">BMI 範圍參考：</p>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <span>過輕：&lt; 18.5</span>
                <span>正常：18.5 - 24</span>
                <span>過重：24 - 27</span>
                <span>肥胖：≥ 27</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}




