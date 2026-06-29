/**
 * 헬스·다이어트 식단 참고: 끼니별 단백질·복합탄수 위주 구성
 * (TDEE 대비 500kcal 적자, 단백질 체중당 1.6~2.2g 권장 — 업계 일반 가이드)
 */

const MEAL_MENU_LIBRARY = {
  diet: {
    breakfast: [
      {
        name: "그릭요거트 & 계란 플레이트",
        description: "단백질 위주 가벼운 아침",
        items: ["삶은 계란 2개", "그릭요거트 150g", "바나나 1/2개"],
        nutrition: { calories: 320, protein: 28, carbs: 28, fat: 10 },
      },
      {
        name: "오트밀 프로틴 볼",
        description: "복합 탄수 + 단백질",
        items: ["오트밀 1인분", "삶은 계란 2개", "아몬드 한 줌"],
        nutrition: { calories: 380, protein: 24, carbs: 42, fat: 14 },
      },
      {
        name: "닭가슴살 아침 샐러드",
        description: "저칼로리 고단백",
        items: ["닭가슴살 100g", "샐러드 1인분", "삶은 계란 1개"],
        nutrition: { calories: 290, protein: 38, carbs: 12, fat: 8 },
      },
      {
        name: "통밀 토스트 & 계란",
        description: "간단 다이어트 아침",
        items: ["통밀 토스트 1장", "계란 2개", "방울토마토"],
        nutrition: { calories: 310, protein: 20, carbs: 28, fat: 12 },
      },
    ],
    lunch: [
      {
        name: "현미밥 도시락",
        description: "균형 잡힌 한 끼",
        items: ["현미밥 2/3공기", "닭가슴살 150g", "나물·김치"],
        nutrition: { calories: 520, protein: 42, carbs: 55, fat: 12 },
      },
      {
        name: "두부 현미 정식",
        description: "식물성 단백질 중심",
        items: ["현미밥 1/2공기", "두부 200g", "채소 볶음"],
        nutrition: { calories: 480, protein: 28, carbs: 52, fat: 14 },
      },
      {
        name: "연어 샐러드 보울",
        description: "오메가3 + 채소",
        items: ["연어 120g", "혼합 샐러드", "고구마 1/2개"],
        nutrition: { calories: 460, protein: 35, carbs: 38, fat: 18 },
      },
    ],
    dinner: [
      {
        name: "생선 & 구운 채소",
        description: "가볍게 마무리하는 저녁",
        items: ["흰살생선 150g", "브로콜리·버섯", "삶은 계란 1개"],
        nutrition: { calories: 350, protein: 38, carbs: 15, fat: 14 },
      },
      {
        name: "닭안심 야채 볶음",
        description: "탄수 최소화 저녁",
        items: ["닭가슴살 150g", "파프리카·양파", "두부 100g"],
        nutrition: { calories: 380, protein: 45, carbs: 18, fat: 12 },
      },
      {
        name: "두부 김치찌개 정식",
        description: "포만감 있는 단백질 저녁",
        items: ["김치찌개 1인분", "두부 150g", "현미밥 1/3공기"],
        nutrition: { calories: 400, protein: 28, carbs: 35, fat: 16 },
      },
    ],
  },
  bulk: {
    breakfast: [
      {
        name: "벌크업 아침 세트",
        description: "탄수·단백질 풍부",
        items: ["현미밥 1/2공기", "계란 3개", "바나나 1개", "우유 200ml"],
        nutrition: { calories: 580, protein: 32, carbs: 72, fat: 18 },
      },
      {
        name: "오트밀 & 프로틴",
        description: "운동 전 에너지 보충",
        items: ["오트밀 1.5인분", "프로틴 쉐이크 1잔", "견과류"],
        nutrition: { calories: 520, protein: 38, carbs: 58, fat: 16 },
      },
      {
        name: "토스트 & 스크램블 에그",
        description: "간편 고단백 아침",
        items: ["통밀 토스트 2장", "계란 3개", "아보카도 1/2개"],
        nutrition: { calories: 540, protein: 28, carbs: 42, fat: 28 },
      },
      {
        name: "그릭요거트 파르페",
        description: "가벼운 고단백 아침",
        items: ["그릭요거트 200g", "그래놀라", "블루베리", "아몬드"],
        nutrition: { calories: 450, protein: 32, carbs: 48, fat: 14 },
      },
    ],
    lunch: [
      {
        name: "닭가슴살 도시락",
        description: "고단백 점심",
        items: ["현미밥 1공기", "닭가슴살 200g", "나물·김치"],
        nutrition: { calories: 650, protein: 55, carbs: 68, fat: 14 },
      },
      {
        name: "소고기 비빔밥",
        description: "근육 회복용 점심",
        items: ["현미밥 1공기", "소고기 150g", "나물 3종"],
        nutrition: { calories: 680, protein: 42, carbs: 75, fat: 22 },
      },
      {
        name: "연어 덮밥",
        description: "오메가3 + 탄수 보충",
        items: ["현미밥 1공기", "연어 150g", "김·김치"],
        nutrition: { calories: 620, protein: 40, carbs: 65, fat: 20 },
      },
      {
        name: "닭·두부 덮밥",
        description: "이중 단백질 점심",
        items: ["현미밥 1공기", "닭가슴살 120g", "두부 100g", "나물"],
        nutrition: { calories: 590, protein: 48, carbs: 62, fat: 12 },
      },
    ],
    dinner: [
      {
        name: "연어 고구마 플레이트",
        description: "운동 후 회복 저녁",
        items: ["연어 180g", "고구마 1개", "아보카도 1/2개"],
        nutrition: { calories: 580, protein: 42, carbs: 45, fat: 26 },
      },
      {
        name: "닭·두부 듀오",
        description: "단백질 이중 공급",
        items: ["닭가슴살 150g", "두부 150g", "현미밥 2/3공기"],
        nutrition: { calories: 560, protein: 52, carbs: 48, fat: 16 },
      },
      {
        name: "소고기 스테이크 플레이트",
        description: "고단백 저녁",
        items: ["소고기 150g", "구운 채소", "고구마 1/2개"],
        nutrition: { calories: 540, protein: 44, carbs: 38, fat: 22 },
      },
      {
        name: "참치 현미볼",
        description: "간편 고단백 저녁",
        items: ["현미밥 2/3공기", "참치 1캔", "샐러드", "올리브오일"],
        nutrition: { calories: 500, protein: 38, carbs: 52, fat: 16 },
      },
    ],
  },
  default: {
    breakfast: [
      {
        name: "균형 아침",
        items: ["계란 2개", "토스트 1장", "우유 200ml", "사과 1/2개"],
        nutrition: { calories: 420, protein: 22, carbs: 45, fat: 16 },
      },
    ],
    lunch: [
      {
        name: "균형 점심",
        items: ["현미밥 1공기", "닭가슴살 120g", "샐러드", "김치"],
        nutrition: { calories: 550, protein: 38, carbs: 62, fat: 14 },
      },
    ],
    dinner: [
      {
        name: "균형 저녁",
        items: ["고구마 1개", "생선 150g", "채소 볶음"],
        nutrition: { calories: 480, protein: 35, carbs: 48, fat: 16 },
      },
    ],
  },
};

function getMealBudgets(targets) {
  return {
    breakfast: {
      calories: Math.round(targets.calories * 0.25),
      protein: Math.round(targets.protein * 0.25 * 10) / 10,
      carbs: Math.round(targets.carbs * 0.25 * 10) / 10,
      fat: Math.round(targets.fat * 0.25 * 10) / 10,
    },
    lunch: {
      calories: Math.round(targets.calories * 0.4),
      protein: Math.round(targets.protein * 0.4 * 10) / 10,
      carbs: Math.round(targets.carbs * 0.4 * 10) / 10,
      fat: Math.round(targets.fat * 0.4 * 10) / 10,
    },
    dinner: {
      calories: Math.round(targets.calories * 0.35),
      protein: Math.round(targets.protein * 0.35 * 10) / 10,
      carbs: Math.round(targets.carbs * 0.35 * 10) / 10,
      fat: Math.round(targets.fat * 0.35 * 10) / 10,
    },
  };
}

function fitsBudget(menu, budget) {
  const n = menu.nutrition;
  return (
    n.calories <= budget.calories &&
    n.protein <= budget.protein &&
    n.carbs <= budget.carbs &&
    n.fat <= budget.fat
  );
}

function pickBestMenu(menus, budget) {
  const fitting = menus.filter((m) => fitsBudget(m, budget));
  const pool = fitting.length > 0 ? fitting : menus;
  return pool.reduce((best, m) => {
    if (!best) return m;
    const diffBest = Math.abs(best.nutrition.calories - budget.calories * 0.85);
    const diffCur = Math.abs(m.nutrition.calories - budget.calories * 0.85);
    return diffCur < diffBest ? m : best;
  }, null);
}

function pickMenuForMeal(menus, budget, { random = false, excludeNames = [] } = {}) {
  const available = menus.filter((m) => !excludeNames.includes(m.name));
  const pool = available.length > 0 ? available : menus;
  const fitting = pool.filter((m) => fitsBudget(m, budget));
  const candidates = fitting.length > 0 ? fitting : pool;

  if (random && candidates.length > 1) {
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    return shuffled[0];
  }

  return pickBestMenu(candidates, budget);
}

function generateMealPlanRecommendation(state, dateStr, options = {}) {
  const nutrition = state.nutrition || createEmptyState().nutrition;
  const profile = state.profile;
  if (!nutrition?.calories?.target) return null;

  const targets = {
    calories: nutrition.calories.target,
    protein: nutrition.protein.target,
    carbs: nutrition.carbs.target,
    fat: nutrition.fat.target,
  };

  const purposeKey = options.purposeId || getPurposeKeyFromProfile(profile);
  const cuisines = MEAL_CUISINE_TYPES.map((c) => c.id);
  const cuisineId =
    options.cuisineId ||
    (options.random ? cuisines[Math.floor(Math.random() * cuisines.length)] : "korean");
  const cuisineLabel = getCuisineLabel(cuisineId);
  const purposeLabel =
    MEAL_PURPOSE_TYPES.find((p) => p.id === purposeKey)?.label || "균형";
  const budgets = getMealBudgets(targets);

  const previousMeals = options.previousRec?.meals;
  const random = Boolean(options.random);

  const meals = {};
  ["breakfast", "lunch", "dinner"].forEach((type) => {
    const excludeNames = random && previousMeals?.[type] ? [previousMeals[type].name] : [];
    const menu = pickMenuFromCatalog(cuisineId, purposeKey, type, budgets[type], {
      random,
      excludeNames,
    });
    if (menu) {
      meals[type] = {
        ...menu,
        mealType: type,
        itemsText: menu.items.join(" · "),
        videoUrl: menu.videoUrl,
      };
    }
  });

  const totals = roundNutrition(
    sumNutrition(Object.values(meals).map((m) => ({ nutrition: m.nutrition })))
  );

  const withinTargets =
    totals.calories <= targets.calories &&
    totals.protein <= targets.protein &&
    totals.carbs <= targets.carbs &&
    totals.fat <= targets.fat;

  return {
    date: dateStr,
    meals,
    totals,
    targets,
    withinTargets,
    cuisineId,
    purposeId: purposeKey,
    source: `${cuisineLabel} · ${purposeLabel} 맞춤 AI 추천`,
    generatedAt: new Date().toISOString(),
  };
}

function applyMealRecommendation(state, recommendation, mealTypes) {
  const dateStr = recommendation.date;
  const types = mealTypes || ["breakfast", "lunch", "dinner"];
  let added = 0;

  types.forEach((type) => {
    const meal = recommendation.meals[type];
    if (!meal) return;

    state.mealLog = (state.mealLog || []).filter(
      (m) => !(m.date === dateStr && m.mealType === type && m.recommended)
    );

    state.mealLog.push({
      id: Date.now() + Math.random() * 1000,
      mealType: type,
      name: meal.name + " (" + meal.itemsText + ")",
      nutrition: { ...meal.nutrition },
      confidence: "high",
      matched: "meal-plan",
      date: dateStr,
      recommended: true,
      videoUrl: meal.videoUrl || getMealVideoUrl(meal.name),
    });
    added++;
  });

  return added;
}
