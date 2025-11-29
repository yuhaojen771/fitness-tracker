import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "個人健康數據追蹤器首頁",
  description:
    "在 Fitness Tracker 首頁快速了解功能：體重與飲食紀錄、體重趨勢圖與 BMI 計算機，開始建立你的健康數據庫。"
};

export default function Home() {
  return (
    <section className="space-y-3 sm:space-y-4">
      <h1 className="text-2xl font-semibold dark:text-slate-100 sm:text-3xl">個人健康數據追蹤器</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base">
        開始追蹤你的健康數據！登入後即可記錄每日體重與飲食內容，查看趨勢圖表，並使用 BMI 計算機評估你的健康狀態。
      </p>
    </section>
  );
}

