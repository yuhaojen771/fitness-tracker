/**
 * Webhook 安全驗證工具
 * 
 * 提供 Webhook 請求的額外安全驗證
 */

/**
 * 驗證請求是否來自可信來源
 * 透過檢查 User-Agent 和 Referer（如果可能）
 */
export function verifyWebhookSource(
  request: Request,
  expectedUserAgent?: string
): boolean {
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");
  
  // 檢查 User-Agent（如果提供）
  if (expectedUserAgent && userAgent !== expectedUserAgent) {
    return false;
  }
  
  // PayPal IPN 通常沒有 Referer，這是正常的
  // 綠界 Webhook 可能來自特定域名
  
  return true;
}

/**
 * 檢查重複請求（Idempotency Check）
 * 使用訂單編號或交易編號來防止重複處理
 */
const processedTransactions = new Map<string, number>();
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 小時

export function checkDuplicateRequest(
  transactionId: string,
  maxAge: number = MAX_AGE
): boolean {
  const now = Date.now();
  const lastProcessed = processedTransactions.get(transactionId);
  
  // 清理過期的記錄
  if (lastProcessed && now - lastProcessed > maxAge) {
    processedTransactions.delete(transactionId);
    return false;
  }
  
  // 如果最近處理過，返回 true（表示是重複請求）
  if (lastProcessed && now - lastProcessed < maxAge) {
    return true;
  }
  
  // 記錄這次請求
  processedTransactions.set(transactionId, now);
  return false;
}

/**
 * 驗證 IP 地址是否在白名單中
 * 注意：由於 Vercel 等平台使用代理，IP 驗證可能不可靠
 */
export function verifyIPWhitelist(
  request: Request,
  allowedIPs: string[]
): boolean {
  // 從 X-Forwarded-For 或直接取得 IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = forwardedFor?.split(",")[0]?.trim() || realIP || "unknown";
  
  // 如果沒有設定白名單，跳過驗證
  if (allowedIPs.length === 0) {
    return true;
  }
  
  return allowedIPs.includes(clientIP);
}

/**
 * 速率限制檢查（簡單版本）
 * 生產環境建議使用 Redis 或專業的速率限制服務
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 分鐘
const RATE_LIMIT_MAX = 10; // 每分鐘最多 10 次請求

export function checkRateLimit(
  identifier: string,
  maxRequests: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  // 如果沒有記錄或已過期，重置計數
  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }
  
  // 如果超過限制，返回 false
  if (record.count >= maxRequests) {
    return false;
  }
  
  // 增加計數
  record.count++;
  return true;
}

