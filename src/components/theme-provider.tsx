"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider：管理深色模式狀態
 * - 使用 localStorage 持久化用戶選擇
 * - 監聽系統偏好設定（首次載入時）
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // 應用主題到 HTML 元素
  function applyTheme(newTheme: Theme) {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }

  useEffect(() => {
    // 立即應用主題，避免閃爍
    // 從 localStorage 讀取用戶選擇（同步讀取，避免閃爍）
    let initialTheme: Theme = "light";
    
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        initialTheme = savedTheme;
      } else {
        // 如果沒有保存的選擇，使用系統偏好
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        initialTheme = prefersDark ? "dark" : "light";
      }
      
      // 立即應用主題
      applyTheme(initialTheme);
      setTheme(initialTheme);
    }
    
    setMounted(true);
  }, []);

  // 切換主題
  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  }

  // 始終提供 Context，避免 useTheme 錯誤
  // 在未 mounted 時使用預設的 "light" theme
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook：使用主題上下文
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

