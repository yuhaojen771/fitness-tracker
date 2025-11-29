"use client";

/**
 * 用戶回饋/BUG 回報浮動按鈕組件
 * 
 * 功能說明：
 * - 使用 fixed 定位，永久顯示在瀏覽器頁面的右下角
 * - 點擊後開啟新的瀏覽器標籤頁，導向外部表單（Google Form 或 Tally Form）
 * - 在手機螢幕尺寸上確保不會遮擋主要內容
 * 
 * 環境變數設定：
 * 請在 .env.local 或部署環境中設定：
 * NEXT_PUBLIC_FEEDBACK_FORM_URL=https://forms.google.com/your-form-url
 * 或
 * NEXT_PUBLIC_FEEDBACK_FORM_URL=https://tally.so/your-form-url
 */
export function FeedbackButton() {
  // 從環境變數取得回饋表單 URL
  // 如果未設定，按鈕將不會顯示
  const feedbackFormUrl = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL;

  // 如果未設定環境變數，不顯示按鈕
  if (!feedbackFormUrl) {
    return null;
  }

  return (
    <a
      href={feedbackFormUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl dark:bg-slate-700 dark:hover:bg-slate-600 sm:bottom-6 sm:right-6"
      aria-label="回饋/回報問題"
    >
      {/* 圖標 */}
      <span className="text-lg" role="img" aria-hidden="true">
        💬
      </span>
      
      {/* 文字標籤（在較大螢幕上顯示） */}
      <span className="hidden text-sm font-medium text-white sm:inline">
        回饋/回報問題
      </span>
    </a>
  );
}

