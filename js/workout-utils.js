const CARDIO_TITLE_KEYWORDS = [
  "러닝",
  "사이클",
  "로잉",
  "스텝밀",
  "줄넘기",
  "버피",
  "유산소",
  "트레드밀",
  "자전거",
  "인터벌",
  "HIIT",
];

const STRETCH_TITLE_KEYWORDS = ["스트레칭", "폼롤러"];

const CARDIO_MINUTES_TO_KM = 6;

function isCardioWorkout(workout) {
  const title = workout?.title || "";
  const meta = workout?.meta || "";
  if (STRETCH_TITLE_KEYWORDS.some((k) => title.includes(k))) return false;
  if (CARDIO_TITLE_KEYWORDS.some((k) => title.includes(k))) return true;
  if (/km|분|min|m\b|인터벌|페이스/.test(meta) && !/세트\s*×/.test(meta)) return true;
  return false;
}

function isStretchWorkout(workout) {
  return STRETCH_TITLE_KEYWORDS.some((k) => (workout?.title || "").includes(k));
}

function parseCardioMeta(meta) {
  if (!meta) return { km: null, minutes: null };
  const kmMatch = meta.match(/([\d.]+)\s*km/i);
  const minMatch = meta.match(/([\d.]+)\s*분/);
  const minEnMatch = meta.match(/([\d.]+)\s*min/i);
  return {
    km: kmMatch ? parseFloat(kmMatch[1]) : null,
    minutes: minMatch ? parseFloat(minMatch[1]) : minEnMatch ? parseFloat(minEnMatch[1]) : null,
  };
}

function normalizeCardioMeta(title, meta) {
  const parsed = parseCardioMeta(meta);
  if (parsed.km != null) return `${parsed.km}km`;
  if (parsed.minutes != null) return `${parsed.minutes}분`;
  if (/^\d/.test(meta) && meta.includes("km")) return meta.split("·")[0].trim();
  if (/^\d/.test(meta) && meta.includes("분")) return meta.split("·")[0].trim();
  return getDefaultCardioMeta(title);
}

function getDefaultCardioMeta(title) {
  if (title.includes("러닝")) return "3km";
  if (title.includes("사이클") || title.includes("스텝밀")) return "20분";
  if (title.includes("로잉")) return "15분";
  if (title.includes("줄넘기")) return "10분";
  if (title.includes("버피")) return "15분";
  return "20분";
}

function getWorkoutMetaHint(workout) {
  if (isCardioWorkout(workout)) return "거리 또는 시간 (예: 3km, 20분)";
  if (isStretchWorkout(workout)) return "시간 (예: 10분)";
  return "세트/횟수 (예: 4세트 × 10회)";
}

function getDefaultWorkoutMeta(title) {
  if (CARDIO_TITLE_KEYWORDS.some((k) => title.includes(k))) return getDefaultCardioMeta(title);
  if (STRETCH_TITLE_KEYWORDS.some((k) => title.includes(k))) return "10~15분";
  return "4세트 × 10회";
}

function normalizeWorkoutEntry(workout) {
  if (!workout) return workout;
  const copy = { ...workout };
  if (isCardioWorkout(copy)) {
    copy.meta = normalizeCardioMeta(copy.title, copy.meta);
    copy.workoutType = "cardio";
  } else if (isStretchWorkout(copy)) {
    copy.workoutType = "stretch";
  } else {
    copy.workoutType = "strength";
  }
  return copy;
}

function computeWeekCardioTotals(state, dateStr) {
  const { weekDates } = getWeekContext(state, dateStr);
  const today = todayDateStr();
  let km = 0;
  let minutes = 0;

  weekDates.forEach((d) => {
    if (!isWeekDayCountable(d, today)) return;
    const workouts = state.dailyWorkouts?.[d] || [];
    workouts.forEach((w) => {
      if (!w.done || !isCardioWorkout(w)) return;
      const parsed = parseCardioMeta(w.meta);
      if (parsed.km != null) km += parsed.km;
      if (parsed.minutes != null) minutes += parsed.minutes;
    });
  });

  return {
    km: Math.round(km * 10) / 10,
    minutes: Math.round(minutes),
  };
}

function formatCardioProgressText(totals) {
  const parts = [];
  if (totals.km > 0) parts.push(`${totals.km}km`);
  if (totals.minutes > 0) parts.push(`${totals.minutes}분`);
  return parts.length ? parts.join(" · ") : "0";
}

function computeWeekCardioForGoal(state, dateStr) {
  const totals = computeWeekCardioTotals(state, dateStr);
  const equivalentKm =
    Math.round((totals.km + totals.minutes / CARDIO_MINUTES_TO_KM) * 10) / 10;
  return { ...totals, equivalentKm };
}

function formatCardioKrCurrent(totals, equivalentKm) {
  const progress = formatCardioProgressText(totals);
  if (!progress || progress === "0") return "0";
  if (totals.km > 0 && totals.minutes > 0) {
    return `${progress} (≈${equivalentKm}km)`;
  }
  if (totals.minutes > 0 && totals.km === 0) {
    return `${totals.minutes}분 (≈${equivalentKm}km)`;
  }
  return progress;
}
