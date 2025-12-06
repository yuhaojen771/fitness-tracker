import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "記帳儀表板",
  description: "記錄您的收支，掌握財務狀況，查看支出分類統計與月度報表。"
};

export default function ExpenseDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

