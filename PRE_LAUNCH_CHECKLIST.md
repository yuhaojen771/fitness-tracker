# 🚀 上線前檢查清單

本文檔列出上線前需要完善的所有項目，按優先順序排列。

---

## 🔴 **高優先級（必須完成才能上線）**

### 1. 環境變數設定 ⚠️ **關鍵**
**狀態：** 需要在 Vercel 中設定

**必填環境變數：**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase 專案 URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名金鑰
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服務角色金鑰（僅 Production）
- [ ] `NEXT_PUBLIC_SITE_URL` - 正式網域 URL（部署後更新）

**選填環境變數：**
- [ ] `NEXT_PUBLIC_FEEDBACK_FORM_URL` - 回饋表單連結（如果使用）
- [ ] `NEXT_PUBLIC_PAYPAL_MONTHLY_LINK` - PayPal 月繳連結（如果使用）
- [ ] `NEXT_PUBLIC_PAYPAL_YEARLY_LINK` - PayPal 年繳連結（如果使用）
- [ ] `NEXT_PUBLIC_PAYPAL_TEST_URL` - PayPal 測試連結（開發環境）

**參考文件：** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

---

### 2. Supabase 設定 ⚠️ **關鍵**

#### 2.1 Google OAuth 設定
- [ ] 在 Supabase Dashboard → Authentication → Providers 中啟用 Google
- [ ] 設定 Google OAuth Client ID 和 Client Secret
- [ ] 在 Google Cloud Console 設定 Redirect URI：`https://你的專案ID.supabase.co/auth/v1/callback`

#### 2.2 OAuth Redirect URLs 設定
- [ ] 在 Supabase Dashboard → Authentication → URL Configuration 中設定：
  - Site URL: `https://your-domain.vercel.app`
  - Redirect URLs: `https://your-domain.vercel.app/auth/callback`

#### 2.3 資料庫 Migration
- [ ] 確認所有 SQL migration 已執行（`schema.sql`, `schema_subscription.sql` 等）
- [ ] 確認 RLS (Row Level Security) 政策已正確設定
- [ ] 測試資料庫連線和權限

**參考文件：** [SUPABASE_GOOGLE_OAUTH_SETUP.md](./SUPABASE_GOOGLE_OAUTH_SETUP.md)

---

### 3. SEO 和 Metadata 更新 ⚠️ **重要**

#### 3.1 更新 metadataBase URL
**檔案：** `src/app/layout.tsx` (第 10 行)
- [ ] 將 `https://fitness-tracker.example` 改為正式網域
- [ ] 更新 OpenGraph 圖片 URL（如果有的話）

#### 3.2 確認所有頁面都有適當的 Metadata
- [x] 首頁 (`page.tsx`) - ✅ 已有
- [x] 儀表板 (`dashboard/layout.tsx`) - ✅ 已有
- [x] BMI 計算機 (`bmi-calculator/layout.tsx`) - ✅ 已有
- [x] 登入頁 (`auth/layout.tsx`) - ✅ 已有
- [x] 管理後台 (`admin/layout.tsx`) - ✅ 已有（已設定 robots: noindex）

---

### 4. 生產環境 Console 日誌清理 ⚠️ **建議**

**檔案：** `src/app/auth/callback/route.ts`
- [ ] 將 `console.log` 改為僅在開發環境輸出
- [ ] 保留 `console.error` 用於錯誤追蹤，但考慮使用專業日誌服務

**建議修改：**
```typescript
if (process.env.NODE_ENV === "development") {
  console.log("[OAuth Callback] Request URL:", requestUrl.href);
}
```

**其他檔案中的 console：**
- [ ] 檢查並清理所有生產環境不需要的 `console.log`
- [ ] 保留錯誤日誌，但考慮整合 Sentry 或其他錯誤追蹤服務

---

### 5. 安全性檢查 ⚠️ **重要**

#### 5.1 環境變數安全性
- [ ] 確認 `SUPABASE_SERVICE_ROLE_KEY` 只在 Production 環境設定
- [ ] 確認所有敏感金鑰不會暴露在前端程式碼中
- [ ] 檢查 `.env.local` 是否已加入 `.gitignore`

#### 5.2 API 路由安全性
- [ ] 確認 Webhook 路由有適當的驗證機制
- [ ] 確認所有 API 路由都有適當的錯誤處理
- [ ] 考慮實作 API 速率限制（目前 middleware 有框架但未實作）

#### 5.3 資料驗證
- [x] 體重輸入驗證（20-500 公斤） - ✅ 已有
- [x] 飲食記錄長度限制（1000 字元） - ✅ 已有
- [x] 日期驗證 - ✅ 已有

---

## 🟡 **中優先級（建議完成）**

### 6. 金流設定（如果使用）

#### 6.1 PayPal 設定
- [ ] 建立 PayPal Business 帳號
- [ ] 建立月繳方案按鈕（US$3.99）
- [ ] 建立年繳方案按鈕（US$39.99）
- [ ] 設定 PayPal Webhook URL（如果使用自動更新）
- [ ] 測試 PayPal 付款流程

**參考文件：** 
- [PAYPAL_LIVE_SETUP.md](./PAYPAL_LIVE_SETUP.md)
- [PAYPAL_WEBHOOK_SETUP.md](./PAYPAL_WEBHOOK_SETUP.md)

#### 6.2 綠界（ECPay）設定（如果使用）
- [ ] 建立綠界商家帳號
- [ ] 設定環境變數（MerchantID, HashKey, HashIV）
- [ ] 設定 Webhook 回傳 URL
- [ ] 測試付款流程

**參考文件：** [ECPAY_SETUP.md](./ECPAY_SETUP.md)

---

### 7. 回饋表單設定（選填）

- [ ] 建立 Google Form 或 Tally Form
- [ ] 設定表單欄位（包含 `user_status` 參數處理）
- [ ] 設定環境變數 `NEXT_PUBLIC_FEEDBACK_FORM_URL`
- [ ] 測試回饋按鈕功能

**參考文件：** [GOOGLE_FORM_SETUP.md](./GOOGLE_FORM_SETUP.md)

---

### 8. 功能測試清單

#### 8.1 核心功能測試
- [ ] Google OAuth 登入流程
- [ ] 每日記錄新增/編輯/刪除
- [ ] 體重趨勢圖顯示（免費用戶 7 天限制）
- [ ] Premium 用戶完整歷史記錄存取
- [ ] BMI 計算機功能
- [ ] 資料匯出功能（CSV/JSON）

#### 8.2 Premium 功能測試
- [ ] Premium 模態框顯示
- [ ] 付款連結跳轉（PayPal/ECPay）
- [ ] 訂閱管理介面
- [ ] 取消訂閱功能
- [ ] 訂閱到期提醒橫幅

#### 8.3 管理後台測試
- [ ] 管理員登入
- [ ] 用戶列表查看
- [ ] 手動更新訂閱狀態

---

### 9. 部署後設定

#### 9.1 Vercel 設定
- [ ] 確認專案已成功部署
- [ ] 檢查建置日誌是否有錯誤
- [ ] 確認環境變數已正確設定
- [ ] 測試 Production URL 可正常訪問

#### 9.2 自訂網域（選填）
- [ ] 購買並設定自訂網域
- [ ] 在 Vercel 中設定 DNS
- [ ] 更新 `NEXT_PUBLIC_SITE_URL` 環境變數
- [ ] 更新 Supabase OAuth Redirect URLs

---

## 🟢 **低優先級（可以後續優化）**

### 10. 性能優化

- [ ] 圖片優化（如果未來添加圖片功能）
- [ ] 程式碼分割和懶加載
- [ ] 快取策略優化
- [ ] 資料庫查詢優化

---

### 11. 監控和日誌

- [ ] 整合錯誤追蹤服務（Sentry、LogRocket 等）
- [ ] 設定應用程式監控（Vercel Analytics、Google Analytics）
- [ ] 設定 Uptime 監控
- [ ] 設定錯誤通知（Email、Slack 等）

---

### 12. 文檔完善

- [x] 部署指南 - ✅ 已有
- [x] OAuth 設定指南 - ✅ 已有
- [x] 金流設定指南 - ✅ 已有
- [ ] API 文檔（如果對外提供 API）
- [ ] 用戶使用手冊（選填）

---

### 13. 法律和合規

- [x] 服務條款頁面 - ✅ 已有 (`/terms`)
- [x] 隱私權政策頁面 - ✅ 已有 (`/privacy`)
- [x] 退換貨政策頁面 - ✅ 已有 (`/refund`)
- [ ] 確認所有政策內容符合當地法規
- [ ] 考慮 GDPR 合規（如果服務歐盟用戶）

---

### 14. 其他優化

- [ ] 添加 favicon
- [ ] 添加 robots.txt
- [ ] 添加 sitemap.xml（如果有多個公開頁面）
- [ ] 設定 404 錯誤頁面
- [ ] 設定 500 錯誤頁面
- [ ] 添加 PWA 支援（選填）

---

## 📋 **快速檢查清單（部署前最後確認）**

在實際部署前，請確認以下項目：

- [ ] 所有環境變數已在 Vercel 中設定
- [ ] Supabase OAuth 設定已完成
- [ ] `metadataBase` URL 已更新為正式網域
- [ ] 所有功能已在本地測試通過
- [ ] 程式碼已提交並推送到 Git 倉庫
- [ ] Vercel 專案已連接 Git 倉庫
- [ ] 首次部署成功且無錯誤
- [ ] 測試 Google 登入功能正常
- [ ] 測試核心功能（新增記錄、查看圖表）正常
- [ ] 確認 Production URL 可正常訪問

---

## 🎯 **建議的上線流程**

1. **準備階段**（1-2 天）
   - 完成所有高優先級項目
   - 在本地環境完整測試

2. **部署階段**（半天）
   - 在 Vercel 部署專案
   - 設定所有環境變數
   - 更新 Supabase OAuth 設定

3. **測試階段**（1 天）
   - 在 Production 環境測試所有功能
   - 邀請少量測試用戶試用
   - 修復發現的問題

4. **正式上線**（半天）
   - 確認所有功能正常
   - 正式對外發布

---

## 📞 **需要協助？**

如果遇到問題，請參考：
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 部署指南
- [SUPABASE_GOOGLE_OAUTH_SETUP.md](./SUPABASE_GOOGLE_OAUTH_SETUP.md) - OAuth 設定
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 測試指南

---

**最後更新：** 2024年12月



