const MEAL_CUISINE_TYPES = [
  { id: "korean", label: "한식", icon: "🇰🇷" },
  { id: "chinese", label: "중식", icon: "🥡" },
  { id: "western", label: "양식", icon: "🍝" },
  { id: "japanese", label: "일식", icon: "🍣" },
];

const MEAL_PURPOSE_TYPES = [
  { id: "diet", label: "다이어트", desc: "저칼로리 · 고단백", profileMatch: ["다이어트"] },
  { id: "bulk", label: "근비대", desc: "고칼로리 · 고단백", profileMatch: ["근비대"] },
  { id: "balance", label: "균형", desc: "유지 · 체력 향상", profileMatch: ["체력 향상", "유지"] },
];

const MEAL_CUISINE_CATALOG = {
  korean: {
    diet: {
      breakfast: [
        { name: "계란말이 정식", tip: "고단백 한식 아침", items: ["계란 2개", "시금치 나물", "방울토마토"], nutrition: { calories: 280, protein: 22, carbs: 12, fat: 16 } },
        { name: "콩나물국 & 잡곡밥", tip: "담백한 아침", items: ["콩나물국 1그릇", "잡곡밥 1/3공기", "김치"], nutrition: { calories: 300, protein: 14, carbs: 42, fat: 8 } },
        { name: "두부 김치찌개 정식", tip: "포만감 아침", items: ["김치찌개 1인분", "두부 100g", "현미밥 1/3공기"], nutrition: { calories: 320, protein: 20, carbs: 32, fat: 12 } },
      ],
      lunch: [
        { name: "닭가슴살 현미비빔밥", tip: "대표 다이어트 한식", items: ["현미밥 2/3공기", "닭가슴살 150g", "나물 3종"], nutrition: { calories: 520, protein: 45, carbs: 52, fat: 10 } },
        { name: "현미밥 도시락", tip: "균형 도시락", items: ["현미밥 2/3공기", "닭가슴살 150g", "나물·김치"], nutrition: { calories: 500, protein: 42, carbs: 50, fat: 12 } },
        { name: "들기름 두부 샐러드", tip: "식물성 단백질", items: ["두부 200g", "채소 샐러드", "들기름 1t"], nutrition: { calories: 380, protein: 26, carbs: 18, fat: 22 } },
      ],
      dinner: [
        { name: "닭가슴살 채소볶음", tip: "가벼운 저녁", items: ["닭가슴살 150g", "양파·파프리카", "두부 80g"], nutrition: { calories: 360, protein: 42, carbs: 16, fat: 14 } },
        { name: "생선 & 구운 채소", tip: "저탄수 저녁", items: ["흰살생선 150g", "브로콜리", "삶은 계란 1개"], nutrition: { calories: 340, protein: 38, carbs: 12, fat: 14 } },
        { name: "두부 김치찌개 정식", tip: "포만감 저녁", items: ["김치찌개", "두부 150g", "현미밥 1/3공기"], nutrition: { calories: 400, protein: 28, carbs: 35, fat: 16 } },
      ],
    },
    bulk: {
      breakfast: [
        { name: "벌크업 아침 세트", tip: "탄수·단백 풍부", items: ["현미밥 1/2공기", "계란 3개", "바나나", "우유"], nutrition: { calories: 580, protein: 32, carbs: 72, fat: 18 } },
        { name: "계란말이 정식", tip: "고단백 아침", items: ["계란 3개", "잡곡밥 1/2공기", "나물"], nutrition: { calories: 520, protein: 30, carbs: 48, fat: 20 } },
      ],
      lunch: [
        { name: "제육볶음 현미 정식", tip: "고칼로리 점심", items: ["현미밥 1공기", "돼지고기 150g", "김치·나물"], nutrition: { calories: 720, protein: 38, carbs: 78, fat: 28 } },
        { name: "소고기 비빔밥", tip: "근육 회복", items: ["현미밥 1공기", "소고기 150g", "나물 3종"], nutrition: { calories: 680, protein: 42, carbs: 75, fat: 22 } },
        { name: "닭가슴살 도시락", tip: "고단백 점심", items: ["현미밥 1공기", "닭가슴살 200g", "나물"], nutrition: { calories: 650, protein: 55, carbs: 68, fat: 14 } },
      ],
      dinner: [
        { name: "연어 덮밥", tip: "운동 후 회복", items: ["현미밥 1공기", "연어 180g", "김·김치"], nutrition: { calories: 620, protein: 44, carbs: 62, fat: 22 } },
        { name: "닭가슴살 덮밥", tip: "단백질 보충", items: ["현미밥 1공기", "닭가슴살 180g", "나물"], nutrition: { calories: 600, protein: 50, carbs: 65, fat: 12 } },
      ],
    },
    balance: {
      breakfast: [
        { name: "계란말이 정식", tip: "균형 아침", items: ["계란 2개", "잡곡밥 1/3공기", "나물"], nutrition: { calories: 380, protein: 20, carbs: 38, fat: 16 } },
        { name: "콩나물국 & 잡곡밥", tip: "담백 아침", items: ["콩나물국", "잡곡밥 1/2공기", "김치"], nutrition: { calories: 350, protein: 16, carbs: 52, fat: 8 } },
      ],
      lunch: [
        { name: "현미밥 도시락", tip: "균형 점심", items: ["현미밥 1공기", "닭가슴살 120g", "나물·김치"], nutrition: { calories: 550, protein: 38, carbs: 62, fat: 14 } },
        { name: "닭가슴살 현미비빔밥", tip: "비빔밥", items: ["현미밥", "닭가슴살 120g", "나물"], nutrition: { calories: 540, protein: 40, carbs: 58, fat: 14 } },
      ],
      dinner: [
        { name: "생선 & 구운 채소", tip: "균형 저녁", items: ["생선 150g", "구운 채소", "고구마 1/2"], nutrition: { calories: 480, protein: 35, carbs: 42, fat: 16 } },
        { name: "두부 김치찌개 정식", tip: "한식 저녁", items: ["김치찌개", "두부", "현미밥 1/2"], nutrition: { calories: 460, protein: 26, carbs: 48, fat: 16 } },
      ],
    },
  },
  chinese: {
    diet: {
      breakfast: [
        { name: "계란말이 정식", tip: "중식풍 아침", items: ["계란 2개", "파", "채소"], nutrition: { calories: 260, protein: 18, carbs: 10, fat: 16 } },
        { name: "채소 볶음밥", tip: "저칼로리", items: ["현미밥 1/3공기", "채소", "계란 1개"], nutrition: { calories: 320, protein: 14, carbs: 42, fat: 10 } },
      ],
      lunch: [
        { name: "짜사이 닭가슴살", tip: "고단백 중식", items: ["닭가슴살 150g", "짜사이", "현미밥 2/3공기"], nutrition: { calories: 480, protein: 42, carbs: 48, fat: 12 } },
        { name: "마파두부 현미밥", tip: "두부 단백질", items: ["두부 200g", "현미밥 2/3공기", "채소"], nutrition: { calories: 460, protein: 28, carbs: 50, fat: 16 } },
        { name: "유산슬 채소볶음", tip: "채소 위주", items: ["채소 볶음", "닭가슴살 100g", "현미밥 1/2"], nutrition: { calories: 420, protein: 32, carbs: 45, fat: 12 } },
      ],
      dinner: [
        { name: "짬뽕 국물 두부면", tip: "저탄수", items: ["두부면", "해물·채소", "계란"], nutrition: { calories: 380, protein: 32, carbs: 22, fat: 16 } },
        { name: "군만두 & 샐러드", tip: "가벼운 저녁", items: ["군만두 5개", "샐러드", "저염 소스"], nutrition: { calories: 360, protein: 22, carbs: 38, fat: 14 } },
      ],
    },
    bulk: {
      breakfast: [{ name: "채소 볶음밥", tip: "에너지 아침", items: ["현미밥 1/2공기", "계란 2개", "채소·고기"], nutrition: { calories: 520, protein: 24, carbs: 62, fat: 18 } }],
      lunch: [
        { name: "제육볶음 현미 정식", tip: "고칼로리", items: ["현미밥 1공기", "돼지고기", "김치"], nutrition: { calories: 700, protein: 36, carbs: 75, fat: 28 } },
        { name: "마파두부 현미밥", tip: "단백·탄수", items: ["두부 250g", "현미밥 1공기", "고기 80g"], nutrition: { calories: 640, protein: 38, carbs: 72, fat: 20 } },
      ],
      dinner: [{ name: "닭가슴살 덮밥", tip: "회복 식사", items: ["현미밥 1공기", "닭가슴살 180g", "채소"], nutrition: { calories: 580, protein: 48, carbs: 62, fat: 14 } }],
    },
    balance: {
      breakfast: [{ name: "계란말이 정식", tip: "균형", items: ["계란 2개", "채소", "잡곡밥 1/3"], nutrition: { calories: 360, protein: 20, carbs: 36, fat: 14 } }],
      lunch: [{ name: "유산슬 채소볶음", tip: "균형 중식", items: ["채소", "닭 120g", "현미밥 2/3"], nutrition: { calories: 520, protein: 36, carbs: 55, fat: 14 } }],
      dinner: [{ name: "마파두부 현미밥", tip: "담백 저녁", items: ["두부 180g", "현미밥 1/2", "채소"], nutrition: { calories: 460, protein: 26, carbs: 52, fat: 14 } }],
    },
  },
  western: {
    diet: {
      breakfast: [
        { name: "그릭요거트 & 계란 플레이트", tip: "서양식 아침", items: ["그릭요거트", "계란 2개", "베리"], nutrition: { calories: 300, protein: 26, carbs: 22, fat: 12 } },
        { name: "오트밀 & 베리", tip: "복합 탄수", items: ["오트밀", "블루베리", "아몬드"], nutrition: { calories: 340, protein: 12, carbs: 48, fat: 12 } },
      ],
      lunch: [
        { name: "그릴드 치킨 샐러드", tip: "저칼로리", items: ["닭가슴살 150g", "믹스 샐러드", "발사믹"], nutrition: { calories: 380, protein: 42, carbs: 18, fat: 16 } },
        { name: "연어 아보카도 보울", tip: "오메가3", items: ["연어 120g", "아보카도", "샐러드"], nutrition: { calories: 450, protein: 32, carbs: 20, fat: 28 } },
        { name: "퀴노아 닭가슴살", tip: "고단백", items: ["퀴노아", "닭가슴살 150g", "채소"], nutrition: { calories: 480, protein: 40, carbs: 45, fat: 14 } },
      ],
      dinner: [
        { name: "스테이크 & 구운채소", tip: "단백질 중심", items: ["소고기 120g", "구운 채소", "샐러드"], nutrition: { calories: 420, protein: 38, carbs: 15, fat: 24 } },
        { name: "그릴드 치킨 샐러드", tip: "가벼운 저녁", items: ["닭가슴살 150g", "샐러드"], nutrition: { calories: 360, protein: 40, carbs: 12, fat: 16 } },
      ],
    },
    bulk: {
      breakfast: [
        { name: "오트밀 & 베리", tip: "벌크 아침", items: ["오트밀 1.5인분", "바나나", "견과", "우유"], nutrition: { calories: 550, protein: 18, carbs: 78, fat: 18 } },
        { name: "그릭요거트 & 그래놀라", tip: "고칼로리", items: ["그릭요거트 250g", "그래놀라", "꿀"], nutrition: { calories: 480, protein: 28, carbs: 58, fat: 16 } },
      ],
      lunch: [
        { name: "연어 아보카도 보울", tip: "고단백", items: ["연어 180g", "현미", "아보카도"], nutrition: { calories: 650, protein: 42, carbs: 55, fat: 32 } },
        { name: "통밀 파스타 & 새우", tip: "탄수 보충", items: ["통밀 파스타", "새우 150g", "올리브오일"], nutrition: { calories: 620, protein: 38, carbs: 72, fat: 20 } },
      ],
      dinner: [{ name: "스테이크 & 구운채소", tip: "고단백", items: ["소고기 180g", "고구마", "채소"], nutrition: { calories: 580, protein: 44, carbs: 42, fat: 26 } }],
    },
    balance: {
      breakfast: [{ name: "그릭요거트 & 계란 플레이트", tip: "균형", items: ["그릭요거트", "계란 2개", "토스트 1장"], nutrition: { calories: 420, protein: 24, carbs: 35, fat: 18 } }],
      lunch: [{ name: "퀴노아 닭가슴살", tip: "균형", items: ["퀴노아", "닭 120g", "채소"], nutrition: { calories: 520, protein: 38, carbs: 52, fat: 14 } }],
      dinner: [{ name: "연어 아보카도 보울", tip: "균형", items: ["연어 150g", "샐러드", "고구마"], nutrition: { calories: 500, protein: 36, carbs: 38, fat: 24 } }],
    },
  },
  japanese: {
    diet: {
      breakfast: [
        { name: "닭가슴살 유부초밥", tip: "일식 아침", items: ["유부초밥 2개", "닭가슴살", "미역국"], nutrition: { calories: 320, protein: 24, carbs: 38, fat: 8 } },
        { name: "계란말이 정식", tip: "담백", items: ["계란말이", "나물", "현미밥 1/3"], nutrition: { calories: 290, protein: 18, carbs: 28, fat: 12 } },
      ],
      lunch: [
        { name: "연어 포케", tip: "신선한 한 끼", items: ["연어 120g", "현미밥 2/3", "김·와사비"], nutrition: { calories: 460, protein: 34, carbs: 48, fat: 14 } },
        { name: "닭가슴살 덮밥", tip: "고단백", items: ["현미밥 2/3", "닭가슴살 150g", "나물"], nutrition: { calories: 500, protein: 42, carbs: 52, fat: 10 } },
        { name: "두부 채소 덮밥", tip: "식물성", items: ["두부 180g", "현미밥 1/2", "채소"], nutrition: { calories: 440, protein: 26, carbs: 50, fat: 14 } },
      ],
      dinner: [
        { name: "연어 사시미 정식", tip: "저지방", items: ["연어 150g", "샐러드", "미소국"], nutrition: { calories: 380, protein: 36, carbs: 18, fat: 18 } },
        { name: "참치 주먹밥", tip: "간편", items: ["참치", "현미 주먹밥 2개", "김"], nutrition: { calories: 360, protein: 28, carbs: 42, fat: 10 } },
      ],
    },
    bulk: {
      breakfast: [{ name: "닭가슴살 유부초밥", tip: "에너지", items: ["유부초밥 3개", "계란", "우동국"], nutrition: { calories: 520, protein: 28, carbs: 68, fat: 14 } }],
      lunch: [
        { name: "연어 덮밥", tip: "벌크", items: ["현미밥 1공기", "연어 180g", "김"], nutrition: { calories: 620, protein: 42, carbs: 65, fat: 20 } },
        { name: "닭가슴살 덮밥", tip: "고단백", items: ["현미밥 1공기", "닭 200g", "나물"], nutrition: { calories: 640, protein: 52, carbs: 68, fat: 12 } },
      ],
      dinner: [{ name: "연어 포케", tip: "회복", items: ["연어 180g", "현미밥 1공기", "아보카도"], nutrition: { calories: 580, protein: 40, carbs: 58, fat: 22 } }],
    },
    balance: {
      breakfast: [{ name: "계란말이 정식", tip: "균형", items: ["계란", "나물", "현미밥 1/2"], nutrition: { calories: 380, protein: 20, carbs: 42, fat: 14 } }],
      lunch: [{ name: "연어 포케", tip: "균형", items: ["연어 150g", "현미밥 2/3", "나물"], nutrition: { calories: 520, protein: 36, carbs: 55, fat: 16 } }],
      dinner: [{ name: "두부 채소 덮밥", tip: "담백", items: ["두부", "현미밥 2/3", "채소"], nutrition: { calories: 460, protein: 24, carbs: 52, fat: 14 } }],
    },
  },
};

function getPurposeKeyFromProfile(profile) {
  if (profile?.purpose === "다이어트") return "diet";
  if (profile?.purpose === "근비대") return "bulk";
  return "balance";
}

function getDefaultPurposeId(profile) {
  return getPurposeKeyFromProfile(profile);
}

function getCuisineLabel(cuisineId) {
  return MEAL_CUISINE_TYPES.find((c) => c.id === cuisineId)?.label || "";
}

function getMealsByCuisineAndPurpose(cuisineId, purposeId) {
  const cuisine = MEAL_CUISINE_CATALOG[cuisineId];
  if (!cuisine) return { breakfast: [], lunch: [], dinner: [] };
  const purpose = cuisine[purposeId] || cuisine.balance || {};
  const label = getCuisineLabel(cuisineId);
  return {
    breakfast: (purpose.breakfast || []).map((m) => attachMealVideo(m, label)),
    lunch: (purpose.lunch || []).map((m) => attachMealVideo(m, label)),
    dinner: (purpose.dinner || []).map((m) => attachMealVideo(m, label)),
  };
}

function getFlatMealsList(cuisineId, purposeId) {
  const grouped = getMealsByCuisineAndPurpose(cuisineId, purposeId);
  return ["breakfast", "lunch", "dinner"].flatMap((type) =>
    grouped[type].map((m) => ({ ...m, mealType: type, itemsText: m.items.join(" · ") }))
  );
}

function applyCatalogMeal(state, dateStr, mealType, menu) {
  const itemsText = menu.itemsText || menu.items.join(" · ");
  state.mealLog = (state.mealLog || []).filter(
    (m) => !(m.date === dateStr && m.mealType === mealType && m.recommended)
  );
  state.mealLog.push({
    id: Date.now() + Math.random() * 1000,
    mealType,
    name: menu.name + " (" + itemsText + ")",
    nutrition: { ...menu.nutrition },
    confidence: "high",
    matched: "meal-catalog",
    date: dateStr,
    recommended: true,
    videoUrl: menu.videoUrl,
  });
  return 1;
}

function pickMenuFromCatalog(cuisineId, purposeId, mealType, budget, options = {}) {
  const grouped = getMealsByCuisineAndPurpose(cuisineId, purposeId);
  const menus = grouped[mealType] || [];
  return pickMenuForMeal(menus, budget, options);
}
