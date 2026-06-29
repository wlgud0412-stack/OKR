/**
 * YouTube 검색 기반 — 삭제·비공개 영상 문제 방지
 * sp=EgIQAQ%253D%253D → 동영상만 필터
 */
function buildYoutubeSearchUrl(query) {
  return (
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(query) +
    "&sp=EgIQAQ%253D%253D"
  );
}

const EXERCISE_SEARCH_QUERIES = {
  벤치프레스: "벤치프레스 자세 Jeff Nippard",
  스쿼트: "바벨 스쿼트 자세",
  데드리프트: "데드리프트 자세",
  랫풀다운: "랫풀다운 자세",
  "바벨 로우": "바벨 로우 자세",
  "덤벨 컬": "덤벨 컬 자세",
  딥스: "딥스 운동 자세",
  "오버헤드 프레스": "오버헤드 프레스 자세",
  "숄더 프레스": "숄더 프레스 자세",
  "레그프레스": "레그프레스 자세",
  플랭크: "플랭크 자세",
  러닝: "러닝 폼 자세",
  스트레칭: "운동 후 스트레칭 10분",
  푸시업: "푸시업 자세",
};

function normalizeExerciseTitle(title) {
  return (title || "")
    .replace(/^인cline\s/i, "인클라인 ")
    .replace(/\s+/g, " ")
    .trim();
}

function getExerciseVideoUrl(title) {
  const key = normalizeExerciseTitle(title);
  if (EXERCISE_SEARCH_QUERIES[key]) {
    return buildYoutubeSearchUrl(EXERCISE_SEARCH_QUERIES[key]);
  }
  const partial = Object.keys(EXERCISE_SEARCH_QUERIES).find(
    (k) => key.includes(k) || k.includes(key)
  );
  if (partial) return buildYoutubeSearchUrl(EXERCISE_SEARCH_QUERIES[partial]);
  return buildYoutubeSearchUrl(key + " 운동 자세");
}

function renderWorkoutVideoLink(videoUrl, { compact = false } = {}) {
  const cls = compact ? "workout-video-link workout-video-link--compact" : "workout-video-link";
  return `<a href="${videoUrl.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer" class="${cls}" title="YouTube에서 관련 영상 검색">
    <span class="workout-video-icon" aria-hidden="true">▶</span>
    <span class="workout-video-label">관련영상</span>
  </a>`;
}
