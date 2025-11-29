import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMI 計算機 - 線上快速計算 BMI 與健康分析",
  description:
    "免費線上 BMI 計算機，輸入身高與體重即可立即取得 BMI 值、體重分類與健康建議，支援公分/公尺單位切換。",
  keywords: ["BMI 計算機", "BMI", "身高體重", "肥胖指數", "健康檢測", "體重管理"]
};

export default function BmiLayout({ children }: { children: React.ReactNode }) {
  return children;
}


