/**
 * Supabase Edge Function：發送訂閱到期提醒郵件
 * 
 * 【後端框架函式 - 待設定】
 * 
 * 此函式應設定為定期執行（例如使用 Supabase Cron Jobs 或外部排程工具）
 * 在用戶 subscription_end_date 到期前的 7 天，向用戶的註冊信箱發送續訂提醒信
 * 
 * 使用方式：
 * 1. 部署此 Edge Function 到 Supabase
 * 2. 設定 Cron Job 每天執行一次
 * 3. 查詢所有 is_premium = true 且 subscription_end_date 在未來 7 天內的用戶
 * 4. 發送提醒郵件（可使用 Supabase 的 Email 服務或第三方服務如 SendGrid）
 * 
 * 範例 Cron 設定（每天 UTC 00:00 執行）：
 * 0 0 * * * curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-subscription-reminder
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // 處理 CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 初始化 Supabase 客戶端（使用服務角色以繞過 RLS）
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 計算 7 天後的日期
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    const targetDateStr = sevenDaysLater.toISOString().split("T")[0];

    // 查詢需要提醒的用戶
    // 條件：is_premium = true 且 subscription_end_date 在未來 7 天內
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, subscription_end_date")
      .eq("is_premium", true)
      .eq("subscription_end_date", targetDateStr);

    if (profilesError) {
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to remind", count: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // 取得用戶的 email 地址
    const userIds = profiles.map((p) => p.id);
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    const usersToRemind = users.users.filter((u) => userIds.includes(u.id));

    // 發送提醒郵件
    // 注意：這裡需要設定實際的郵件發送服務
    // 可以使用 Supabase 的 Email 功能或第三方服務
    const emailResults = [];

    for (const user of usersToRemind) {
      try {
        // TODO: 實作實際的郵件發送邏輯
        // 範例：使用 Supabase 的 Email 服務
        // await supabase.functions.invoke('send-email', {
        //   body: {
        //     to: user.email,
        //     subject: '您的 Premium 訂閱即將到期',
        //     template: 'subscription-reminder',
        //     data: { subscriptionEndDate: ... }
        //   }
        // });

        emailResults.push({
          userId: user.id,
          email: user.email,
          status: "sent" // 或 "failed"
        });
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        emailResults.push({
          userId: user.id,
          email: user.email,
          status: "failed"
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminder emails processed",
        count: emailResults.length,
        results: emailResults
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error in send-subscription-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

