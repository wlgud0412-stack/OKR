# FitCoach AI — 업데이트 가이드

코드를 수정한 뒤 **Vercel에 자동 반영**하는 방법입니다.

## 한 줄 요약

```powershell
cd fitcoach
.\update.ps1 "변경 내용 설명"
```

→ GitHub push → Vercel 자동 배포 (1~2분) → **같은 URL**에 반영

---

## Cursor AI와 함께 업데이트하는 방법

### 1단계: AI에게 수정 요청

Cursor 채팅에서 원하는 기능을 설명합니다.

> 예: "기록 탭에 메모 기능 추가해줘"

### 2단계: 로컬에서 확인 (선택)

```powershell
cd fitcoach
py -m http.server 8080
```

[http://localhost:8080](http://localhost:8080) 에서 동작 확인

### 3단계: 배포

```powershell
.\update.ps1 "기록 탭 메모 기능 추가"
```

### 4단계: Vercel 확인

1~2분 후 Vercel URL을 **새로고침** (Ctrl+F5)

- **URL은 바뀌지 않습니다**
- `version.json` 버전이 올라가면 프로필 탭 하단에서 확인 가능

---

## 스크립트 설명

| 파일 | 용도 |
|------|------|
| `update.ps1` | **일반 업데이트** (매번 사용) |
| `publish-github.ps1` | 최초 1회 업로드 |
| `scripts/git-helper.ps1` | Git 공통 로직 |
| `version.json` | 앱 버전 (배포 시 자동 +1) |
| `deploy-config.json` | GitHub / Vercel 설정 |

### update.ps1 옵션

```powershell
# 기본 배포 (버전 자동 증가)
.\update.ps1 "UI 개선"

# 버전 번호 유지
.\update.ps1 -Message "문서만 수정" -NoBump
```

---

## 배포 흐름

```
코드 수정 (Cursor AI)
       ↓
update.ps1 실행
       ↓
version.json 패치 버전 +1
       ↓
git add → commit → push
       ↓
GitHub (wlgud0412-stack/OKR)
       ↓
Vercel 자동 재배포
       ↓
기존 Vercel URL에 반영
```

---

## Vercel 자동 배포 조건

Vercel 프로젝트가 GitHub 저장소와 연결되어 있어야 합니다.

- 저장소: [github.com/wlgud0412-stack/OKR](https://github.com/wlgud0412-stack/OKR)
- `main` 브랜치 push 시 자동 배포

연결이 안 되어 있다면 [vercel.com](https://vercel.com) → Import Project → OKR 저장소 선택

---

## 사용자 데이터 참고

앱 데이터는 각 사용자 **브라우저 localStorage**에 저장됩니다.

- 배포(업데이트)해도 **기존 사용자 기록은 유지**됩니다
- 단, 브라우저 캐시 때문에 JS/CSS가 안 바뀌면 **Ctrl+F5** 강력 새로고침

---

## 문제 해결

| 문제 | 해결 |
|------|------|
| `git` 명령 없음 | [Git 설치](https://git-scm.com/download/win) 후 PowerShell 재시작 |
| Push 실패 | GitHub 로그인 / Personal Access Token 확인 |
| Vercel에 안 반영됨 | Vercel 대시보드 → Deployments 확인, 2~3분 대기 |
| 버전이 안 바뀜 | 프로필 탭 하단 버전 표시 확인, Ctrl+F5 |
