import Link from "next/link";

export function Footer() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-800">
      <div className="mx-auto max-w-4xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* 法律資訊 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              法律資訊
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  服務條款
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  隱私權政策
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  退換貨政策
                </Link>
              </li>
            </ul>
          </div>

          {/* 關於我們 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              關於我們
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  聯絡我們
                </Link>
              </li>
            </ul>
          </div>

          {/* 支援 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              支援
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/dashboard"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  使用說明
                </a>
              </li>
            </ul>
          </div>

          {/* 聯絡資訊 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              聯絡資訊
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Email:{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-emerald-600 hover:underline dark:text-emerald-400"
              >
                {supportEmail}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6 text-center dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {currentYear} Fitness Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

