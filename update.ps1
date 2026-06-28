# FitCoach AI — 업데이트 & 배포 스크립트
#
# 사용법:
#   .\update.ps1                          # 기본 메시지로 배포
#   .\update.ps1 "운동 UI 개선"           # 커밋 메시지 지정
#   .\update.ps1 -Message "버그 수정" -NoBump   # 버전 번호 유지
#
# 흐름: 코드 수정 → 이 스크립트 실행 → GitHub push → Vercel 자동 배포 (1~2분)

param(
    [Parameter(Position = 0)]
    [string]$Message = "Update FitCoach AI",

    [switch]$NoBump
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $RepoRoot "scripts\git-helper.ps1")

Write-Host ""
Write-Host "=== FitCoach AI 업데이트 배포 ===" -ForegroundColor Green
Write-Host ""

$ok = Invoke-GitDeploy -RepoRoot $RepoRoot -CommitMessage $Message -BumpVersion:(-not $NoBump)

if ($ok) {
    Write-Host ""
    Write-Host "1~2분 후 Vercel URL을 새로고침하면 업데이트가 반영됩니다." -ForegroundColor Yellow
    Write-Host ""
}
