"use client";

import { useState, useEffect, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { grantPremiumSubscriptionAction, getAllUsersAction } from "./actions";

type UserInfo = {
  id: string;
  email: string;
  is_premium: boolean;
  subscription_end_date: string | null;
  updated_at: string;
};

const initialState = {
  success: false,
  error: ""
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
    >
      {pending ? "處理中..." : label}
    </button>
  );
}

export function AdminClient() {
  const [state, formAction] = useFormState(grantPremiumSubscriptionAction, initialState);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isPending, startTransition] = useTransition();

  // 載入用戶列表
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const result = await getAllUsersAction();
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        console.error("Failed to load users:", result.error);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // 初始載入
  useEffect(() => {
    loadUsers();
  }, []);

  // 當訂閱開通成功後，重新載入用戶列表
  useEffect(() => {
    if (state.success) {
      loadUsers();
    }
  }, [state.success]);

  // 格式化日期顯示
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 手動開通 Premium 訂閱 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h2 className="mb-4 text-base font-semibold dark:text-slate-100 sm:text-lg">
          手動開通 Premium 訂閱
        </h2>

        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="identifier"
                required
                placeholder="輸入用戶的 Supabase User ID (UUID)"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                提示：可在 Supabase Dashboard 的 Authentication 中找到 User ID
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                訂閱方案
              </label>
              <select
                name="plan"
                defaultValue="yearly"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="yearly">年度訂閱（1 年）</option>
                <option value="monthly">月度訂閱（1 個月）</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              自訂到期日期（選填）
            </label>
            <input
              type="date"
              name="custom_end_date"
              placeholder="留空則根據訂閱方案自動計算"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              可選：留空則根據訂閱方案自動計算到期日期
            </p>
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {state.error}
            </div>
          )}

          {state.success && (
            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
              成功開通 Premium 訂閱！
            </div>
          )}

          <div className="flex justify-end">
            <SubmitButton label="開通 Premium 訂閱" />
          </div>
        </form>
      </div>

      {/* 用戶列表 */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold dark:text-slate-100 sm:text-lg">
            用戶列表
          </h2>
          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoadingUsers}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            {isLoadingUsers ? "載入中..." : "刷新"}
          </button>
        </div>

        {isLoadingUsers ? (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            載入用戶列表中...
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            目前沒有用戶
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    User ID
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    Premium 狀態
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    到期日期
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    最後更新
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 dark:border-slate-700"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {user.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {user.email || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_premium ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          免費
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(user.subscription_end_date)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(user.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



