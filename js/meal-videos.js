/**
 * 식단 레시피 YouTube 검색 링크
 */
const MEAL_SEARCH_QUERIES = {
  "닭가슴살 현미비빔밥": "닭가슴살 다이어트 도시락 레시피",
  "현미밥 도시락": "다이어트 현미밥 도시락",
  "두부 김치찌개 정식": "두부 김치찌개 다이어트",
  "연어 덮밥": "연어 덮밥 레시피",
  "소고기 비빔밥": "소고기 비빔밥 레시피",
  "그릴드 치킨 샐러드": "그릴드 치킨 샐러드 레시피",
  "오트밀 & 베리": "다이어트 오트밀 레시피",
  "연어 포케": "연어 포케 레시피",
  "마파두부 현미밥": "마파두부 레시피",
  "계란말이 정식": "계란말이 다이어트",
};

function getMealVideoUrl(mealName, cuisineLabel) {
  if (MEAL_SEARCH_QUERIES[mealName]) {
    return buildYoutubeSearchUrl(MEAL_SEARCH_QUERIES[mealName]);
  }
  const query = cuisineLabel
    ? `${mealName} ${cuisineLabel} 다이어트 레시피`
    : `${mealName} 건강 레시피`;
  return buildYoutubeSearchUrl(query);
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
