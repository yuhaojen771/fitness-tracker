"use client";

import { createContext, useContext, useEffect, useState } from "react";

type FontSize = "normal" | "large";

type FontSizeContextType = {
  fontSize: FontSize;
  toggleFontSize: () => void;
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

/**
 * Font Size Provider：管理字體大小狀態
 * - 使用 localStorage 持久化用戶選擇
 * - 支持正常和大字體兩種模式
 */
export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [mounted, setMounted] = useState(false);

  // 應用到 HTML 元素
  function applyFontSize(newFontSize: FontSize) {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (newFontSize === "large") {
        root.classList.add("font-large");
      } else {
        root.classList.remove("font-large");
      }
    }
  }

  useEffect(() => {
    setMounted(true);

    // 從 localStorage 讀取用戶選擇
    const savedFontSize = localStorage.getItem("fontSize") as FontSize | null;

    if (savedFontSize && (savedFontSize === "normal" || savedFontSize === "large")) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    } else {
      // 預設使用正常字體
      setFontSize("normal");
      applyFontSize("normal");
    }
  }, []);

  // 切換字體大小
  function toggleFontSize() {
    const newFontSize = fontSize === "normal" ? "large" : "normal";
    setFontSize(newFontSize);
    applyFontSize(newFontSize);
    if (typeof window !== "undefined") {
      localStorage.setItem("fontSize", newFontSize);
    }
  }

  // 始終提供 Context
  return (
    <FontSizeContext.Provider value={{ fontSize, toggleFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

/**
 * Hook：使用字體大小上下文
 */
export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
}

