import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FontSizeProvider } from "@/components/font-size-provider";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FeedbackButton } from "@/components/feedback-button";

export const metadata: Metadata = {
  metadataBase: new URL("https://fitness-tracker.example"), // 部署時可改成正式網域
  title: {
    default: "Fitness Tracker 個人健康數據追蹤器",
    template: "%s | Fitness Tracker"
  },
  description:
    "Fitness Tracker 幫你記錄每日體重與飲食、分析體重趨勢，並提供 BMI 計算與進階健康報告，是適合華人使用的簡單健康管理工具。",
  keywords: [
    "健康管理",
    "體重紀錄",
    "飲食紀錄",
    "BMI 計算機",
    "減重",
    "健身",
    "健康數據追蹤"
  ],
  openGraph: {
    title: "Fitness Tracker 個人健康數據追蹤器",
    description:
      "記錄體重與飲食、查看體重趨勢，並透過 BMI 計算機快速了解自己的健康狀態。",
    type: "website",
    locale: "zh_TW"
  },
  twitter: {
    card: "summary",
    title: "Fitness Tracker 個人健康數據追蹤器",
    description:
      "簡單好用的體重與飲食紀錄工具，搭配 BMI 計算與進階報告，幫助你養成長期健康習慣。"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <FontSizeProvider>
            <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800">
              <Navigation />
            </header>
            <main className="mx-auto min-h-[calc(100vh-64px)] max-w-4xl px-4 py-6 sm:px-4 sm:py-10">
              {children}
            </main>
            <Footer />
            {/* 用戶回饋/BUG 回報浮動按鈕 */}
            <FeedbackButton />
          </FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

