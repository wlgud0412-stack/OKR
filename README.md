# FitCoach AI

OKR 기반 개인 맞춤형 피트니스 관리 웹 앱입니다. 운동 기록, 체중·체지방률 추적, 목표 달성률, AI 영양 분석을 한 곳에서 관리할 수 있습니다.

## 주요 기능

- **온보딩 & 목표 설정** — 프로필 입력 후 AI 맞춤 운동·식단 계획 생성
- **오늘 탭** — 날짜별 운동 체크리스트, 식단 기록, AI 피드백
- **기록 탭** — 운동·체중·체지방률 기록, 변화 그래프
- **진행률 탭** — 일일/주간 운동 달성률, 체중 변화
- **목표 탭** — 체중·체지방률 목표 카드, Key Results, 타임라인
- **달력** — 과거 날짜 조회 및 기록 수정

## 기술 스택

- Vanilla HTML / CSS / JavaScript
- `localStorage` 데이터 저장 (별도 서버·DB 불필요)
- Python `http.server`로 로컬 실행 가능

## 실행 방법

### 방법 1: 파일 직접 열기

`index.html`을 브라우저에서 엽니다.

### 방법 2: 로컬 서버 (권장)

```bash
cd fitcoach
py -m http.server 8080
```

브라우저에서 [http://localhost:8080](http://localhost:8080) 접속

## 프로젝트 구조

```
fitcoach/
├── index.html          # 메인 HTML
├── css/styles.css      # 스타일
├── js/
│   ├── data.js         # 상태·OKR·운동·영양 데이터 로직
│   ├── nutrition.js    # 음식 DB · AI 영양 분석
│   ├── charts.js       # SVG 꺾은선 그래프
│   └── app.js          # UI · 이벤트 · 렌더링
└── README.md
```

## 데이터 저장

모든 사용자 데이터는 브라우저 `localStorage` (`fitcoach_state` 키)에 저장됩니다. 브라우저 데이터를 삭제하면 기록이 초기화됩니다.

## GitHub & 배포

- 저장소: [wlgud0412-stack/OKR](https://github.com/wlgud0412-stack/OKR)
- Vercel: GitHub 연동 시 `main` push → 자동 배포

### 업데이트 방법 (매번)

```powershell
cd fitcoach
.\update.ps1 "변경 내용 설명"
```

자세한 내용: [UPDATE.md](./UPDATE.md)

### 최초 업로드

```powershell
.\publish-github.ps1
```

## 라이선스

MIT
