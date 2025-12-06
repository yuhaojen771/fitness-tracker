import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "健康儀表板 - 體重與飲食紀錄",
  description:
    "在儀表板中查看每日體重與飲食紀錄、體重趨勢圖與進階健康分析，幫助你長期追蹤健康狀態。"
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}




