"use client";

import { useState } from "react";

type PremiumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: "monthly" | "yearly") => void;
};

/**
 * Premium 訂閱模態框
 * - 顯示升級至 Premium 的文案和功能說明
 * - 提供模擬的訂閱按鈕（實際應用中應串接真實金流）
 */
export function PremiumModal({ isOpen, onClose, onUpgrade }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onUpgrade(selectedPlan);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-4 shadow-xl dark:bg-slate-800 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold dark:text-slate-100 sm:text-xl break-words flex-1 min-w-0">
            升級至 Premium 會員
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="關閉"
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 break-words">
            升級至 Premium 以解鎖更多功能與更完整的健康洞察：
          </p>

          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 shrink-0 mt-0.5">📊</span>
              <span className="break-words flex-1 min-w-0">深度趨勢分析：包含 90 天/年度長效圖表及飲食關鍵字關聯分析</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 shrink-0 mt-0.5">💾</span>
              <span className="break-words flex-1 min-w-0">數據匯出（CSV / JSON）與備份，方便另存與分析</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 shrink-0 mt-0.5">🔒</span>
              <span className="break-words flex-1 min-w-0">完整歷史記錄與長期體重趨勢圖永久保存（免費用戶僅可查看最近 7 天記錄）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
              <span className="break-words flex-1 min-w-0">無限制歷史記錄存取</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
              <span className="break-words flex-1 min-w-0">優先客戶支援</span>
            </li>
          </ul>

          {/* 價格方案（以 USD 為主，附上大約台幣換算說明） */}
          <div className="space-y-3 rounded-lg bg-slate-50 p-3 sm:p-4 dark:bg-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-words">
              選擇訂閱方案：
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* 月繳 */}
              <button
                type="button"
                onClick={() => setSelectedPlan("monthly")}
                className={`flex-1 rounded-md border-2 p-3 sm:p-4 text-left transition-all min-w-0 ${
                  selectedPlan === "monthly"
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/30"
                    : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className={`text-xs font-semibold break-words ${
                    selectedPlan === "monthly"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}>
                    月繳方案
                  </p>
                  {selectedPlan === "monthly" && (
                    <span className="text-emerald-600 dark:text-emerald-400 shrink-0">✓</span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-1 flex-wrap">
                  <span className={`text-xl sm:text-2xl font-bold break-words ${
                    selectedPlan === "monthly"
                      ? "text-emerald-900 dark:text-emerald-100"
                      : "text-slate-900 dark:text-slate-100"
                  }`}>
                    US$3.99
                  </span>
                  <span className={`text-xs break-words ${
                    selectedPlan === "monthly"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}>
                    / 月
                  </span>
                </div>
                <p className={`mt-2 text-xs break-words leading-relaxed ${
                  selectedPlan === "monthly"
                    ? "text-emerald-800 dark:text-emerald-200"
                    : "text-slate-500 dark:text-slate-400"
                }`}>
                  約 NT$120 / 月，隨時可取消，無綁約。
                </p>
              </button>

              {/* 年繳 */}
              <button
                type="button"
                onClick={() => setSelectedPlan("yearly")}
                className={`flex-1 rounded-md border-2 p-3 sm:p-4 text-left transition-all min-w-0 ${
                  selectedPlan === "yearly"
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/30"
                    : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-xs font-semibold break-words ${
                      selectedPlan === "yearly"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-500 dark:text-slate-400"
                    }`}>
                      年繳方案
                    </p>
                    <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-emerald-600 shrink-0 whitespace-nowrap">
                      推薦
                    </span>
                  </div>
                  {selectedPlan === "yearly" && (
                    <span className="text-emerald-600 dark:text-emerald-400 shrink-0">✓</span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-1 flex-wrap">
                  <span className={`text-xl sm:text-2xl font-bold break-words ${
                    selectedPlan === "yearly"
                      ? "text-emerald-900 dark:text-emerald-100"
                      : "text-slate-900 dark:text-slate-100"
                  }`}>
                    US$39.99
                  </span>
                  <span className={`text-xs break-words ${
                    selectedPlan === "yearly"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}>
                    / 年
                  </span>
                </div>
                <p className={`mt-2 text-xs break-words leading-relaxed ${
                  selectedPlan === "yearly"
                    ? "text-emerald-800 dark:text-emerald-200"
                    : "text-slate-500 dark:text-slate-400"
                }`}>
                  約 NT$1,200 / 年，較月繳省下約 16%，一次解鎖一年完整紀錄。
                </p>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              稍後再說
            </button>
            {/* 
              【手動金流第一階段實作】
              此按鈕導向外部付款連結（例如 PayPal Checkout Link）
              實際應用中應替換為真實的付款連結
              付款完成後，用戶需手動更新 subscription_end_date 或透過 webhook 自動更新
            */}
            <a
              href={
                selectedPlan === "monthly"
                  ? process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_LINK || "#"
                  : process.env.NEXT_PUBLIC_PAYPAL_YEARLY_LINK || "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-md bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600 whitespace-nowrap"
              onClick={(e) => {
                // 如果沒有設定付款連結，使用模擬升級
                if (
                  !process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_LINK &&
                  !process.env.NEXT_PUBLIC_PAYPAL_YEARLY_LINK
                ) {
                  e.preventDefault();
                  handleUpgrade();
                }
              }}
            >
              立即訂閱 {selectedPlan === "monthly" ? "（月繳）" : "（年繳）"}
            </a>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 break-words leading-relaxed">
            💳 付款完成後，您的 Premium 會員資格將自動啟用。如遇問題，請聯繫客服。
          </p>
        </div>
      </div>
    </div>
  );
}

