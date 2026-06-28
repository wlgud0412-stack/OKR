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

function Get-DeployConfig {
    param([string]$RepoRoot)
    $path = Join-Path $RepoRoot "deploy-config.json"
    if (Test-Path $path) {
        return Get-Content $path -Raw | ConvertFrom-Json
    }
    return [pscustomobject]@{
        githubRemote = "https://github.com/wlgud0412-stack/OKR.git"
        branch       = "main"
        vercelNote   = "GitHub push 후 Vercel이 자동 배포합니다."
    }
}

function Invoke-GitDeploy {
    param(
        [string]$RepoRoot,
        [string]$CommitMessage,
        [switch]$BumpVersion
    )

    $git = Find-Git
    if (-not $git) {
        Write-Host "Git이 설치되어 있지 않습니다: https://git-scm.com/download/win" -ForegroundColor Red
        exit 1
    }

    Set-Location $RepoRoot
    $config = Get-DeployConfig -RepoRoot $RepoRoot

    if ($BumpVersion) {
        $versionPath = Join-Path $RepoRoot "version.json"
        if (Test-Path $versionPath) {
            $version = Get-Content $versionPath -Raw | ConvertFrom-Json
            $parts = $version.version.Split(".")
            if ($parts.Length -ge 3) {
                $parts[2] = [string]([int]$parts[2] + 1)
                $version.version = $parts -join "."
            }
            $version.updated = Get-Date -Format "yyyy-MM-dd"
            $version | ConvertTo-Json | Set-Content $versionPath -Encoding UTF8
            Write-Host "버전: v$($version.version) ($($version.updated))" -ForegroundColor Cyan
        }
    }

    if (-not (Test-Path ".git")) {
        & $git init
        & $git branch -M $config.branch
    }

    $remote = & $git remote get-url origin 2>$null
    if (-not $remote) {
        & $git remote add origin $config.githubRemote
    } elseif ($remote -ne $config.githubRemote) {
        & $git remote set-url origin $config.githubRemote
    }

    & $git add .
    $status = & $git status --porcelain
    if (-not $status) {
        Write-Host "변경된 파일이 없습니다." -ForegroundColor Yellow
        return $false
    }

    & $git -c user.name="wlgud0412-stack" -c user.email="wlgud0412-stack@users.noreply.github.com" `
        commit -m $CommitMessage

    Write-Host "GitHub에 push 중..." -ForegroundColor Cyan
    & $git push -u origin $config.branch

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Push 실패. GitHub 로그인 후 다시 시도하세요." -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "GitHub 업로드 완료!" -ForegroundColor Green
    Write-Host $config.githubRemote -ForegroundColor DarkGray
    Write-Host $config.vercelNote -ForegroundColor Cyan
    return $true
}
