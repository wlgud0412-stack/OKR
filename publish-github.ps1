# FitCoach AI — GitHub 업로드 스크립트
# 저장소: https://github.com/wlgud0412-stack/OKR
#
# 사용법 (PowerShell):
#   cd fitcoach
#   .\publish-github.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot
$remoteUrl = "https://github.com/wlgud0412-stack/OKR.git"

function Find-Git {
    $candidates = @(
        "git",
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    )
    foreach ($c in $candidates) {
        if ($c -eq "git") {
            $cmd = Get-Command git -ErrorAction SilentlyContinue
            if ($cmd) { return $cmd.Source }
        } elseif (Test-Path $c) {
            return $c
        }
    }
    return $null
}

$git = Find-Git
if (-not $git) {
    Write-Host ""
    Write-Host "Git이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "1. https://git-scm.com/download/win 에서 Git 설치"
    Write-Host "2. PowerShell을 다시 연 뒤 이 스크립트를 다시 실행하세요."
    Write-Host ""
    exit 1
}

Write-Host "Git: $git" -ForegroundColor Green
Write-Host "저장소: $remoteUrl" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    & $git init
    & $git branch -M main
}

& $git add .
$status = & $git status --porcelain
if ($status) {
    & $git commit -m "Initial commit: FitCoach AI OKR fitness web app"
    Write-Host "커밋 완료" -ForegroundColor Green
} else {
    Write-Host "커밋할 변경 사항 없음" -ForegroundColor Yellow
}

$remote = & $git remote get-url origin 2>$null
if (-not $remote) {
    & $git remote add origin $remoteUrl
    Write-Host "원격 저장소 연결됨" -ForegroundColor Green
} elseif ($remote -ne $remoteUrl) {
    & $git remote set-url origin $remoteUrl
    Write-Host "원격 저장소 URL 업데이트됨" -ForegroundColor Green
}

Write-Host "GitHub에 push 중..." -ForegroundColor Cyan
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "업로드 완료!" -ForegroundColor Green
    Write-Host $remoteUrl
} else {
    Write-Host ""
    Write-Host "Push 실패. GitHub 로그인이 필요할 수 있습니다." -ForegroundColor Yellow
    Write-Host "수동 실행:"
    Write-Host "  git push -u origin main"
    Write-Host ""
    exit 1
}
