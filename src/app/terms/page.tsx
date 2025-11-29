import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務條款",
  description: "Fitness Tracker 服務條款與使用規範"
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        服務條款
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        最後更新日期：2024年12月
      </p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            一、服務說明
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Fitness Tracker（以下簡稱「本服務」）提供個人健康數據追蹤服務，包括體重記錄、飲食記錄、BMI 計算、健康趨勢分析等功能。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            二、用戶註冊與帳號
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>用戶需提供真實、準確的個人資料進行註冊。</li>
            <li>用戶需妥善保管帳號密碼，對帳號下的所有行為負責。</li>
            <li>如發現帳號被盜用，應立即通知我們並更改密碼。</li>
            <li>禁止將帳號轉讓、出售或分享給他人使用。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            三、服務使用規範
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>用戶應合法使用本服務，不得用於任何違法目的。</li>
            <li>禁止任何侵害他人權益、干擾服務正常運作的行為。</li>
            <li>禁止上傳惡意程式碼、病毒或任何可能損害系統的內容。</li>
            <li>禁止嘗試破解、入侵或破壞服務系統。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            四、付費服務
          </h2>
          <div className="space-y-3 text-slate-700 dark:text-slate-300">
            <p>
              <strong>Premium 訂閱服務說明：</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>月繳方案：新台幣 120 元/月</li>
              <li>年繳方案：新台幣 1,200 元/年</li>
              <li>訂閱後可享受完整歷史記錄、長期趨勢分析、數據匯出等 Premium 功能</li>
              <li>訂閱將自動續約，用戶可隨時取消</li>
            </ul>
            <p>
              <strong>付款方式：</strong>支援信用卡、ATM 轉帳、超商代碼等（透過綠界金流或 PayPal）
            </p>
            <p>
              <strong>訂閱管理：</strong>用戶可在個人設定中管理訂閱，包括取消自動續約。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            五、服務變更與終止
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>我們保留隨時調整、變更或終止服務內容的權利。</li>
            <li>用戶可隨時取消訂閱，取消後不會自動續約。</li>
            <li>如用戶違反本服務條款，我們有權立即終止服務，且不退款。</li>
            <li>服務終止後，用戶資料將在 30 天內刪除。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            六、免責聲明
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>本服務依「現況」提供，不保證服務完全無誤、不中斷或無缺陷。</li>
            <li>用戶使用本服務的風險自行承擔，我們不對任何直接、間接或衍生損害負責。</li>
            <li>本服務提供的健康數據僅供參考，不構成醫療建議，請諮詢專業醫療人員。</li>
            <li>我們不對用戶上傳的資料內容負責。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            七、智慧財產權
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>本服務的所有內容，包括但不限於文字、圖形、程式碼、商標等，智慧財產權均歸我們所有。</li>
            <li>用戶不得未經授權使用、複製、修改或散布本服務的任何內容。</li>
            <li>用戶上傳的資料，其智慧財產權仍歸用戶所有，但用戶授予我們使用、儲存、處理這些資料的權利。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            八、爭議處理
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>本服務條款適用中華民國法律。</li>
            <li>如有爭議，雙方應先以誠信原則協商解決。</li>
            <li>協商不成時，提交台灣台北地方法院為第一審管轄法院。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            九、聯絡方式
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            如有任何疑問或需要協助，請透過以下方式聯絡我們：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li>Email: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com"}</li>
            <li>地址: 請參考 <a href="/contact" className="text-emerald-600 hover:underline dark:text-emerald-400">聯絡我們</a> 頁面</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            十、條款修訂
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            我們保留隨時修訂本服務條款的權利。修訂後的條款將公告於本頁面，並標示最後更新日期。繼續使用本服務即視為同意修訂後的條款。
          </p>
        </section>
      </div>
    </div>
  );
}

