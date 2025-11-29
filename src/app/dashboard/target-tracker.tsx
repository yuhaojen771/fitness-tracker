"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { updateTargetAction } from "./actions";
import type { ProfileRow, DailyRecordRow } from "@/types/supabase";

type TargetTrackerProps = {
  profile: ProfileRow | null;
  records: DailyRecordRow[];
};

const initialState = {
  success: false,
  error: ""
};

export function TargetTracker({ profile, records }: TargetTrackerProps) {
  const [state, formAction] = useFormState(updateTargetAction, initialState);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 計算進度
  const calculateProgress = () => {
    if (!profile?.target_weight || !profile?.starting_weight) {
      return null;
    }

    const currentWeight = records
      .filter((r) => r.weight !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weight;

    if (!currentWeight) {
      return null;
    }

    const totalChange = profile.target_weight - profile.starting_weight;
    const currentChange = currentWeight - profile.starting_weight;
    const progress = totalChange !== 0 ? (currentChange / totalChange) * 100 : 0;

    return {
      currentWeight,
      targetWeight: profile.target_weight,
      startingWeight: profile.starting_weight,
      progress: Math.min(100, Math.max(0, progress)),
      remaining: profile.target_weight - currentWeight
    };
  };

  const progress = calculateProgress();

  if (!isEditing && !profile?.target_weight) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold dark:text-slate-100 sm:text-lg">目標追蹤</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              設定體重目標以追蹤你的進度
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 sm:text-sm"
          >
            設定目標
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <h3 className="mb-4 text-base font-semibold dark:text-slate-100 sm:text-lg">設定目標</h3>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
                起始體重 (kg)
              </label>
              <input
                type="number"
                name="starting_weight"
                step="0.1"
                min="0"
                defaultValue={profile?.starting_weight?.toString() || ""}
                placeholder="例如：70"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
                起始日期
              </label>
              <input
                type="date"
                name="starting_date"
                defaultValue={profile?.starting_date || ""}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
                目標體重 (kg)
              </label>
              <input
                type="number"
                name="target_weight"
                step="0.1"
                min="0"
                defaultValue={profile?.target_weight?.toString() || ""}
                placeholder="例如：65"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
                目標日期
              </label>
              <input
                type="date"
                name="target_date"
                defaultValue={profile?.target_date || ""}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
          </div>

          {state.error && (
            <p className="text-xs text-red-600 dark:text-red-400 sm:text-sm" role="alert">
              {state.error}
            </p>
          )}

          {state.success && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 sm:text-sm">
              目標已更新！
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600 sm:text-sm"
            >
              {isPending ? "儲存中..." : "儲存目標"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (state.success) {
                  window.location.reload();
                }
              }}
              className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 sm:text-sm"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold dark:text-slate-100 sm:text-lg">目標追蹤</h3>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 sm:text-sm"
        >
          編輯
        </button>
      </div>

      {progress && (
        <div className="space-y-4">
          {/* 進度條 */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600 dark:text-slate-400">進度</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {progress.progress.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>

          {/* 統計資訊 */}
          <div className="grid grid-cols-2 gap-4 rounded-md bg-slate-50 p-3 dark:bg-slate-700/50 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">目前體重</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                {progress.currentWeight.toFixed(1)} kg
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">目標體重</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                {progress.targetWeight.toFixed(1)} kg
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">已減/增</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                {(progress.currentWeight - progress.startingWeight).toFixed(1)} kg
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">還需</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                {progress.remaining > 0 ? "+" : ""}
                {progress.remaining.toFixed(1)} kg
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

