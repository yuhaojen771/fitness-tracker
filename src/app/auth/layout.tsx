import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登入 Fitness Tracker 帳號",
  description: "使用 Google 一鍵登入 Fitness Tracker，開始紀錄體重與飲食、查看體重趨勢與健康分析。"
};

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800 sm:p-6">
        {children}
      </div>
    </div>
  );
}


