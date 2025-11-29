import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * 建立專供 Server Components / Route Handlers 使用的 Supabase 客戶端。
 * 會自動與 Next.js App Router 的 cookies API 整合，以確保使用者會話安全存放。
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("找不到 Supabase 連線環境變數，請確認 .env.local 已設定。");
  }

  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // ⚠️ 注意：只有在 Server Action 或 Route Handler 中才能真正寫入 cookies。
        // 在一般 Server Component 中嘗試寫入會觸發 Next.js 錯誤，因此這裡用 try/catch 保護。
        try {
          (cookieStore as unknown as {
            set: (config: { name: string; value: string } & CookieOptions) => void;
          }).set({ name, value, ...options });
        } catch {
          // 在不允許寫入 cookies 的環境（例如一般 Server Component）中忽略寫入，避免整頁爆掉。
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          (cookieStore as unknown as {
            delete: (config: { name: string } & CookieOptions) => void;
          }).delete({ name, ...options });
        } catch {
          // 同上，在不允許修改 cookies 的情境下忽略刪除。
        }
      }
    }
  });
}

