# 自動提交腳本
# 使用方法：在 PowerShell 中執行 .\commit-changes.ps1

# 切換到項目目錄
Set-Location -Path $PSScriptRoot

Write-Host "正在檢查 Git 狀態..." -ForegroundColor Cyan
git status

Write-Host "`n正在添加所有更改的文件..." -ForegroundColor Cyan
git add .

Write-Host "`n正在提交更改..." -ForegroundColor Cyan
git commit -m "修復體重趨勢圖目標文字截斷問題並優化手機版歷史記錄顯示

- 增加右側 padding 為目標文字預留空間
- 改進目標體重和目標日期的文字顯示
- 將歷史記錄移到表單之後，方便手機用戶快速查看
- 在標題區域添加歷史記錄快捷導航按鈕
- 優化文字布局，防止文字被截斷"

Write-Host "`n正在推送到 GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "`n完成！更改已成功推送到 GitHub。" -ForegroundColor Green
Write-Host "Vercel 將自動部署新版本。" -ForegroundColor Green

# 暫停以便查看輸出
Read-Host "`n按 Enter 鍵退出"
