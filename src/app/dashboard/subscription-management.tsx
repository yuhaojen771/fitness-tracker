"use client";

import { useState, useEffect, useCallback } from "react";
import { cancelSubscriptionAction, upgradeToPremiumAction, resetSubscriptionAction } from "./actions";
import { isPremiumActive, getDaysRemaining } from "@/lib/subscription-utils";
import type { ProfileRow } from "@/types/supabase";

type SubscriptionManagementProps = {
  profile: ProfileRow | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

/**
 * 訂閱管理模態框
 * - 顯示訂閱狀態和到期日期
 * - 提供取消訂閱/停止提醒功能
 */
export function SubscriptionManagement({
  profile,
  isOpen,
  onClose,
  onUpdate
}: SubscriptionManagementProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 檢查是否為開發模式（用於模擬訂閱）
  // 在客戶端組件中，我們檢查 hostname 或 localStorage
  const [isDevelopment, setIsDevelopment] = useState(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
      const testMode = window.localStorage.getItem("enableTestMode") === "true";
      return isLocalhost || testMode;
    }
    return false;
  });

  // 檢查測試模式的函數（提取出來以便重用）
  const checkTestMode = useCallback(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
      const testMode = window.localStorage.getItem("enableTestMode") === "true";
      const newIsDev = isLocalhost || testMode;
      setIsDevelopment(newIsDev);
      return newIsDev;
    }
    return false;
  }, []);

  // 監聽 localStorage 變化，以便在設置 enableTestMode 後立即更新
  useEffect(() => {
    // 模態框打開時立即檢查一次
    if (isOpen) {
      checkTestMode();
    }

    // 監聽 storage 事件（當其他標籤頁修改 localStorage 時）
    window.addEventListener("storage", checkTestMode);

    // 當模態框打開時，頻繁檢查（用於檢測同一頁面內的 localStorage 變化）
    const interval = isOpen ? setInterval(checkTestMode, 500) : null;

    return () => {
      window.removeEventListener("storage", checkTestMode);
      if (interval) clearInterval(interval);
    };
  }, [isOpen, checkTestMode]); // 當模態框打開/關閉時重新設置監聽器

  // 當模態框打開時，立即檢查測試模式狀態
  useEffect(() => {
    if (isOpen) {
      checkTestMode();
    }
  }, [isOpen, checkTestMode]);

  if (!isOpen) return null;

  // 使用工具函數判斷 premium 狀態（基於 subscription_end_date）
  // 這樣取消訂閱後，premium 功能仍會保留至到期日
  const isActive = isPremiumActive(profile);
  const subscriptionEndDate = profile?.subscription_end_date
    ? new Date(profile.subscription_end_date)
    : null;
  
  // 判斷是否已取消訂閱（is_premium 為 false 但 subscription_end_date 還沒到期）
  const isCancelled = profile?.is_premium === false && isActive;

  const handleCancel = async () => {
    if (!confirm("確定要取消訂閱嗎？取消後將不會自動續訂，但 Premium 功能會保留至到期日。")) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      const result = await cancelSubscriptionAction();
      if (result.success) {
        onUpdate();
        onClose();
      } else {
        setError(result.error || "取消訂閱失敗，請稍後再試");
      }
    } catch (err) {
      setError("發生錯誤，請稍後再試");
    } finally {
      setIsCancelling(false);
    }
  };

  // 模擬訂閱功能（僅開發模式）
  const handleSimulateSubscription = async (plan: "monthly" | "yearly") => {
    if (!confirm(`確定要模擬 ${plan === "monthly" ? "月繳" : "年繳"} 訂閱嗎？這將啟用 Premium 功能用於測試。`)) {
      return;
    }

    setIsSimulating(true);
    setError(null);

    try {
      const result = await upgradeToPremiumAction(plan);
      if (result.success) {
        onUpdate();
        onClose();
      } else {
        setError(result.error || "模擬訂閱失敗，請稍後再試");
      }
    } catch (err) {
      setError("發生錯誤，請稍後再試");
    } finally {
      setIsSimulating(false);
    }
  };

  // 重設訂閱狀態（僅開發模式）
  const handleResetSubscription = async () => {
    if (!confirm("確定要重設訂閱狀態嗎？這將完全恢復成未訂閱狀態，所有 Premium 功能將立即停止。")) {
      return;
    }

    setIsResetting(true);
    setError(null);

    try {
      const result = await resetSubscriptionAction();
      if (result.success) {
        onUpdate();
        onClose();
      } else {
        setError(result.error || "重設失敗，請稍後再試");
      }
    } catch (err) {
      setError("發生錯誤，請稍後再試");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl dark:bg-slate-800 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-slate-100 sm:text-xl">
            管理訂閱
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <svg
              className="h-5 w-5"
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
          {/* 非 Premium 用戶的模擬訂閱選項（僅開發模式） */}
          {/* 在開發模式下，即使 profile 為 null 也顯示模擬選項 */}
          {isDevelopment && !isActive && (
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  🧪 開發模式：模擬訂閱
                </h3>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                  {profile 
                    ? "您目前不是 Premium 會員。在開發模式下，您可以模擬訂閱來測試 Premium 功能。"
                    : "尚未建立用戶資料。點擊下方按鈕將自動建立資料並啟用 Premium 功能。"}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleSimulateSubscription("monthly")}
                  disabled={isSimulating}
                  className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                  {isSimulating ? "處理中..." : "模擬月繳訂閱"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateSubscription("yearly")}
                  disabled={isSimulating}
                  className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                  {isSimulating ? "處理中..." : "模擬年繳訂閱"}
                </button>
              </div>
            </div>
          )}

          {/* 重設訂閱按鈕（僅開發模式，當有訂閱記錄時顯示） */}
          {isDevelopment && (isActive || profile?.subscription_end_date) && (
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                  🔄 開發模式：重設訂閱
                </h3>
                <p className="mt-1 text-xs text-red-800 dark:text-red-200">
                  完全恢復成未訂閱狀態，清除所有訂閱記錄和 Premium 功能。
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetSubscription}
                disabled={isResetting}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600"
              >
                {isResetting ? "處理中..." : "重設訂閱狀態"}
              </button>
            </div>
          )}
          
          {/* 如果不是開發模式，顯示提示 */}
          {!isDevelopment && !isActive && (
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  🧪 啟用測試模式
                </h3>
                <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">
                  如需測試 Premium 功能，請按照以下步驟：
                </p>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    步驟 1：開啟瀏覽器控制台（F12 或右鍵 → 檢查）
                  </p>
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    步驟 2：在控制台執行以下命令：
                  </p>
                  <code className="mt-1 block rounded bg-blue-100 p-2 text-xs dark:bg-blue-800 font-mono">
                    localStorage.setItem('enableTestMode', 'true')
                  </code>
                </div>
                {/* 顯示當前測試模式狀態 */}
                <div className="rounded bg-blue-100 p-2 text-xs dark:bg-blue-800">
                  <p className="text-blue-900 dark:text-blue-100">
                    當前狀態：{typeof window !== "undefined" && window.localStorage.getItem("enableTestMode") === "true" 
                      ? "✅ 測試模式已啟用" 
                      : "❌ 測試模式未啟用"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // 設置 localStorage
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem("enableTestMode", "true");
                        // 等待一小段時間後再檢查，確保設置完成
                        setTimeout(() => {
                          checkTestMode();
                        }, 100);
                      }
                    }}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    自動設置並刷新
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // 強制重新檢查測試模式
                      checkTestMode();
                    }}
                    className="flex-1 rounded-md border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  >
                    🔄 手動刷新狀態
                  </button>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 提示：如果您已在控制台執行了命令，請點擊「手動刷新狀態」按鈕，或者重新載入頁面。
                </p>
              </div>
            </div>
          )}

          {/* 訂閱狀態 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                訂閱狀態
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-400"
                }`}
              >
                {isActive ? "✓ 有效" : "已過期"}
              </span>
            </div>
            {profile ? (
              subscriptionEndDate ? (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    到期日期：{" "}
                    {subscriptionEndDate.toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                  {isActive && subscriptionEndDate && (
                    <p className="mt-1 text-xs">
                      剩餘天數：{" "}
                      {getDaysRemaining(profile.subscription_end_date) ?? 0}{" "}
                      天
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>目前沒有有效的訂閱</p>
                  {!isDevelopment && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      請前往 Premium 頁面訂閱以啟用 Premium 功能
                    </p>
                  )}
                </div>
              )
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p>尚未建立用戶資料</p>
                {isDevelopment && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    點擊上方「模擬訂閱」按鈕將自動建立用戶資料並啟用 Premium
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 取消訂閱按鈕（僅當 is_premium 為 true 時顯示） */}
          {isActive && profile?.is_premium && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                {isCancelling ? "處理中..." : "取消訂閱 / 停止提醒"}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                取消後將不會自動續訂，但 Premium 功能會保留至到期日。到期後將自動停止 Premium 功能。
              </p>
            </div>
          )}

          {/* 續訂按鈕（已取消但還沒到期） */}
          {isCancelled && (
            <div className="space-y-2">
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
                <p className="mb-3 text-sm text-amber-900 dark:text-amber-100">
                  ⚠️ 您的訂閱已取消，但 Premium 功能仍可使用至到期日。
                </p>
                {isDevelopment ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleSimulateSubscription("monthly")}
                      disabled={isSimulating}
                      className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60 dark:bg-amber-700 dark:hover:bg-amber-600"
                    >
                      {isSimulating ? "處理中..." : "續訂（模擬月繳）"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateSubscription("yearly")}
                      disabled={isSimulating}
                      className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60 dark:bg-amber-700 dark:hover:bg-amber-600"
                    >
                      {isSimulating ? "處理中..." : "續訂（模擬年繳）"}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    如需續訂，請前往 Premium 頁面重新訂閱。
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

