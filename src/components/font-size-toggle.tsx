"use client";

import { useState, useEffect } from "react";
import { useFontSize } from "./font-size-provider";

/**
 * 字體大小切換按鈕組件
 * - 顯示 A / A+ 圖示
 * - 點擊切換正常/大字體模式
 * - 避免 hydration mismatch
 */
export function FontSizeToggle() {
  const { fontSize, toggleFontSize } = useFontSize();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 避免 hydration mismatch：在未 mounted 時顯示預設圖示
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="切換字體大小"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFontSize}
      className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      aria-label={fontSize === "normal" ? "切換至大字體" : "切換至正常字體"}
      title={fontSize === "normal" ? "切換至大字體" : "切換至正常字體"}
    >
      <span className="flex items-center gap-1">
        <span className="text-sm font-semibold">A</span>
        {fontSize === "normal" && (
          <span className="text-xs font-bold opacity-60">+</span>
        )}
        {fontSize === "large" && (
          <svg
            className="h-3 w-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

