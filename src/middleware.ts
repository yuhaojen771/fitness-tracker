import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware
 * 用於實施 API 速率限制和安全檢查
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只對 API 路由進行速率限制
  if (pathname.startsWith("/api/")) {
    // 簡單的速率限制檢查（生產環境建議使用 Redis）
    // 這裡只是示範，實際應該使用專業的速率限制服務
    
    // 取得客戶端 IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const clientIP = forwardedFor?.split(",")[0]?.trim() || realIP || "unknown";
    
    // 對於 Webhook 端點，允許較高的速率（因為是第三方服務調用）
    if (pathname.startsWith("/api/webhooks/")) {
      // Webhook 通常不需要嚴格的速率限制，因為有驗證機制
      return NextResponse.next();
    }
    
    // 對於其他 API，可以實施更嚴格的速率限制
    // 這裡只是示範，實際應該使用 Redis 或專業服務
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有 API 路由，除了：
     * - _next/static (靜態文件)
     * - _next/image (圖片優化)
     * - favicon.ico (favicon)
     */
    "/api/:path*"
  ]
};



