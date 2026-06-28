const STORAGE_KEY = "fitcoach_state";

const PAGE_TITLES = {
  today: "오늘의 Action Plan",
  goals: "목표 관리",
  log: "수행 기록",
  progress: "진행률 분석",
  profile: "내 프로필",
};

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function createEmptyState() {
  return {
    setupStep: "onboarding",
    profile: null,
    goals: null,
    plan: null,
    dailyWorkouts: {},
    workoutTemplate: [],
    selectedDate: null,
    logHistory: [],
    weightHistory: [],
    mealLog: [],
    nutrition: {
      calories: { target: 0, current: 0 },
      protein: { target: 0, current: 0 },
      carbs: { target: 0, current: 0 },
      fat: { target: 0, current: 0 },
    },
  };
}

function toLocalDateStr(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayDateStr() {
  return toLocalDateStr(new Date());
}

function getSelectedDate(state) {
  return state.selectedDate || todayDateStr();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw);
    const merged = { ...createEmptyState(), ...parsed };

    if (!merged.dailyWorkouts) merged.dailyWorkouts = {};
    if (merged.todayWorkouts?.length && !merged.dailyWorkouts[todayDateStr()]?.length) {
      merged.dailyWorkouts[todayDateStr()] = merged.todayWorkouts.map((w) => ({
        ...w,
        memo: w.memo || "",
      }));
    }
    if (!merged.selectedDate) merged.selectedDate = todayDateStr();
    if (!merged.workoutTemplate) merged.workoutTemplate = [];
    if (!merged.mealLog) merged.mealLog = [];
    if (!merged.nutrition) merged.nutrition = createEmptyState().nutrition;
    merged.weightHistory = (merged.weightHistory || []).map((r) => ({
      date: r.date,
      weight: r.weight,
      bodyFat: r.bodyFat ?? null,
    }));
    if (merged.profile && merged.profile.startWeight == null) {
      const earliest = [...(merged.weightHistory || [])].sort((a, b) =>
        a.date.localeCompare(b.date)
      )[0];
      merged.profile.startWeight = earliest?.weight ?? merged.profile.weight;
    }
    if (
      merged.setupStep === "complete" &&
      merged.profile &&
      merged.goals &&
      (!merged.nutrition.calories?.target || merged.nutrition.calories.target === 0)
    ) {
      const plan = generatePlan(merged.profile, merged.goals);
      merged.nutrition = plan.nutritionTargets;
    }

    return merged;
  } catch {
    return createEmptyState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calcBMR(profile) {
  const { gender, weight, height, age } = profile;
  if (gender === "여성") {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

function generatePlan(profile, goals) {
  const bmr = calcBMR(profile);
  const activityMap = { 초급: 1.2, 중급: 1.375, 고급: 1.55 };
  let tdee = Math.round(bmr * (activityMap[profile.experience] || 1.2));

  const purposeAdjust = {
    다이어트: -400,
    근비대: 300,
    "체력 향상": 0,
    유지: 0,
  };
  tdee += purposeAdjust[profile.purpose] ?? 0;
  tdee = Math.max(1200, tdee);

  const protein = Math.round(profile.weight * (profile.purpose === "근비대" ? 2.2 : 1.8));
  const fat = Math.round((tdee * 0.25) / 9);
  const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4);

  const weightDiff = Math.max(0, profile.weight - goals.targetWeight);
  const months = goals.periodMonths;
  const monthlyTarget = months > 0 ? (weightDiff / months).toFixed(1) : 0;

  const bodyFatText =
    goals.targetBodyFat && profile.bodyFat
      ? `체지방률 ${profile.bodyFat}% → ${goals.targetBodyFat}%`
      : goals.targetBodyFat
        ? `목표 체지방률 ${goals.targetBodyFat}%`
        : null;

  const objectiveTitle = bodyFatText
    ? bodyFatText
    : `${profile.purpose}: ${profile.weight}kg → ${goals.targetWeight}kg`;

  const keyResults = [
    {
      label: `체중 ${weightDiff > 0 ? weightDiff.toFixed(1) : 0}kg ${profile.purpose === "근비대" ? "증량" : "감량"}`,
      current: 0,
      target: weightDiff > 0 ? weightDiff : 1,
      unit: "kg",
    },
    {
      label: `주 ${goals.weeklyWorkouts}회 운동`,
      current: 0,
      target: goals.weeklyWorkouts,
      unit: "회",
    },
    {
      label: `주간 러닝 ${goals.weeklyRunningKm}km`,
      current: 0,
      target: goals.weeklyRunningKm,
      unit: "km",
    },
  ];

  if (goals.targetBodyFat && profile.bodyFat) {
    keyResults.unshift({
      label: `체지방률 ${(profile.bodyFat - goals.targetBodyFat).toFixed(1)}% 감소`,
      current: 0,
      target: profile.bodyFat - goals.targetBodyFat,
      unit: "%",
    });
  }

  const todayWorkouts = buildTodayWorkouts(profile, goals);
  const daysStr = profile.availableDays.join(", ");

  const coachMessage = `
    ${profile.name}님, AI 코치가 맞춤 계획을 생성했습니다.<br><br>
    <strong>연간 목표:</strong> ${objectiveTitle}<br>
    <strong>달성 기간:</strong> ${months}개월 (월 평균 ${monthlyTarget}kg)<br><br>
    이번 주 목표: 운동 <strong>${goals.weeklyWorkouts}회</strong>, 러닝 <strong>${goals.weeklyRunningKm}km</strong><br>
    운동 가능: ${daysStr} · ${profile.availableTime}<br><br>
    오늘의 식단: <strong>${tdee} kcal</strong> (단백질 ${protein}g · 탄수 ${carbs}g · 지방 ${fat}g)<br>
    ${goals.customGoal ? `개인 목표: <strong>${goals.customGoal}</strong><br><br>` : "<br>"}
    오늘 계획을 완료하고 기록을 남겨주세요! 💪`;

  const monthlyWorkouts = goals.weeklyWorkouts * 4;
  const monthlyRunning = goals.weeklyRunningKm * 4;

  const goalChain = [
    { label: "연간", text: objectiveTitle.slice(0, 20) + (objectiveTitle.length > 20 ? "…" : "") },
    { label: "반기", text: `체중 ${(weightDiff / 2).toFixed(1)}kg` },
    { label: "분기", text: `주 ${goals.weeklyWorkouts}회 습관` },
    { label: "월간", text: `운동 ${monthlyWorkouts}회` },
    { label: "주간", text: `러닝 ${goals.weeklyRunningKm}km` },
    { label: "오늘", text: todayWorkouts.map((w) => w.title).slice(0, 2).join(" + "), current: true },
  ];

  const timeline = [
    { period: "연간", goal: objectiveTitle, detail: `${months}개월 계획`, active: false },
    { period: "반기", goal: `체중 ${(weightDiff / 2).toFixed(1)}kg 변화`, detail: "H1 목표", active: false },
    { period: "분기", goal: goals.workoutGoal || "운동 습관 형성", detail: `주 ${goals.weeklyWorkouts}회`, active: true },
    {
      period: "월간",
      goal: `운동 ${monthlyWorkouts}회 · 러닝 ${monthlyRunning}km`,
      detail: "0 / " + monthlyWorkouts + "회",
      active: false,
    },
    {
      period: "주간",
      goal: `운동 ${goals.weeklyWorkouts}회 · 러닝 ${goals.weeklyRunningKm}km`,
      detail: "0 / " + goals.weeklyWorkouts + "회",
      active: false,
    },
    {
      period: "오늘",
      goal: todayWorkouts.map((w) => w.title).join(" · "),
      detail: "0 / " + todayWorkouts.length + " 완료",
      active: true,
    },
  ];

  return {
    objective: { title: objectiveTitle, progress: 0 },
    keyResults,
    coachMessage,
    goalChain,
    timeline,
    todayWorkouts,
    workoutTemplate: todayWorkouts.map(({ title, meta }) => ({ title, meta })),
    nutritionTargets: {
      calories: { target: tdee, current: 0 },
      protein: { target: protein, current: 0 },
      carbs: { target: carbs, current: 0 },
      fat: { target: fat, current: 0 },
    },
  };
}

function buildTodayWorkouts(profile, goals) {
  const workouts = [];
  let id = 1;
  const hasGym = profile.gym;
  const purpose = profile.purpose;

  if (hasGym) {
    if (purpose === "근비대") {
      workouts.push(
        { id: id++, title: "벤치프레스", meta: "4세트 × 8~10회", done: false, memo: "" },
        { id: id++, title: "스쿼트", meta: "4세트 × 8~10회", done: false, memo: "" },
        { id: id++, title: "데드리프트", meta: "3세트 × 5~6회", done: false, memo: "" }
      );
    } else if (purpose === "다이어트") {
      workouts.push(
        { id: id++, title: "스쿼트", meta: "4세트 × 12회", done: false, memo: "" },
        { id: id++, title: "랫풀다운", meta: "3세트 × 12회", done: false, memo: "" },
        { id: id++, title: "플랭크", meta: "3세트 × 45초", done: false, memo: "" }
      );
    } else {
      workouts.push(
        { id: id++, title: "풀업/랫풀다운", meta: "3세트 × 10회", done: false, memo: "" },
        { id: id++, title: "스쿼트", meta: "4세트 × 10회", done: false, memo: "" }
      );
    }
  } else {
    workouts.push(
      { id: id++, title: "푸시업", meta: "3세트 × 15회", done: false, memo: "" },
      { id: id++, title: "스쿼트", meta: "3세트 × 20회", done: false, memo: "" }
    );
  }

  if (goals.weeklyRunningKm > 0) {
    const dailyKm = Math.max(2, Math.round((goals.weeklyRunningKm / profile.availableDays.length) * 10) / 10);
    workouts.push({ id: id++, title: "러닝", meta: `${dailyKm}km`, done: false, memo: "" });
  }

  workouts.push({ id: id++, title: "스트레칭", meta: "10~15분", done: false, memo: "" });
  return workouts;
}

function getWorkoutsForDate(state, dateStr, autoCreate = true) {
  if (!state.dailyWorkouts) state.dailyWorkouts = {};

  if (state.dailyWorkouts[dateStr]?.length) {
    return state.dailyWorkouts[dateStr];
  }

  if (!autoCreate || dateStr > todayDateStr()) return [];

  const template =
    state.workoutTemplate?.length > 0
      ? state.workoutTemplate
      : state.profile && state.goals
        ? buildTodayWorkouts(state.profile, state.goals).map(({ title, meta }) => ({ title, meta }))
        : [];

  const newWorkouts = template.map((w, i) => ({
    id: Date.parse(dateStr) + i,
    title: w.title,
    meta: w.meta,
    done: false,
    memo: "",
  }));

  state.dailyWorkouts[dateStr] = newWorkouts;
  return newWorkouts;
}

function setWorkoutsForDate(state, dateStr, workouts) {
  if (!state.dailyWorkouts) state.dailyWorkouts = {};
  state.dailyWorkouts[dateStr] = workouts;
}

function getActiveWorkouts(state) {
  return getWorkoutsForDate(state, getSelectedDate(state));
}

function computeWorkoutProgress(workouts) {
  const total = workouts?.length ?? 0;
  const done = workouts?.filter((w) => w.done).length ?? 0;
  return {
    total,
    done,
    remaining: total - done,
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

function computeTodayWorkoutProgress(state) {
  return computeWorkoutProgress(getActiveWorkouts(state));
}

function getMealsForDate(state, dateStr) {
  return (state.mealLog || []).filter((m) => m.date === dateStr);
}

function computeNutritionTotalsForDate(state, dateStr) {
  return roundNutrition(sumNutrition(getMealsForDate(state, dateStr)));
}

function computeNutritionProgress(state, dateStr) {
  const date = dateStr || getSelectedDate(state);
  const totals = computeNutritionTotalsForDate(state, date);
  const targets = state.nutrition || createEmptyState().nutrition;

  const keys = [
    { key: "calories", label: "칼로리", unit: "kcal", color: "#ef4444" },
    { key: "protein", label: "단백질", unit: "g", color: "#22c55e" },
    { key: "carbs", label: "탄수화물", unit: "g", color: "#3b82f6" },
    { key: "fat", label: "지방", unit: "g", color: "#f59e0b" },
  ];

  return keys.map(({ key, label, unit, color }) => {
    const target = targets[key]?.target ?? 0;
    const current = totals[key] ?? 0;
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return { key, label, unit, color, current, target, pct };
  });
}

function computeTodayDashboard(state) {
  const dateStr = getSelectedDate(state);
  const workout = computeTodayWorkoutProgress(state);
  const weekly = computeWeeklyWorkoutRate(state);
  const nutritionItems = computeNutritionProgress(state, dateStr);
  const totals = computeNutritionTotalsForDate(state, dateStr);
  const mealCount = getMealsForDate(state, dateStr).length;

  return { workout, weekly, nutritionItems, totals, mealCount };
}

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toLocalDateStr(d);
}

function getWeekContext(state, dateStr) {
  const ref = dateStr || getSelectedDate(state);
  const weekKey = getWeekKey(new Date(ref + "T12:00:00"));
  return { weekKey, weekDates: getWeekDates(weekKey) };
}

function getWeekDates(weekKey) {
  const start = new Date(weekKey + "T12:00:00");
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(toLocalDateStr(d));
  }
  return dates;
}

function formatWeekRange(weekDates) {
  if (!weekDates?.length) return "";
  return `${formatChartDate(weekDates[0])} ~ ${formatChartDate(weekDates[6])}`;
}

function isWeekDayCountable(dateStr, today) {
  return dateStr <= today;
}

function countWeekWorkoutDays(state, dateStr) {
  const { weekDates } = getWeekContext(state, dateStr);
  const today = todayDateStr();
  return weekDates.filter((d) => {
    if (!isWeekDayCountable(d, today)) return false;
    const workouts = state.dailyWorkouts?.[d];
    return workouts && workouts.length > 0 && workouts.some((w) => w.done);
  }).length;
}

function getDailyWorkoutCount(state) {
  if (state.workoutTemplate?.length > 0) return state.workoutTemplate.length;
  if (state.profile && state.goals) return buildTodayWorkouts(state.profile, state.goals).length;
  return 0;
}

function getStartWeight(state) {
  if (state.profile?.startWeight != null) return state.profile.startWeight;
  const sorted = getSortedBodyMetrics(state);
  if (sorted.length) return sorted[0].weight;
  return state.profile?.weight ?? null;
}

function computeWeeklyWorkoutRate(state, dateStr) {
  const { weekKey, weekDates } = getWeekContext(state, dateStr);
  const today = todayDateStr();
  const weeklyWorkoutDays = state.goals?.weeklyWorkouts ?? 0;
  const dailyCount = getDailyWorkoutCount(state);

  let itemDone = 0;
  let itemPlannedInWeek = 0;

  weekDates.forEach((d) => {
    if (!isWeekDayCountable(d, today)) return;
    const workouts = getWorkoutsForDate(state, d, false);
    itemPlannedInWeek += workouts.length;
    itemDone += workouts.filter((w) => w.done).length;
  });

  const totalPlanned =
    weeklyWorkoutDays > 0 && dailyCount > 0
      ? weeklyWorkoutDays * dailyCount
      : itemPlannedInWeek;
  const totalDone = itemDone;

  return {
    pct: totalPlanned > 0 ? Math.min(100, Math.round((totalDone / totalPlanned) * 100)) : 0,
    totalPlanned,
    totalDone,
    remaining: Math.max(0, totalPlanned - totalDone),
    weekKey,
    weekDates,
    weekLabel: formatWeekRange(weekDates),
  };
}

function computeWeeklyChart(state, dateStr) {
  const { weekDates } = getWeekContext(state, dateStr);
  const today = todayDateStr();

  return weekDates.map((dateStr, i) => {
    const workouts = isWeekDayCountable(dateStr, today)
      ? getWorkoutsForDate(state, dateStr, false)
      : [];
    const total = workouts.length;
    const done = workouts.filter((w) => w.done).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { day: DAY_LABELS[i], value: pct, label: `${done}/${total}`, date: dateStr };
  });
}

function computeStats(state) {
  const goals = state.goals;
  if (!goals) return [];

  const todayDash = computeTodayDashboard(state);
  const weekly = todayDash.weekly;
  const calPct = todayDash.nutritionItems.find((n) => n.key === "calories")?.pct ?? 0;

  const startWeight = getStartWeight(state);
  const latestMetric = getLatestBodyMetric(state);
  const currentWeight = latestMetric?.weight ?? startWeight;
  const weightChange =
    startWeight != null && currentWeight != null
      ? (currentWeight - startWeight).toFixed(1)
      : "0";

  return [
    {
      label: "오늘 운동 달성",
      value: `${todayDash.workout.pct}%`,
    },
    {
      label: "주간 운동 수행률",
      value: `${weekly.pct}%`,
    },
    {
      label: "식단 달성",
      value: todayDash.mealCount > 0 ? `${calPct}%` : "-",
    },
    {
      label: "체중 변화",
      value: `${Number(weightChange) > 0 ? "+" : ""}${weightChange}kg`,
    },
  ];
}

function computeKeyResults(state) {
  if (!state.plan?.keyResults || !state.goals) return [];

  const weekDaysDone = countWeekWorkoutDays(state);
  const weekRunning = computeWeekRunningKm(state);
  const gp = computeGoalProgress(state);
  const profile = state.profile;

  return state.plan.keyResults.map((kr) => {
    const copy = { ...kr, noData: false, displayPct: null };

    if (kr.label.includes("체중") || kr.label.includes("증량")) {
      if (gp) {
        copy.current = Math.round(gp.weightProgress * 10) / 10;
        copy.target = gp.weightTargetDelta > 0 ? gp.weightTargetDelta : 1;
        copy.displayPct = gp.weightPct;
      }
    } else if (kr.label.includes("운동")) {
      copy.current = weekDaysDone;
      copy.displayPct =
        kr.target > 0 ? Math.min(100, Math.round((weekDaysDone / kr.target) * 100)) : 0;
    } else if (kr.label.includes("러닝")) {
      copy.current = Math.round(weekRunning * 10) / 10;
      copy.displayPct =
        kr.target > 0 ? Math.min(100, Math.round((weekRunning / kr.target) * 100)) : 0;
    } else if (kr.label.includes("체지방")) {
      if (!gp?.hasBf) {
        copy.noData = true;
        copy.current = null;
        copy.displayPct = null;
      } else {
        copy.current = Math.round(gp.bodyFat.progress * 10) / 10;
        copy.target = gp.bodyFat.targetDelta;
        copy.displayPct = gp.bodyFat.pct;
      }
    }

    return copy;
  });
}

function computeObjectiveProgress(state) {
  const krs = computeKeyResults(state).filter((kr) => !kr.noData && kr.target > 0);
  if (krs.length === 0) return 0;
  const pcts = krs.map((kr) =>
    kr.displayPct != null
      ? kr.displayPct
      : Math.min(100, (kr.current / kr.target) * 100)
  );
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}

function computeWeekRunningKm(state, dateStr) {
  const { weekDates } = getWeekContext(state, dateStr);
  const today = todayDateStr();
  let total = 0;
  weekDates.forEach((d) => {
    if (!isWeekDayCountable(d, today)) return;
    const workouts = state.dailyWorkouts?.[d] || [];
    workouts.forEach((w) => {
      if (w.title.includes("러닝") && w.done) {
        const m = w.meta.match(/([\d.]+)\s*km/);
        if (m) total += parseFloat(m[1]);
      }
    });
  });
  return total;
}

function computeAiFeedback(state, dateStr) {
  const selected = dateStr || getSelectedDate(state);
  const workouts = getWorkoutsForDate(state, selected, false);
  const prog = computeWorkoutProgress(workouts);
  const isToday = selected === todayDateStr();

  if (!state.goals) {
    return [{ type: "info", tag: "시작 안내", text: "목표를 설정하면 AI 피드백을 받을 수 있습니다." }];
  }

  const feedback = [];
  const dateLabel = isToday ? "오늘" : selected;

  if (workouts.length > 0) {
    feedback.push({
      type: "info",
      tag: `${dateLabel} 운동`,
      text:
        prog.pct >= 100
          ? `${dateLabel} 운동 목표 100% 달성! (${prog.done}/${prog.total}개 완료)`
          : `${dateLabel} 운동 달성률 ${prog.pct}% — ${prog.remaining}개 운동이 남았습니다.`,
    });
  } else if (selected > todayDateStr()) {
    feedback.push({ type: "info", tag: "안내", text: "아직 예정되지 않은 날짜입니다." });
  } else {
    feedback.push({ type: "info", tag: "안내", text: "이 날짜의 운동 계획이 없습니다." });
  }

  const meals = getMealsForDate(state, selected);
  if (meals.length > 0) {
    const calPct = computeNutritionProgress(state, selected).find((n) => n.key === "calories")?.pct ?? 0;
    feedback.push({
      type: calPct > 110 ? "warning" : "info",
      tag: `${dateLabel} 식단`,
      text: `${dateLabel} ${meals.length}개 음식 기록 · 칼로리 목표 대비 ${calPct}% 섭취`,
    });
  }

  if (isToday) {
    const weekly = computeWeeklyWorkoutRate(state, selected);
    feedback.push({
      type: "info",
      tag: "주간 운동",
      text: `이번 주(${weekly.weekLabel}) 운동 수행률 ${weekly.pct}% (${weekly.totalDone}/${weekly.totalPlanned}개 완료)`,
    });
  } else {
    const weekly = computeWeeklyWorkoutRate(state, selected);
    feedback.push({
      type: "info",
      tag: "주간 운동",
      text: `${weekly.weekLabel} 주간 운동 수행률 ${weekly.pct}% (${weekly.totalDone}/${weekly.totalPlanned}개 완료)`,
    });
  }

  return feedback;
}

function computeStreak(state) {
  const dates = Object.keys(state.dailyWorkouts || {})
    .filter((dateStr) => state.dailyWorkouts[dateStr].some((w) => w.done))
    .sort();
  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateStr(d);
    if (dates.includes(dateStr)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function getDatesWithRecords(state) {
  const dates = new Set([
    ...Object.keys(state.dailyWorkouts || {}),
    ...(state.weightHistory || []).map((r) => r.date),
    ...(state.mealLog || []).map((m) => m.date),
  ]);
  return [...dates];
}

function getSortedBodyMetrics(state) {
  return [...(state.weightHistory || [])].sort((a, b) => a.date.localeCompare(b.date));
}

function getLatestBodyMetric(state) {
  const sorted = getSortedBodyMetrics(state);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

function getBodyFatRecords(state) {
  return getSortedBodyMetrics(state).filter(
    (r) => r.bodyFat != null && r.bodyFat !== "" && !Number.isNaN(Number(r.bodyFat))
  );
}

function upsertBodyMetric(state, dateStr, weight, bodyFat) {
  if (!state.weightHistory) state.weightHistory = [];
  const idx = state.weightHistory.findIndex((w) => w.date === dateStr);
  const entry = {
    date: dateStr,
    weight: Number(weight),
    bodyFat:
      bodyFat != null && bodyFat !== "" && !Number.isNaN(Number(bodyFat))
        ? Number(bodyFat)
        : idx >= 0
          ? state.weightHistory[idx].bodyFat
          : null,
  };
  if (idx >= 0) {
    state.weightHistory[idx] = entry;
  } else {
    state.weightHistory.push(entry);
  }
  state.weightHistory.sort((a, b) => a.date.localeCompare(b.date));
}

function formatChartDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getWeightChartData(state) {
  return getSortedBodyMetrics(state).map((r) => ({
    date: r.date,
    label: formatChartDate(r.date),
    value: r.weight,
  }));
}

function getBodyFatChartData(state) {
  return getBodyFatRecords(state).map((r) => ({
    date: r.date,
    label: formatChartDate(r.date),
    value: r.bodyFat,
  }));
}

function computeGoalProgress(state) {
  const profile = state.profile;
  const goals = state.goals;
  if (!profile || !goals) return null;

  const latest = getLatestBodyMetric(state);
  const startWeight = getStartWeight(state);
  const currentWeight = latest?.weight ?? profile.weight;
  const targetWeight = goals.targetWeight;
  const weightDiff = Math.abs(startWeight - targetWeight);
  const weightProgress = weightDiff > 0 ? Math.abs(startWeight - currentWeight) : 0;
  const weightPct =
    weightDiff > 0 ? Math.min(100, Math.round((weightProgress / weightDiff) * 100)) : 100;
  const weightRemaining = Math.round((currentWeight - targetWeight) * 10) / 10;

  const bfRecords = getBodyFatRecords(state);
  const hasBf = bfRecords.length > 0 && goals.targetBodyFat != null;
  let bodyFat = null;
  if (hasBf) {
    const startBf = profile.bodyFat ?? bfRecords[0].bodyFat;
    const latestBf = bfRecords[bfRecords.length - 1].bodyFat;
    const totalReduce = startBf - goals.targetBodyFat;
    const currentReduce = startBf - latestBf;
    bodyFat = {
      current: latestBf,
      target: goals.targetBodyFat,
      progress: totalReduce > 0 ? Math.max(0, currentReduce) : 0,
      targetDelta: totalReduce > 0 ? totalReduce : 1,
      pct: totalReduce > 0 ? Math.min(100, Math.round((currentReduce / totalReduce) * 100)) : 0,
      remaining: Math.round((latestBf - goals.targetBodyFat) * 10) / 10,
    };
  }

  return {
    currentWeight,
    targetWeight,
    weightPct,
    weightRemaining,
    weightProgress,
    weightTargetDelta: weightDiff,
    bodyFat,
    hasBf,
  };
}
