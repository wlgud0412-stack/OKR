/**
 * 식단·레시피 참고 YouTube 링크
 */
const MEAL_VIDEO_MAP = {
  "그릭요거트 & 계란 플레이트": "https://www.youtube.com/watch?v=U0lhNIBl3Hw",
  "오트밀 프로틴 볼": "https://www.youtube.com/watch?v=1o8oIcSgdWE",
  "닭가슴살 아침 샐러드": "https://www.youtube.com/watch?v=8YRYnOm1Nks",
  "현미밥 도시락": "https://www.youtube.com/watch?v=Hq9cU8xxBBY",
  "두부 현미 정식": "https://www.youtube.com/watch?v=JTfUfA1EJ0E",
  "연어 샐러드 보울": "https://www.youtube.com/watch?v=PIexHywdzYM",
  "생선 & 구운 채소": "https://www.youtube.com/watch?v=2s6-TlholPQ",
  "닭안심 야채 볶음": "https://www.youtube.com/watch?v=8YRYnOm1Nks",
  "두부 김치찌개 정식": "https://www.youtube.com/watch?v=6Yy5hPbYpN0",
  "벌크업 아침 세트": "https://www.youtube.com/watch?v=U0lhNIBl3Hw",
  "닭가슴살 도시락": "https://www.youtube.com/watch?v=Hq9cU8xxBBY",
  "소고기 비빔밥": "https://www.youtube.com/watch?v=6aW8XFXNEGA",
  "연어 덮밥": "https://www.youtube.com/watch?v=PIexHywdzYM",
  "계란말이 정식": "https://www.youtube.com/watch?v=U0lhNIBl3Hw",
  "콩나물국 & 잡곡밥": "https://www.youtube.com/watch?v=JTfUfA1EJ0E",
  "닭가슴살 현미비빔밥": "https://www.youtube.com/watch?v=Hq9cU8xxBBY",
  "제육볶음 현미 정식": "https://www.youtube.com/watch?v=6aW8XFXNEGA",
  "들기름 두부 샐러드": "https://www.youtube.com/watch?v=JTfUfA1EJ0E",
  "닭가슴살 채소볶음": "https://www.youtube.com/watch?v=8YRYnOm1Nks",
  "채소 볶음밥": "https://www.youtube.com/watch?v=3SyQ10B5yRc",
  "짜사이 닭가슴살": "https://www.youtube.com/watch?v=8YRYnOm1Nks",
  "마파두부 현미밥": "https://www.youtube.com/watch?v=JTfUfA1EJ0E",
  "유산슬 채소볶음": "https://www.youtube.com/watch?v=3SyQ10B5yRc",
  "군만두 & 샐러드": "https://www.youtube.com/watch?v=8YRYnOm1Nks",
  "짬뽕 국물 두부면": "https://www.youtube.com/watch?v=6Yy5hPbYpN0",
  "그릴드 치킨 샐러드": "https://www.youtube.com/watch?v=8YRYnOm1Nks",
  "오트밀 & 베리": "https://www.youtube.com/watch?v=1o8oIcSgdWE",
  "연어 아보카도 보울": "https://www.youtube.com/watch?v=PIexHywdzYM",
  "퀴노아 닭가슴살": "https://www.youtube.com/watch?v=Hq9cU8xxBBY",
  "스테이크 & 구운채소": "https://www.youtube.com/watch?v=6aW8XFXNEGA",
  "통밀 파스타 & 새우": "https://www.youtube.com/watch?v=PIexHywdzYM",
  "그릭요거트 & 그래놀라": "https://www.youtube.com/watch?v=U0lhNIBl3Hw",
  "연어 포케": "https://www.youtube.com/watch?v=PIexHywdzYM",
  "닭가슴살 덮밥": "https://www.youtube.com/watch?v=Hq9cU8xxBBY",
  "두부 채소 덮밥": "https://www.youtube.com/watch?v=JTfUfA1EJ0E",
  "참치 주먹밥": "https://www.youtube.com/watch?v=PIexHywdzYM",
  "연어 사시미 정식": "https://www.youtube.com/watch?v=PIexHywdzYM",
  "닭가슴살 유부초밥": "https://www.youtube.com/watch?v=Hq9cU8xxBBY",
  "균형 아침": "https://www.youtube.com/watch?v=U0lhNIBl3Hw",
  "균형 점심": "https://www.youtube.com/watch?v=Hq9cU8xxBBY",
  "균형 저녁": "https://www.youtube.com/watch?v=2s6-TlholPQ",
};

function getMealVideoUrl(mealName, cuisineLabel) {
  if (MEAL_VIDEO_MAP[mealName]) return MEAL_VIDEO_MAP[mealName];
  const query = cuisineLabel ? `${mealName} ${cuisineLabel} 레시피` : `${mealName} 레시피`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function renderMealVideoLink(videoUrl) {
  return renderWorkoutVideoLink(videoUrl, { compact: true });
}

function attachMealVideo(menu, cuisineLabel) {
  return {
    ...menu,
    videoUrl: menu.videoUrl || getMealVideoUrl(menu.name, cuisineLabel),
  };
}
