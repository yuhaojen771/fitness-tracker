# PayPal 環境變數設定指南

> 📖 **完整設定指南**：
> - [PayPal 正式環境設定指南](./PAYPAL_LIVE_SETUP.md) - 設定正式 PayPal 連結
> - [PayPal 沙盒環境設定完整指南](./PAYPAL_SANDBOX_SETUP.md) - 設定沙盒測試環境

## 環境變數配置

請在專案根目錄建立 `.env.local` 檔案，並填入以下環境變數：

```env
# ============================================
# PayPal 金流設定
# ============================================

# 【推薦】分別設定月繳和年繳按鈕（最靈活）
# 月繳方案 PayPal 付款連結
# 請前往 PayPal Business Dashboard 建立月繳方案按鈕（US$3.99）
# 取得按鈕 ID 後，使用格式：https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_MONTHLY_BUTTON_ID
NEXT_PUBLIC_PAYPAL_MONTHLY_LINK=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_MONTHLY_BUTTON_ID

# 年繳方案 PayPal 付款連結
# 請前往 PayPal Business Dashboard 建立年繳方案按鈕（US$39.99）
# 取得按鈕 ID 後，使用格式：https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_YEARLY_BUTTON_ID
NEXT_PUBLIC_PAYPAL_YEARLY_LINK=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_YEARLY_BUTTON_ID

# 【備選】統一連結（如果月繳和年繳使用同一個按鈕）
# 如果月繳和年繳使用同一個 PayPal 按鈕，可以只設定此變數
# 系統會自動添加用戶 ID 和方案資訊
# NEXT_PUBLIC_PAYPAL_LIVE_URL=https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_BUTTON_ID

# PayPal 沙盒環境（Sandbox）測試連結
# 用於開發環境（development）下的 PayPal 付款測試
# 請前往 PayPal Developer Dashboard 建立沙盒付款連結
# 範例格式：https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_SANDBOX_BUTTON_ID
NEXT_PUBLIC_PAYPAL_TEST_URL=https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YOUR_SANDBOX_BUTTON_ID
```

## 環境變數說明

### NEXT_PUBLIC_PAYPAL_MONTHLY_LINK（推薦）
- **用途**：PayPal 月繳方案付款連結
- **使用時機**：用戶選擇月繳方案時使用
- **取得方式**：前往 [PayPal Business Dashboard](https://www.paypal.com/businessmanage) 建立月繳方案按鈕（US$3.99）
- **詳細設定**：請參考 [PayPal 正式環境設定指南](./PAYPAL_LIVE_SETUP.md)

### NEXT_PUBLIC_PAYPAL_YEARLY_LINK（推薦）
- **用途**：PayPal 年繳方案付款連結
- **使用時機**：用戶選擇年繳方案時使用
- **取得方式**：前往 [PayPal Business Dashboard](https://www.paypal.com/businessmanage) 建立年繳方案按鈕（US$39.99）
- **詳細設定**：請參考 [PayPal 正式環境設定指南](./PAYPAL_LIVE_SETUP.md)

### NEXT_PUBLIC_PAYPAL_LIVE_URL（備選）
- **用途**：PayPal 正式環境統一付款連結
- **使用時機**：如果未設定月繳/年繳專用連結，會使用此統一連結
- **取得方式**：前往 [PayPal Business Dashboard](https://www.paypal.com/businessmanage) 建立付款按鈕
- **注意**：如果使用統一連結，系統會自動添加用戶 ID 和方案資訊

### NEXT_PUBLIC_PAYPAL_TEST_URL
- **用途**：PayPal 沙盒環境測試連結
- **使用時機**：僅在開發環境（`NODE_ENV === 'development'`）且未設定正式連結時使用
- **取得方式**：前往 [PayPal Developer Dashboard](https://developer.paypal.com/) 建立沙盒付款連結
- **詳細設定**：請參考 [PayPal 沙盒環境設定完整指南](./PAYPAL_SANDBOX_SETUP.md)

### 連結選擇邏輯

系統會按照以下優先順序選擇 PayPal 連結：

1. **月繳方案**：
   - `NEXT_PUBLIC_PAYPAL_MONTHLY_LINK`（優先）
   - `NEXT_PUBLIC_PAYPAL_LIVE_URL`（備選）
   - `NEXT_PUBLIC_PAYPAL_TEST_URL`（開發環境）

2. **年繳方案**：
   - `NEXT_PUBLIC_PAYPAL_YEARLY_LINK`（優先）
   - `NEXT_PUBLIC_PAYPAL_LIVE_URL`（備選）
   - `NEXT_PUBLIC_PAYPAL_TEST_URL`（開發環境）

## 測試流程

1. 在 `.env.local` 中設定 `NEXT_PUBLIC_PAYPAL_TEST_URL`
2. 啟動開發伺服器：`npm run dev`
3. 在應用中點擊「立即訂閱」按鈕
4. 系統會自動使用沙盒連結進行測試
5. 完成付款後，手動在 Supabase 中更新 `is_premium` 欄位

## 注意事項

- `.env.local` 檔案不會被提交到 Git（已在 `.gitignore` 中）
- 環境變數必須以 `NEXT_PUBLIC_` 開頭才能在客戶端使用
- 修改環境變數後需要重新啟動開發伺服器
- 沙盒環境的付款連結 URL 應包含 `sandbox.paypal.com`
- 正式環境的付款連結 URL 應包含 `paypal.com`（不包含 sandbox）

## 📚 相關文檔

- [PayPal 正式環境設定指南](./PAYPAL_LIVE_SETUP.md) - **設定正式 PayPal 連結（推薦）**
- [PayPal 沙盒環境設定完整指南](./PAYPAL_SANDBOX_SETUP.md) - 設定沙盒測試環境
- [訂閱功能設定指南](./SUBSCRIPTION_SETUP.md) - 訂閱功能的完整說明
- [快速測試指南](./QUICK_TESTING_GUIDE.md) - 快速測試流程

