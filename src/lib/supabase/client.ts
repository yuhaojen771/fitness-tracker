"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

let browserClient:
  | ReturnType<typeof createBrowserClient<Database>>
  | undefined;

/**
 * 建立可在 Client Components 中重複使用的 Supabase browser client。
 * 透過模組層級快取避免在瀏覽器端重複初始化。
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "找不到 NEXT_PUBLIC_SUPABASE_* 環境變數，請確認 .env.local 有配置。"
      );
    }

    browserClient = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return browserClient;
}

