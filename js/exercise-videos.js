/**
 * 운동별 폼·자세 참고용 YouTube 링크 (Jeff Nippard, Scott Herman 등 검증된 튜토리얼)
 */
const EXERCISE_VIDEO_MAP = {
  벤치프레스: "https://www.youtube.com/watch?v=4Y2ZdHCOXok",
  "인클라인 벤치프레스": "https://www.youtube.com/watch?v=8iPEnn-ltC8",
  "인클라인 덤벨 프레스": "https://www.youtube.com/watch?v=8iPEnn-ltC8",
  "덤벨 프레스": "https://www.youtube.com/watch?v=VmB8cNGR2AE",
  스쿼트: "https://www.youtube.com/watch?v=ultWZbUMPL8",
  "점프 스쿼트": "https://www.youtube.com/watch?v=U4s4m_5myrk",
  데드리프트: "https://www.youtube.com/watch?v=VL5Ab0T07e4",
  "루마니안 데드리프트": "https://www.youtube.com/watch?v=jEy_CZB_k9U",
  랫풀다운: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
  "풀업/랫풀다운": "https://www.youtube.com/watch?v=CAwf7n6Luuc",
  "바벨 로우": "https://www.youtube.com/watch?v=9efgcAjQe7E",
  "시티드 로우": "https://www.youtube.com/watch?v=GZbfZ033f74",
  "덤벨 컬": "https://www.youtube.com/watch?v=ykJmrVN9QRU",
  딥스: "https://www.youtube.com/watch?v=2z8JmcrW-4I",
  "딥스(의자)": "https://www.youtube.com/watch?v=jox27jxFOAQ",
  "케이블 트라이셉스": "https://www.youtube.com/watch?v=2-LAMcpzODU",
  "오버헤드 프레스": "https://www.youtube.com/watch?v=2yjwXTZQxBg",
  "숄더 프레스": "https://www.youtube.com/watch?v=2yjwXTZQxBg",
  "레그프레스": "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
  "레그 컬": "https://www.youtube.com/watch?v=1Tq3QdGukgU",
  런지: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
  "힙 쓰러스트": "https://www.youtube.com/watch?v=LmBAL_!YjZ4",
  "글루트 브릿지": "https://www.youtube.com/watch?v=wPM8icPu6SM",
  "카프 레이즈": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
  플랭크: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
  "케이블 크런치": "https://www.youtube.com/watch?v=2crjXCH-a20",
  "페이스 풀": "https://www.youtube.com/watch?v=rep-qVOAyqk",
  푸시업: "https://www.youtube.com/watch?v=IODxDxX7oi4",
  "와이드 푸시업": "https://www.youtube.com/watch?v=0pk2Ok42RRA",
  "다이아몬드 푸시업": "https://www.youtube.com/watch?v=J0DnG1_S92I",
  "마운틴 클라이머": "https://www.youtube.com/watch?v=cnyTQDSE884",
  러닝: "https://www.youtube.com/watch?v=_kGESn8SulA",
  스트레칭: "https://www.youtube.com/watch?v=g_tea8ZNk5A",
  "케이블 플라이": "https://www.youtube.com/watch?v=Iwe6AmxVfzY",
  "펙덱 플라이": "https://www.youtube.com/watch?v=Iwe6AmxVfzY",
  "인클라인 푸시업": "https://www.youtube.com/watch?v=cfns5VDVVvk",
  풀업: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
  "사이드 레터럴 레이즈": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
  "프론트 레이즈": "https://www.youtube.com/watch?v=2yjwXTZQxBg",
  "리어 델트 플라이": "https://www.youtube.com/watch?v=rep-qVOAyqk",
  "아놀드 프레스": "https://www.youtube.com/watch?v=2yjwXTZQxBg",
  "해머 컬": "https://www.youtube.com/watch?v=zC9nLlNvVpE",
  "스컬크러셔": "https://www.youtube.com/watch?v=2-LAMcpzODU",
  "바벨 컬": "https://www.youtube.com/watch?v=ykJmrVN9QRU",
  "오버헤드 익스텐션": "https://www.youtube.com/watch?v=2-LAMcpzODU",
  "행잉 레그 레이즈": "https://www.youtube.com/watch?v=JB2oyAo0aeE",
  "데드버그": "https://www.youtube.com/watch?v=4Xle-jAJZ0o",
  "러시안 트위스트": "https://www.youtube.com/watch?v=wkD8rjkodUI",
  크런치: "https://www.youtube.com/watch?v=2pLT-olgUJs",
  "레그 레이즈": "https://www.youtube.com/watch?v=JB2oyAo0aeE",
  사이클: "https://www.youtube.com/watch?v=NwwDBRKQpt0",
  로잉: "https://www.youtube.com/watch?v=GZbfZ033f74",
  줄넘기: "https://www.youtube.com/watch?v=1BZM-7kZPZw",
  버피: "https://www.youtube.com/watch?v=TU8QYVW0gDU",
  "피크 푸시업": "https://www.youtube.com/watch?v=spoSDabe6aU",
};

function normalizeExerciseTitle(title) {
  return (title || "")
    .replace(/^인cline\s/i, "인클라인 ")
    .replace(/\s+/g, " ")
    .trim();
}

function getExerciseVideoUrl(title) {
  const key = normalizeExerciseTitle(title);
  if (EXERCISE_VIDEO_MAP[key]) return EXERCISE_VIDEO_MAP[key];

  const partial = Object.keys(EXERCISE_VIDEO_MAP).find(
    (k) => key.includes(k) || k.includes(key)
  );
  if (partial) return EXERCISE_VIDEO_MAP[partial];

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(key + " 자세")}`;
}

function renderWorkoutVideoLink(videoUrl, { compact = false } = {}) {
  const cls = compact ? "workout-video-link workout-video-link--compact" : "workout-video-link";
  return `<a href="${videoUrl.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer" class="${cls}" title="YouTube에서 동작 영상 보기">
    <span class="workout-video-icon" aria-hidden="true">▶</span>
    <span class="workout-video-label">관련영상</span>
  </a>`;
}
