# Vercel 部署工作流程說明

## 🚀 自動部署（預設行為）

### 正常開發流程

當您修改代碼並推送時，Vercel 會**自動部署**：

```bash
# 1. 修改代碼
# 2. 提交變更
git add .
git commit -m "修復某某功能"

# 3. 推送到 GitHub
git push origin main

# 4. ✅ Vercel 自動檢測並開始部署（無需手動操作）
```

**部署時間**：通常 2-5 分鐘

### Vercel 自動部署機制

- ✅ **監聽 Git 推送**：當您推送代碼到主分支（main）時自動觸發
- ✅ **Preview 部署**：每個 Pull Request 會自動建立預覽部署
- ✅ **即時通知**：部署完成後會發送通知（如果已設定）

## 🔄 手動重新部署的時機

### 情況 1：修改環境變數後 ⚠️

**重要**：修改環境變數後，必須手動觸發重新部署！

**步驟**：
1. 前往 Vercel Dashboard → 您的專案
2. 進入 **Settings** → **Environment Variables**
3. 修改或添加環境變數
4. 點擊 **Save**
5. 前往 **Deployments** 頁面
6. 點擊最新部署右側的 **⋯** 選單
7. 選擇 **Redeploy**

或者更簡單的方式：
- 前往 **Deployments** 頁面
- 點擊右上角的 **Redeploy** 按鈕

### 情況 2：構建失敗後修復

如果構建失敗：
1. 修復代碼問題
2. 提交並推送：`git push`
3. 會自動觸發新的部署
4. 無需手動重新部署

### 情況 3：想要重新運行構建

如果想重新運行某個部署：
1. 前往 **Deployments** 頁面
2. 找到目標部署
3. 點擊 **⋯** → **Redeploy**

## 📊 部署狀態監控

### 在 Vercel Dashboard 查看

1. **Deployments 頁面**
   - 查看所有部署歷史
   - 查看每個部署的狀態（Building、Ready、Error）
   - 查看構建日誌

2. **實時構建日誌**
   - 點擊部署項目查看詳細日誌
   - 可以看到構建進度、錯誤訊息等

### 在 GitHub 中查看

- Vercel 會在每個 commit 旁邊顯示部署狀態
- ✅ 綠色勾號 = 部署成功
- ❌ 紅色叉號 = 部署失敗
- ⏳ 黃色圓圈 = 正在部署

## 🔧 常用工作流程

### 日常開發工作流程

```bash
# 1. 修改代碼
vim src/app/dashboard/page.tsx

# 2. 測試本地
npm run dev

# 3. 提交並推送
git add .
git commit -m "改善用戶界面"
git push origin main

# 4. ✅ 自動部署開始（無需手動操作）
# 5. 等待 2-5 分鐘
# 6. 在 Vercel Dashboard 查看部署狀態
```

### 修改環境變數工作流程

1. **修改環境變數**
   - Vercel Dashboard → Settings → Environment Variables
   - 添加或修改變數
   - 點擊 Save

2. **手動觸發重新部署**
   - Deployments → Redeploy

3. **驗證**
   - 等待部署完成
   - 測試功能確認環境變數生效

## ⚠️ 常見誤解

### ❌ 誤解 1：每次修改都要手動部署

**事實**：只要推送到 Git，Vercel 會自動部署！

### ❌ 誤解 2：本地測試通過就等於部署成功

**事實**：本地環境和 Vercel 環境可能不同，需要查看構建日誌確認。

### ❌ 誤解 3：修改環境變數會立即生效

**事實**：必須重新部署後才會生效。

## 💡 最佳實踐

### 1. 頻繁提交，小步推送

```bash
# ✅ 推薦：頻繁提交小改動
git commit -m "修復類型錯誤"
git commit -m "改善錯誤處理"
git push

# ❌ 不推薦：一次提交大量變更
git commit -m "修復所有問題"
```

### 2. 使用 Feature Branch

```bash
# 創建功能分支
git checkout -b feature/new-feature

# 開發並提交
git commit -m "添加新功能"
git push origin feature/new-feature

# 在 GitHub 創建 Pull Request
# Vercel 會自動建立 Preview 部署供測試
```

### 3. 監控部署狀態

- 養成推送後查看 Vercel Dashboard 的習慣
- 如果構建失敗，立即查看日誌並修復
- 不要忽略構建警告

## 📝 總結

| 操作 | 是否需要手動重新部署？ |
|------|---------------------|
| 修改代碼並 `git push` | ❌ 否，自動部署 |
| 修改環境變數 | ✅ 是，必須手動重新部署 |
| 修復構建錯誤後 | ❌ 否，推送後自動部署 |
| 修改 Vercel 專案設定 | ✅ 是，通常需要重新部署 |
| 想要重新運行某次部署 | ✅ 是，手動選擇 Redeploy |

## 🔗 相關資源

- [Vercel 自動部署文檔](https://vercel.com/docs/concepts/git)
- [Vercel 環境變數文檔](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel 部署狀態文檔](https://vercel.com/docs/concepts/deployments)



