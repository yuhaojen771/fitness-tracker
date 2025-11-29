"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 取得當前用戶 ID
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onUpgrade(selectedPlan);
  };

  // 處理 PayPal 付款（動態生成包含用戶 ID 的連結）
  const handlePayPalPayment = async () => {
    const hasTestUrl = !!process.env.NEXT_PUBLIC_PAYPAL_TEST_URL;
    const hasLiveUrl = !!process.env.NEXT_PUBLIC_PAYPAL_LIVE_URL;
    const hasOldMonthly = !!process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_LINK;
    const hasOldYearly = !!process.env.NEXT_PUBLIC_PAYPAL_YEARLY_LINK;
    const hasAnyPaypalUrl = hasTestUrl || hasLiveUrl || hasOldMonthly || hasOldYearly;
    
    if (!hasAnyPaypalUrl) {
      return; // 沒有設定 PayPal，顯示手動收款資訊
    }
    
    if (!userId) {
      alert("無法取得用戶資訊，請重新登入");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 使用 API 動態生成包含用戶 ID 的 PayPal 連結
      const response = await fetch("/api/paypal/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        // 跳轉到 PayPal 付款頁面
        window.location.href = data.url;
      } else {
        alert(data.error || "無法建立付款連結，請稍後再試");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("PayPal payment error:", error);
      alert("付款處理發生錯誤，請稍後再試");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-4 shadow-xl dark:bg-slate-800 sm:p-6 premium-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 sm:mb-5 flex items-start justify-between gap-3 sm:gap-4">
          <h2 className="text-lg font-semibold dark:text-slate-100 sm:text-xl break-words flex-1 min-w-0 leading-tight">
            升級至 Premium 會員
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 -mt-1 -mr-1"
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
          <p className="text-slate-600 dark:text-slate-400 break-words leading-relaxed">
            升級至 Premium 以解鎖更多功能與更完整的健康洞察：
          </p>

          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-500 shrink-0 mt-0.5 text-base">📊</span>
              <span className="break-words flex-1 min-w-0 leading-relaxed">深度趨勢分析：包含 90 天/年度長效圖表及飲食關鍵字關聯分析</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-500 shrink-0 mt-0.5 text-base">💾</span>
              <span className="break-words flex-1 min-w-0 leading-relaxed">數據匯出（CSV / JSON）與備份，方便另存與分析</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-500 shrink-0 mt-0.5 text-base">🔒</span>
              <span className="break-words flex-1 min-w-0 leading-relaxed">完整歷史記錄與長期體重趨勢圖永久保存（免費用戶僅可查看最近 7 天記錄）</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-500 shrink-0 mt-0.5 text-base">✓</span>
              <span className="break-words flex-1 min-w-0 leading-relaxed">無限制歷史記錄存取</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-500 shrink-0 mt-0.5 text-base">✓</span>
              <span className="break-words flex-1 min-w-0 leading-relaxed">優先客戶支援</span>
            </li>
          </ul>

          {/* 價格方案（以 USD 為主，附上大約台幣換算說明） */}
          <div className="space-y-3 rounded-lg bg-slate-50 p-3 sm:p-4 dark:bg-slate-700 premium-plan-section">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-words mb-1">
              選擇訂閱方案：
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* 月繳 */}
              <button
                type="button"
                onClick={() => setSelectedPlan("monthly")}
                className={`flex-1 rounded-md border-2 p-3 sm:p-4 text-left transition-all min-w-0 premium-plan-card ${
                  selectedPlan === "monthly"
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/30"
                    : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <p className={`text-xs font-semibold break-words ${
                    selectedPlan === "monthly"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}>
                    月繳方案
                  </p>
                  {selectedPlan === "monthly" && (
                    <span className="text-emerald-600 dark:text-emerald-400 shrink-0 text-base">✓</span>
                  )}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
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
                <p className={`mt-2.5 text-xs break-words leading-relaxed ${
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
                className={`flex-1 rounded-md border-2 p-3 sm:p-4 text-left transition-all min-w-0 premium-plan-card ${
                  selectedPlan === "yearly"
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/30"
                    : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
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
                    <span className="text-emerald-600 dark:text-emerald-400 shrink-0 text-base">✓</span>
                  )}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
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
                <p className={`mt-2.5 text-xs break-words leading-relaxed ${
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
              【PayPal 金流整合】
              PayPal 連結選擇邏輯：
              - 如果設定了 NEXT_PUBLIC_PAYPAL_LIVE_URL，優先使用正式連結（可用於所有環境）
              - 如果未設定正式連結：
                * 開發環境（development）：使用 NEXT_PUBLIC_PAYPAL_TEST_URL（沙盒環境）
                * 正式環境（production）：使用 NEXT_PUBLIC_PAYPAL_LIVE_URL（正式環境）
              - 如果都未設定，回退到舊的月繳/年繳連結（向後兼容）
              
              付款完成後，用戶需手動更新 Supabase 中的 is_premium 欄位或透過 webhook 自動更新
            */}
            <button
              type="button"
              onClick={handlePayPalPayment}
              disabled={isLoading}
              className="flex-1 rounded-md bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600 whitespace-nowrap"
            >
              {isLoading ? "處理中..." : `立即訂閱 ${selectedPlan === "monthly" ? "（月繳）" : "（年繳）"}`}
            </button>
          </div>

          {/* 如果沒有設定付款連結，顯示手動收款資訊 */}
          {(() => {
            const hasTestUrl = !!process.env.NEXT_PUBLIC_PAYPAL_TEST_URL;
            const hasLiveUrl = !!process.env.NEXT_PUBLIC_PAYPAL_LIVE_URL;
            const hasOldMonthly = !!process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_LINK;
            const hasOldYearly = !!process.env.NEXT_PUBLIC_PAYPAL_YEARLY_LINK;
            const hasStripeKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
            const hasAnyPaymentUrl = hasTestUrl || hasLiveUrl || hasOldMonthly || hasOldYearly || hasStripeKey;
            const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "客服信箱";
            
            if (!hasAnyPaymentUrl) {
              const monthlyPrice = selectedPlan === "monthly" ? "NT$ 120" : "NT$ 1,200";
              const yearlyPrice = selectedPlan === "yearly" ? "NT$ 1,200" : "NT$ 120";
              const currentPrice = selectedPlan === "monthly" ? monthlyPrice : yearlyPrice;
              
              return (
                <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
                  <h3 className="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
                    💳 付款方式
                  </h3>
                  <div className="mb-3 rounded-md bg-amber-100 p-2 dark:bg-amber-900/30">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                      訂閱方案：{selectedPlan === "monthly" ? "月繳方案" : "年繳方案"}
                    </p>
                    <p className="mt-1 text-sm font-bold text-amber-900 dark:text-amber-100">
                      付款金額：{currentPrice}
                    </p>
                  </div>
                  <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-200">
                    請透過以下方式完成付款：
                  </p>
                  <ul className="mb-3 ml-4 list-disc space-y-1 text-xs text-amber-800 dark:text-amber-200">
                    <li>銀行轉帳：請聯繫客服取得帳號資訊</li>
                    <li>ATM 轉帳：請聯繫客服取得帳號資訊</li>
                    <li>其他付款方式：請聯繫客服</li>
                  </ul>
                  <div className="mb-2 rounded-md border border-amber-200 bg-white p-2 dark:border-amber-600 dark:bg-amber-900/10">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                      📧 客服聯絡方式
                    </p>
                    <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                      Email：{supportEmail}
                    </p>
                    <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                      請在付款時備註您的 Email 或用戶 ID，以便我們快速為您啟用 Premium 功能。
                    </p>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ 付款完成後，請提供付款證明（轉帳截圖或收據），我們會在 24 小時內為您啟用 Premium 功能。
                  </p>
                  <p className="mt-2 text-[10px] text-amber-500 dark:text-amber-500">
                    💡 提示：可在環境變數中設定 <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">NEXT_PUBLIC_SUPPORT_EMAIL</code> 來自訂客服信箱
                  </p>
                </div>
              );
            }
            
            return (
              <p className="text-xs text-slate-500 dark:text-slate-400 break-words leading-relaxed mt-2">
                💳 付款完成後，您的 Premium 會員資格將自動啟用。如遇問題，請聯繫客服。
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

