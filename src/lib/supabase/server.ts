import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * 建立專供 Server Components / Route Handlers 使用的 Supabase 客戶端。
 * 會自動與 Next.js App Router 的 cookies API 整合，以確保使用者會話安全存放。
 * 
 * ⚠️ 注意：此客戶端使用 anon key，會受到 RLS (Row Level Security) 政策限制。
 */
export function createSupabaseServerClient() {
  // 支援兩種環境變數名稱（NEXT_PUBLIC_* 和直接名稱）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("找不到 Supabase 連線環境變數，請確認 .env.local 或 Vercel 環境變數已設定。");
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

/**
 * 建立使用 Service Role Key 的 Supabase 客戶端。
 * 此客戶端會繞過 RLS (Row Level Security) 政策，具有完整的資料庫存取權限。
 * 
 * ⚠️ 警告：此客戶端只能在服務端使用，絕對不能暴露給客戶端！
 * 僅用於：
 * - Webhook 處理（如 PayPal IPN）
 * - 後台管理任務
 * - 系統級操作
 * 
 * @returns Supabase 客戶端實例（使用 service role key）
 */
export function createSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "找不到 Supabase Service Role Key 環境變數。\n" +
      "請確認 .env.local 或 Vercel 環境變數已設定 SUPABASE_SERVICE_ROLE_KEY。\n" +
      "您可以在 Supabase Dashboard → Settings → API 中找到 Service Role Key。"
    );
  }

  // 使用 createClient 而非 createServerClient，因為 service role key 不需要 cookie 管理
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

