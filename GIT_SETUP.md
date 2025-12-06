# Git 倉庫設定指南

本文檔說明如何為專案建立 Git 倉庫並連接到 Vercel。

## 📋 選擇 Git 平台

Vercel 支援以下 Git 平台：

- ✅ **GitHub**（最常用，推薦）
- ✅ **GitLab**
- ✅ **Bitbucket**

### 推薦使用 GitHub 的原因

1. **最廣泛支援**：大多數工具和服務都優先支援 GitHub
2. **社群資源豐富**：更容易找到範例和解決方案
3. **Vercel 整合最佳**：與 Vercel 的整合最順暢
4. **免費方案完善**：個人專案完全免費

## 🚀 建立 GitHub 倉庫（推薦）

### 步驟 1：在 GitHub 建立新倉庫

1. 前往 [GitHub](https://github.com)
2. 登入您的帳號
3. 點擊右上角「+」→「New repository」
4. 填寫資訊：
   - **Repository name**: `fitness-tracker` 或 `health-app`
   - **Description**: `個人健康數據追蹤器`
   - **Visibility**: 選擇 Public（公開）或 Private（私有）
   - ⚠️ **不要**勾選「Initialize this repository with a README」
5. 點擊「Create repository」

### 步驟 2：初始化本地 Git 倉庫

在專案根目錄執行：

```bash
# 進入專案目錄
cd fitness-tracker

# 初始化 Git 倉庫
git init

# 添加所有檔案
git add .

# 建立初始提交
git commit -m "Initial commit: Fitness Tracker MVP"

# 添加遠端倉庫（將 YOUR_USERNAME 替換為您的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/fitness-tracker.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步驟 3：驗證

1. 前往您的 GitHub 倉庫頁面
2. 確認所有檔案都已上傳

## 🔗 建立 GitLab 倉庫

### 步驟 1：在 GitLab 建立新專案

1. 前往 [GitLab](https://gitlab.com)
2. 登入您的帳號
3. 點擊「New project」或「Create project」
4. 選擇「Create blank project」
5. 填寫資訊：
   - **Project name**: `fitness-tracker`
   - **Visibility Level**: 選擇 Public 或 Private
6. 點擊「Create project」

### 步驟 2：連接本地倉庫

```bash
# 初始化 Git 倉庫（如果尚未初始化）
git init

# 添加所有檔案
git add .

# 建立初始提交
git commit -m "Initial commit: Fitness Tracker MVP"

# 添加遠端倉庫（將 YOUR_USERNAME 替換為您的 GitLab 用戶名）
git remote add origin https://gitlab.com/YOUR_USERNAME/fitness-tracker.git

# 推送到 GitLab
git branch -M main
git push -u origin main
```

## 🔗 建立 Bitbucket 倉庫

### 步驟 1：在 Bitbucket 建立新倉庫

1. 前往 [Bitbucket](https://bitbucket.org)
2. 登入您的帳號
3. 點擊「Create」→「Repository」
4. 填寫資訊：
   - **Repository name**: `fitness-tracker`
   - **Access level**: 選擇 Public 或 Private
5. 點擊「Create repository」

### 步驟 2：連接本地倉庫

```bash
# 初始化 Git 倉庫（如果尚未初始化）
git init

# 添加所有檔案
git add .

# 建立初始提交
git commit -m "Initial commit: Fitness Tracker MVP"

# 添加遠端倉庫（將 YOUR_USERNAME 替換為您的 Bitbucket 用戶名）
git remote add origin https://bitbucket.org/YOUR_USERNAME/fitness-tracker.git

# 推送到 Bitbucket
git branch -M main
git push -u origin main
```

## 🔐 使用 SSH 連線（選填，更安全）

如果您偏好使用 SSH 而非 HTTPS：

### GitHub SSH 設定

1. 生成 SSH 金鑰（如果還沒有）：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 複製公鑰：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. 在 GitHub 設定 SSH 金鑰：
   - Settings → SSH and GPG keys → New SSH key
   - 貼上公鑰並儲存

4. 使用 SSH URL：
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/fitness-tracker.git
   ```

### GitLab SSH 設定

類似 GitHub，在 GitLab 的 Settings → SSH Keys 中添加公鑰。

## 📝 檢查清單

### 建立倉庫前
- [ ] 選擇 Git 平台（推薦 GitHub）
- [ ] 確認已登入對應平台帳號
- [ ] 確認專案已準備好（所有檔案已測試）

### 建立倉庫後
- [ ] 倉庫已建立
- [ ] 本地 Git 已初始化
- [ ] 檔案已提交並推送
- [ ] 遠端倉庫連接成功

### 部署前
- [ ] 所有變更已提交
- [ ] 已推送到遠端倉庫
- [ ] 準備好環境變數清單

## 🔄 日常使用

### 提交變更

```bash
# 查看變更
git status

# 添加變更
git add .

# 提交變更
git commit -m "描述您的變更"

# 推送到遠端
git push
```

### 建立新分支（用於功能開發）

```bash
# 建立並切換到新分支
git checkout -b feature/new-feature

# 開發完成後推送到遠端
git push -u origin feature/new-feature
```

## 🆘 常見問題

### Q: 我應該選擇 Public 還是 Private？

**A:** 
- **Public（公開）**：任何人都可以看到程式碼，適合學習專案
- **Private（私有）**：只有您可以存取，適合商業專案

### Q: 如果已經有本地 Git 倉庫怎麼辦？

**A:** 只需要添加遠端倉庫：
```bash
git remote add origin https://github.com/YOUR_USERNAME/fitness-tracker.git
git push -u origin main
```

### Q: 如何變更遠端倉庫 URL？

**A:** 
```bash
# 查看目前遠端
git remote -v

# 變更遠端 URL
git remote set-url origin https://github.com/NEW_USERNAME/fitness-tracker.git
```

### Q: 忘記提交某些檔案怎麼辦？

**A:** 
```bash
# 添加遺漏的檔案
git add 檔案名稱

# 修改最後一次提交（如果還沒推送）
git commit --amend

# 或建立新的提交
git commit -m "添加遺漏的檔案"
git push
```

### Q: 如何忽略某些檔案？

**A:** 編輯 `.gitignore` 檔案（已包含在專案中）：
```
# 環境變數檔案
.env*.local
.env

# 依賴套件
node_modules/
```

## 📚 下一步

建立 Git 倉庫後，您可以：

1. 查看 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 進行部署
2. 設定 CI/CD 自動部署
3. 使用 Pull Request 進行程式碼審查

## 🔗 相關資源

- [GitHub 文件](https://docs.github.com)
- [GitLab 文件](https://docs.gitlab.com)
- [Bitbucket 文件](https://support.atlassian.com/bitbucket-cloud)
- [Git 官方文件](https://git-scm.com/doc)



