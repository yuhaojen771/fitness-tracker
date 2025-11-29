import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "聯絡我們",
  description: "Fitness Tracker 聯絡資訊與客服方式"
};

export default function ContactPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";
  
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        聯絡我們
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        如有任何問題或需要協助，歡迎透過以下方式與我們聯繫
      </p>

      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            📧 電子郵件
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-2">
            <a 
              href={`mailto:${supportEmail}`}
              className="text-emerald-600 hover:underline dark:text-emerald-400 font-medium"
            >
              {supportEmail}
            </a>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            我們會在 24-48 小時內回覆您的詢問
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            ⏰ 服務時間
          </h2>
          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            <li>週一至週五：09:00 - 18:00（台灣時間）</li>
            <li>週末及國定假日：休息</li>
            <li>緊急問題：我們會盡快處理</li>
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            💬 常見問題
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            在聯絡我們之前，建議先查看常見問題，可能可以更快找到答案：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li>訂閱相關問題：請參考 <a href="/refund" className="text-emerald-600 hover:underline dark:text-emerald-400">退換貨政策</a></li>
            <li>服務使用問題：請參考 <a href="/terms" className="text-emerald-600 hover:underline dark:text-emerald-400">服務條款</a></li>
            <li>隱私權問題：請參考 <a href="/privacy" className="text-emerald-600 hover:underline dark:text-emerald-400">隱私權政策</a></li>
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            📝 聯絡時請提供
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-2">
            為加快處理速度，聯絡時請提供：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li>您的 Email 或 User ID</li>
            <li>問題描述（盡量詳細）</li>
            <li>相關截圖或錯誤訊息（如有）</li>
            <li>訂單編號（如為付款相關問題）</li>
          </ul>
        </section>

        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            💡 <strong>提示：</strong>如需設定客服信箱，請在環境變數中設定 <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">NEXT_PUBLIC_SUPPORT_EMAIL</code>
          </p>
        </div>
      </div>
    </div>
  );
}

