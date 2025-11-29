import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "退換貨政策",
  description: "Fitness Tracker Premium 訂閱退換貨政策與退款說明"
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        退換貨政策
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        最後更新日期：2024年12月
      </p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            一、適用範圍
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            本政策適用於 Fitness Tracker Premium 訂閱服務。本服務為數位訂閱服務，一經開通即開始提供服務。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            二、退款條件
          </h2>
          
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                ⚠️ 數位訂閱服務特殊說明
              </h3>
              <p className="text-amber-800 dark:text-amber-200">
                本服務為數位訂閱服務，一經開通即開始提供服務。退款將根據已使用期間按比例計算。
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">退款期限</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>7 天內：</strong>可申請全額退款</li>
                <li><strong>超過 7 天：</strong>按比例退款（扣除已使用期間）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">退款計算方式</h3>
              <p className="mb-2">退款金額 = 已付款金額 × (剩餘天數 / 總訂閱天數)</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
                <p className="text-sm"><strong>範例：</strong></p>
                <p className="text-sm">年繳方案（NT$1,200），使用 30 天後申請退款</p>
                <p className="text-sm">退款金額 = 1,200 × (335 / 365) = NT$1,100</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            三、退款流程
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>透過 Email 或 <a href="/contact" className="text-emerald-600 hover:underline dark:text-emerald-400">聯絡我們</a> 頁面申請退款</li>
            <li>提供以下資訊：
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>訂單編號或付款交易編號</li>
                <li>註冊時使用的 Email</li>
                <li>退款原因</li>
              </ul>
            </li>
            <li>我們將在收到申請後 3-5 個工作天內處理</li>
            <li>退款將退回原付款方式（信用卡、銀行帳戶等）</li>
            <li>退款到帳時間視付款方式而定，通常為 5-14 個工作天</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            四、不適用退款情況
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            以下情況不適用退款：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li>已使用超過訂閱期間的 50%</li>
            <li>因違反服務條款被終止服務</li>
            <li>重複申請退款（已處理過的退款申請）</li>
            <li>超過退款期限（訂閱開始後超過 30 天）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            五、取消訂閱
          </h2>
          <div className="space-y-3 text-slate-700 dark:text-slate-300">
            <p>
              <strong>取消訂閱說明：</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>用戶可隨時在個人設定中取消訂閱</li>
              <li>取消後不會自動續約，但已付款期間的服務仍可使用至到期日</li>
              <li>取消訂閱後不會自動退款（需依本政策申請退款）</li>
              <li>取消後如需重新訂閱，可隨時再次訂閱</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            六、聯絡方式
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            退款相關問題，請透過以下方式聯絡：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li>Email: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com"}</li>
            <li>處理時間：3-5 個工作天</li>
            <li>更多資訊請參考 <a href="/contact" className="text-emerald-600 hover:underline dark:text-emerald-400">聯絡我們</a> 頁面</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

