const MEAL_LABELS = {
  breakfast: "아침",
  lunch: "점심",
  snack: "간식",
  dinner: "저녁",
};

const FOOD_DB = [
  { keywords: ["삶은 계란", "계란", "달걀", "반숙"], unit: "개", perUnit: { calories: 78, protein: 6, carbs: 0.5, fat: 5 } },
  { keywords: ["바나나"], unit: "개", perUnit: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 } },
  { keywords: ["제육볶음"], unit: "인분", perUnit: { calories: 450, protein: 28, carbs: 18, fat: 30 } },
  { keywords: ["공기밥", "백미밥", "흰밥"], unit: "공기", perUnit: { calories: 310, protein: 5.5, carbs: 68, fat: 0.5 } },
  { keywords: ["현미밥"], unit: "공기", perUnit: { calories: 280, protein: 6, carbs: 58, fat: 2 } },
  { keywords: ["프로틴 쉐이크", "프로tein", "단백질 쉐이크"], unit: "잔", perUnit: { calories: 120, protein: 24, carbs: 3, fat: 1.5 } },
  { keywords: ["닭가슴살"], unit: "g", perUnit: { calories: 1.65, protein: 0.31, carbs: 0, fat: 0.036 } },
  { keywords: ["사과"], unit: "개", perUnit: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 } },
  { keywords: ["우유"], unit: "ml", perUnit: { calories: 0.6, protein: 0.032, carbs: 0.048, fat: 0.032 } },
  { keywords: ["두부"], unit: "g", perUnit: { calories: 0.76, protein: 0.08, carbs: 0.019, fat: 0.048 } },
  { keywords: ["김치찌개"], unit: "인분", perUnit: { calories: 180, protein: 12, carbs: 8, fat: 11 } },
  { keywords: ["샐러드"], unit: "인분", perUnit: { calories: 80, protein: 3, carbs: 10, fat: 3 } },
  { keywords: ["라면", "라멘"], unit: "개", perUnit: { calories: 500, protein: 10, carbs: 65, fat: 22 } },
  { keywords: ["오트밀"], unit: "인분", perUnit: { calories: 150, protein: 5, carbs: 27, fat: 3 } },
  { keywords: ["고구마"], unit: "개", perUnit: { calories: 130, protein: 2, carbs: 30, fat: 0.2 } },
  { keywords: ["연어", "연어구이"], unit: "g", perUnit: { calories: 2.08, protein: 0.2, carbs: 0, fat: 0.13 } },
  { keywords: ["아몬드"], unit: "g", perUnit: { calories: 5.79, protein: 0.21, carbs: 0.22, fat: 0.5 } },
  { keywords: ["그릭요거트"], unit: "g", perUnit: { calories: 0.59, protein: 0.1, carbs: 0.036, fat: 0.004 } },
  { keywords: ["빵", "식빵", "토스트"], unit: "장", perUnit: { calories: 80, protein: 3, carbs: 14, fat: 1.2 } },
  { keywords: ["치킨", "후라이드"], unit: "조각", perUnit: { calories: 320, protein: 22, carbs: 12, fat: 20 } },
  { keywords: ["비빔밥"], unit: "인분", perUnit: { calories: 550, protein: 18, carbs: 75, fat: 18 } },
  { keywords: ["김밥"], unit: "줄", perUnit: { calories: 350, protein: 10, carbs: 52, fat: 10 } },
  { keywords: ["커피", "아메리카노"], unit: "잔", perUnit: { calories: 5, protein: 0.3, carbs: 0.5, fat: 0 } },
  { keywords: ["라떼"], unit: "잔", perUnit: { calories: 120, protein: 6, carbs: 10, fat: 5 } },
];

function parseQuantity(text) {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(g|그램|ml|ML|mL)/i,
    /(\d+(?:\.\d+)?)\s*(개|공기|잔|컵|인분|장|마리|조각|줄)/,
    /(\d+(?:\.\d+)?)\s*(kg|킬로)/i,
  ];

  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) {
      let qty = parseFloat(m[1]);
      const u = m[2].toLowerCase();
      if (u === "kg" || u === "킬로") qty *= 1000;
      return { qty, unitHint: u };
    }
  }
  return { qty: 1, unitHint: null };
}

function findFood(text) {
  const normalized = text.toLowerCase().replace(/\s+/g, "");
  let best = null;
  let bestLen = 0;

  for (const food of FOOD_DB) {
    for (const kw of food.keywords) {
      const kwNorm = kw.toLowerCase().replace(/\s+/g, "");
      if (normalized.includes(kwNorm) && kwNorm.length > bestLen) {
        best = food;
        bestLen = kwNorm.length;
      }
    }
  }
  return best;
}

function scaleNutrition(perUnit, qty, foodUnit, unitHint) {
  let multiplier = qty;

  if (foodUnit === "g" || foodUnit === "ml") {
    multiplier = unitHint === "g" || unitHint === "그램" || unitHint === "ml" ? qty : qty * 100;
    if (foodUnit === "g" && (unitHint === "개" || !unitHint)) {
      multiplier = qty * 100;
    }
  }

  return {
    calories: Math.round(perUnit.calories * multiplier * 10) / 10,
    protein: Math.round(perUnit.protein * multiplier * 10) / 10,
    carbs: Math.round(perUnit.carbs * multiplier * 10) / 10,
    fat: Math.round(perUnit.fat * multiplier * 10) / 10,
  };
}

function analyzeFood(inputText) {
  const text = inputText.trim();
  if (!text) return null;

  const { qty, unitHint } = parseQuantity(text);
  const food = findFood(text);

  if (food) {
    const nutrition = scaleNutrition(food.perUnit, qty, food.unit, unitHint);
    return {
      name: text,
      matched: food.keywords[0],
      nutrition,
      confidence: "high",
    };
  }

  const estimated = {
    calories: Math.round(150 * qty),
    protein: Math.round(8 * qty * 10) / 10,
    carbs: Math.round(15 * qty * 10) / 10,
    fat: Math.round(5 * qty * 10) / 10,
  };

  return {
    name: text,
    matched: null,
    nutrition: estimated,
    confidence: "estimate",
  };
}

function sumNutrition(items) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.nutrition?.calories || 0),
      protein: acc.protein + (item.nutrition?.protein || 0),
      carbs: acc.carbs + (item.nutrition?.carbs || 0),
      fat: acc.fat + (item.nutrition?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function roundNutrition(n) {
  return {
    calories: Math.round(n.calories),
    protein: Math.round(n.protein * 10) / 10,
    carbs: Math.round(n.carbs * 10) / 10,
    fat: Math.round(n.fat * 10) / 10,
  };
}
