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
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "ecpay">("ecpay"); // 預設使用綠界（台灣）
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [ecpayFormData, setEcpayFormData] = useState<Record<string, string> | null>(null);
  const [ecpayPaymentUrl, setEcpayPaymentUrl] = useState<string | null>(null);

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

  // 處理綠界（ECPay）付款
  const handleECPayPayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      alert("無法取得用戶資訊，請重新登入");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/ecpay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || `伺服器錯誤 (${response.status})`;
        console.error("ECPay API error:", {
          status: response.status,
          error: data.error,
          data: data
        });
        alert(`無法建立付款連結：${errorMessage}\n\n請確認已設定綠界環境變數。`);
        setIsLoading(false);
        return;
      }
      
      if (data.paymentUrl && data.orderData) {
        // 設定表單資料並自動提交
        setEcpayPaymentUrl(data.paymentUrl);
        setEcpayFormData(data.orderData);
        setIsLoading(false);
        
        // 建立隱藏表單並自動提交
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.paymentUrl;
        
        Object.keys(data.orderData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.orderData[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        console.error("ECPay API response missing data:", data);
        alert(data.error || "無法建立付款連結，請稍後再試");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("ECPay payment error:", error);
      const errorMessage = error.message || "未知錯誤";
      alert(`付款處理發生錯誤：${errorMessage}\n\n請檢查網路連線或稍後再試。`);
      setIsLoading(false);
    }
  };

  // 處理 PayPal 付款（動態生成包含用戶 ID 的連結）
  const handlePayPalPayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      
      if (!response.ok) {
        // 顯示 API 返回的具體錯誤訊息
        const errorMessage = data.error || `伺服器錯誤 (${response.status})`;
        console.error("PayPal API error:", {
          status: response.status,
          error: data.error,
          data: data
        });
        alert(`無法建立付款連結：${errorMessage}\n\n請確認已設定 PayPal 環境變數。`);
        setIsLoading(false);
        return;
      }
      
      if (data.url) {
        // 跳轉到 PayPal 付款頁面
        window.location.href = data.url;
      } else {
        console.error("PayPal API response missing URL:", data);
        alert(data.error || "無法建立付款連結，請稍後再試");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("PayPal payment error:", error);
      const errorMessage = error.message || "未知錯誤";
      alert(`付款處理發生錯誤：${errorMessage}\n\n請檢查網路連線或稍後再試。`);
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

          {/* 付款方式選擇 */}
          <div className="space-y-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              選擇付款方式：
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("ecpay")}
                className={`flex-1 rounded-md border-2 px-3 py-2 text-xs font-medium transition-all ${
                  paymentMethod === "ecpay"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                💳 綠界金流（台灣）
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("paypal")}
                className={`flex-1 rounded-md border-2 px-3 py-2 text-xs font-medium transition-all ${
                  paymentMethod === "paypal"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                🌐 PayPal（國際）
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
            <button
              type="button"
              onClick={paymentMethod === "ecpay" ? handleECPayPayment : handlePayPalPayment}
              disabled={isLoading}
              className="flex-1 rounded-md bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600 whitespace-nowrap"
            >
              {isLoading ? "處理中..." : `立即訂閱 ${selectedPlan === "monthly" ? "（月繳）" : "（年繳）"}`}
            </button>
          </div>

          {/* 條款同意聲明 */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            付款即表示您同意{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              服務條款
            </a>
            、{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              隱私權政策
            </a>
            {" "}與{" "}
            <a
              href="/refund"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              退換貨政策
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

