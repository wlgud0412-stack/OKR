# FitCoach AI — 최초 GitHub 업로드 (이후에는 update.ps1 사용)
# 저장소: https://github.com/wlgud0412-stack/OKR

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $RepoRoot "scripts\git-helper.ps1")

Write-Host "=== FitCoach AI 최초 배포 ===" -ForegroundColor Green
Invoke-GitDeploy -RepoRoot $RepoRoot -CommitMessage "Initial commit: FitCoach AI OKR fitness web app" -BumpVersion:$false | Out-Null
