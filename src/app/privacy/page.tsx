import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "Fitness Tracker 隱私權政策與個人資料保護說明"
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        隱私權政策
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        最後更新日期：2024年12月
      </p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            一、個人資料收集
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            我們收集以下個人資料以提供服務：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li><strong>註冊資訊：</strong>Email 地址、姓名（如提供）</li>
            <li><strong>使用資料：</strong>體重記錄、飲食記錄、健康數據</li>
            <li><strong>技術資料：</strong>IP 位址、瀏覽器類型、裝置資訊、使用時間</li>
            <li><strong>付款資料：</strong>透過第三方金流服務（綠界、PayPal）處理，我們不直接儲存信用卡資訊</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            二、資料使用目的
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            我們使用收集的資料用於以下目的：
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li>提供服務功能（記錄、分析、報告等）</li>
            <li>改善服務品質與使用者體驗</li>
            <li>發送服務相關通知（如訂閱到期提醒）</li>
            <li>處理付款與訂閱管理</li>
            <li>技術支援與問題排除</li>
            <li>法律遵循與安全防護</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            三、資料保護措施
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            我們採取以下措施保護您的個人資料：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li>使用 SSL/TLS 加密傳輸所有資料</li>
            <li>資料庫加密儲存敏感資訊</li>
            <li>定期進行安全檢查與更新</li>
            <li>限制資料存取權限，僅授權人員可存取</li>
            <li>使用業界標準的安全服務（Supabase）儲存資料</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            四、資料分享與揭露
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            我們不會出售您的個人資料。僅在以下情況下可能分享或揭露：
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li><strong>第三方服務：</strong>與必要的服務提供商分享（如付款處理、資料儲存），這些服務商受合約約束保護您的資料</li>
            <li><strong>法律要求：</strong>當法律、法院命令或政府機關要求時</li>
            <li><strong>安全防護：</strong>為保護服務、用戶或公眾安全時</li>
            <li><strong>業務轉讓：</strong>如發生合併、收購等業務轉讓時（會事先通知）</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            五、Cookie 使用
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            我們使用 Cookie 和類似技術：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li><strong>必要 Cookie：</strong>維持登入狀態、記住使用者偏好</li>
            <li><strong>分析 Cookie：</strong>了解服務使用情況，改善服務品質</li>
            <li>您可透過瀏覽器設定管理或刪除 Cookie，但可能影響部分功能</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            六、用戶權利
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            根據個人資料保護法，您享有以下權利：
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
            <li><strong>查詢權：</strong>可要求查詢您的個人資料</li>
            <li><strong>更正權：</strong>可要求更正錯誤或不完整的資料</li>
            <li><strong>刪除權：</strong>可要求刪除您的個人資料（刪除帳號）</li>
            <li><strong>撤回同意權：</strong>可撤回對資料處理的同意</li>
            <li><strong>資料可攜權：</strong>可要求以結構化格式匯出您的資料</li>
          </ol>
          <p className="text-slate-700 dark:text-slate-300 mt-3">
            如需行使上述權利，請透過 <a href="/contact" className="text-emerald-600 hover:underline dark:text-emerald-400">聯絡我們</a> 頁面與我們聯繫。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            七、資料保留
          </h2>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li>帳號存在期間，我們會保留您的資料</li>
            <li>刪除帳號後，資料將在 30 天內清除</li>
            <li>法律要求時，可能延長保留期間</li>
            <li>付款記錄可能因會計需求保留較長時間</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            八、兒童隱私
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            本服務不針對 13 歲以下兒童設計。如發現我們無意中收集了兒童的個人資料，我們將立即刪除。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            九、聯絡方式
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-3">
            如有隱私權相關問題或需要行使權利，請聯絡：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-slate-700 dark:text-slate-300">
            <li>Email: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com"}</li>
            <li>地址: 請參考 <a href="/contact" className="text-emerald-600 hover:underline dark:text-emerald-400">聯絡我們</a> 頁面</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            十、政策修訂
          </h2>
          <p className="text-slate-700 dark:text-slate-300">
            我們保留隨時修訂本隱私權政策的權利。修訂後的政策將公告於本頁面，並標示最後更新日期。重大變更時，我們會透過 Email 或網站公告通知您。
          </p>
        </section>
      </div>
    </div>
  );
}



