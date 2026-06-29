/**
 * AI 코치 — 체중·체지방·골격근량 기반 실시간 피드백
 * 근거: ACSM Consensus (2024), ACSM Position Stand, WHO 2020, ISSN 단백질 가이드
 */

const COACH_REFERENCES = [
  "ACSM Consensus Statement (2024): 체중·체지방 관리에 유산소+근력 병행",
  "ACSM Position Stand: 주 150분+ 유산소, 주 2일+ 근력",
  "WHO 2020: 성인 주 150~300분 중강도 유산소 권장",
  "ISSN Position Stand: 근육 유지·증가 시 단백질 1.6~2.2g/kg/일",
  "ACSM: 안전한 체중 감량 속도 주 0.5~1% 체중",
];

function getBodyFatThresholds(gender) {
  return gender === "여성"
    ? { high: 32, moderate: 28, healthy: 24 }
    : { high: 25, moderate: 20, healthy: 15 };
}

function estimateCardioMinutesFromKm(km, experience) {
  const paceMinPerKm = experience === "고급" ? 5.5 : experience === "중급" ? 6.5 : 7.5;
  return Math.round(km * paceMinPerKm);
}

function formatProgressPct(pct) {
  if (pct == null || Number.isNaN(pct)) return "-";
  return `${Math.round(pct)}%`;
}

function computeBodyMetricCoachInsights(state) {
  const profile = state.profile;
  const goals = state.goals;
  const gp = computeGoalProgress(state);
  if (!profile || !goals || !gp) return null;

  const overallPct = computeObjectiveProgress(state);
  const items = [];
  const purpose = profile.purpose;
  const proteinTarget = state.nutrition?.protein?.target;

  const losingWeight = goals.targetWeight < (profile.startWeight ?? profile.weight);
  const gainingWeight = goals.targetWeight > (profile.startWeight ?? profile.weight);

  if (losingWeight || purpose === "다이어트") {
    if (gp.weightRemaining <= 0) {
      items.push({
        type: "success",
        tag: "체중 목표",
        text: `체중 ${gp.currentWeight}kg — 목표 ${goals.targetWeight}kg에 도달했거나 초과 달성 중입니다. 유지·체지방 관리로 전환하세요.`,
      });
    } else if (gp.weightPct < 25) {
      items.push({
        type: "info",
        tag: "체중 진행",
        text: `현재 ${gp.currentWeight}kg → 목표 ${goals.targetWeight}kg (${gp.weightRemaining}kg 남음, ${formatProgressPct(gp.weightPct)}). ACSM 권장 속도(주 0.5~1% 체중)로 꾸준히 감량하세요.`,
      });
    } else if (gp.weightPct >= 75) {
      items.push({
        type: "success",
        tag: "체중 진행",
        text: `체중 목표 ${formatProgressPct(gp.weightPct)} 달성! 남은 ${gp.weightRemaining}kg — 단백질·근력 운동으로 근손실을 최소화하세요.`,
      });
    } else {
      items.push({
        type: "info",
        tag: "체중 진행",
        text: `체중 ${gp.currentWeight}kg (${formatProgressPct(gp.weightPct)} 진행, ${gp.weightRemaining}kg 남음). 칼로리·단백질 목표를 지키면 안정적 감량이 가능합니다.`,
      });
    }
  } else if (gainingWeight || purpose === "근비대") {
    if (gp.weightRemaining >= 0 && gp.currentWeight >= goals.targetWeight) {
      items.push({
        type: "success",
        tag: "체중 목표",
        text: `체중 ${gp.currentWeight}kg — 증량 목표에 근접했습니다. 점진적 과잉 칼로리·고단백 식단을 유지하세요.`,
      });
    } else {
      items.push({
        type: "info",
        tag: "체중 진행",
        text: `체중 ${gp.currentWeight}kg → 목표 ${goals.targetWeight}kg (${formatProgressPct(gp.weightPct)}). 주 0.25~0.5kg 증량 속도가 ISSN·ACSM에서 권장하는 근육 증가 범위입니다.`,
      });
    }
  }

  if (gp.hasBf && gp.bodyFat) {
    const bf = gp.bodyFat;
    const thresholds = getBodyFatThresholds(profile.gender);
    if (bf.remaining <= 0) {
      items.push({
        type: "success",
        tag: "체지방률",
        text: `체지방률 ${bf.current}% — 목표 ${bf.target}% 달성! 유지기에는 근력·유산소 균형을 유지하세요.`,
      });
    } else if (bf.current >= thresholds.high) {
      items.push({
        type: "warning",
        tag: "체지방률",
        text: `체지방률 ${bf.current}% (목표 ${bf.target}%, ${bf.remaining}%p 남음). WHO·ACSM 기준 고체지방 구간 — 유산소+근력 병행과 칼로리 적자가 효과적입니다.`,
      });
    } else {
      items.push({
        type: "info",
        tag: "체지방률",
        text: `체지방률 ${bf.current}% → ${bf.target}% (${formatProgressPct(bf.pct)}, ${bf.remaining}%p 남음). 주 150분+ 유산소와 단백질 섭취로 근손실 없이 감량하세요.`,
      });
    }
  } else if (goals.targetBodyFat != null) {
    items.push({
      type: "info",
      tag: "체지방률",
      text: "체지방률을 기록하면 목표 대비 실시간 코칭이 활성화됩니다. (프로필·기록 탭에서 입력)",
    });
  }

  if (gp.hasSmm && gp.skeletalMuscle) {
    const smm = gp.skeletalMuscle;
    if (smm.remaining <= 0) {
      items.push({
        type: "success",
        tag: "골격근량",
        text: `골격근량 ${smm.current}kg — 목표 ${smm.target}kg 달성! 유지·미세 조정 단계입니다.`,
      });
    } else if (purpose === "근비대" || smm.remaining > 0) {
      items.push({
        type: "info",
        tag: "골격근량",
        text: `골격근량 ${smm.current}kg → ${smm.target}kg (${formatProgressPct(smm.pct)}, ${smm.remaining}kg 남음).${
          proteinTarget ? ` 단백질 목표 ${proteinTarget}g/` : " 단백질 1.6~2.2g/kg/"
        }일·주 3~4회 근력 운동이 ISSN 권장입니다.`,
      });
    }
  } else if (goals.targetSkeletalMuscle != null) {
    items.push({
      type: "info",
      tag: "골격근량",
      text: "골격근량(인바디 등)을 기록하면 근육 목표 달성률과 맞춤 코칭을 받을 수 있습니다.",
    });
  }

  if (proteinTarget && purpose !== "유지") {
    const dateStr = getSelectedDate(state);
    const totals = computeNutritionTotalsForDate(state, dateStr);
    const proteinPct =
      proteinTarget > 0 ? Math.round((totals.protein / proteinTarget) * 100) : 0;
    if (proteinPct > 0 && proteinPct < 70) {
      items.push({
        type: "warning",
        tag: "단백질",
        text: `오늘 단백질 ${totals.protein}g / ${proteinTarget}g (${proteinPct}%). 근육 유지·회복을 위해 단백질을 먼저 채우세요.`,
      });
    } else if (proteinPct >= 70 && proteinPct <= 110) {
      items.push({
        type: "info",
        tag: "단백질",
        text: `단백질 ${totals.protein}g / ${proteinTarget}g (${proteinPct}%) — ISSN 권장 범위 내 섭취 중입니다.`,
      });
    }
  }

  return { overallPct, items, gp };
}

function renderMetricProgressHtml(gp, goals, profile) {
  if (!gp || !goals) return "";

  const rows = [];
  rows.push(
    `체중 <strong>${gp.currentWeight}kg</strong> → ${goals.targetWeight}kg (${formatProgressPct(gp.weightPct)})`
  );

  if (gp.hasBf && gp.bodyFat) {
    rows.push(
      `체지방 <strong>${gp.bodyFat.current}%</strong> → ${gp.bodyFat.target}% (${formatProgressPct(gp.bodyFat.pct)})`
    );
  }
  if (gp.hasSmm && gp.skeletalMuscle) {
    rows.push(
      `골격근 <strong>${gp.skeletalMuscle.current}kg</strong> → ${gp.skeletalMuscle.target}kg (${formatProgressPct(gp.skeletalMuscle.pct)})`
    );
  }

  return `<div class="coach-metric-progress"><span class="coach-metrics">${rows.join(" · ")}</span></div>`;
}

function renderTodayActionHtml(state, dateStr) {
  const workouts = getWorkoutsForDate(state, dateStr, false);
  const wp = computeWorkoutProgress(workouts);
  const calPct =
    computeNutritionProgress(state, dateStr).find((n) => n.key === "calories")?.pct ?? 0;
  const weekly = computeWeeklyWorkoutRate(state, dateStr);

  const tips = [];
  if (workouts.length === 0) {
    tips.push("오늘 운동 루틴을 선택하고 체크리스트를 완료하세요.");
  } else if (wp.pct < 100) {
    tips.push(`운동 ${wp.remaining}개 남음 — 우선순위 운동부터 완료하세요.`);
  } else {
    tips.push("오늘 운동 목표 달성! 회복·스트레칭·수분 섭취를 챙기세요.");
  }

  if (calPct === 0) {
    tips.push("식단 추천을 확인하고 기록을 시작하세요.");
  } else if (calPct > 115) {
    tips.push(`칼로리 ${calPct}% — 내일은 단백질·채소 위주로 조절하세요.`);
  } else if (calPct < 85) {
    tips.push(`칼로리 ${calPct}% — 목표 미달, 단백질 위주로 보충하세요.`);
  }

  if (weekly.pct < 50) {
    tips.push(`이번 주 운동 수행률 ${weekly.pct}% — 남은 요일에 운동 가능일을 활용하세요.`);
  }

  return `
    <div class="coach-today-snapshot">
      <strong>📍 오늘 액션</strong> · 운동 ${wp.pct}% · 식단 ${calPct}% · 주간 ${weekly.pct}%<br>
      <ul class="coach-tip-list">
        ${tips.map((t) => `<li>${t}</li>`).join("")}
      </ul>
    </div>`;
}

function computeTrainingBalanceAdvice(state) {
  const profile = state.profile;
  const goals = state.goals;
  if (!profile || !goals) return null;

  const latest = getLatestBodyMetric(state);
  const gp = computeGoalProgress(state);
  const currentWeight = latest?.weight ?? profile.weight;
  const currentBf = latest?.bodyFat ?? profile.bodyFat;
  const targetBf = goals.targetBodyFat;
  const smm = getCurrentSkeletalMuscle(state);
  const smmTarget = getTargetSkeletalMuscle(state);
  const purpose = profile.purpose;

  const currentWeightDays = goals.weeklyWorkouts || 3;
  const currentRunningKm = goals.weeklyRunningKm || 0;
  const currentCardioMin = estimateCardioMinutesFromKm(currentRunningKm, profile.experience);

  let recommendedWeightDays = 3;
  let recommendedCardioMin = 150;
  let weightRatio = 50;
  let cardioRatio = 50;
  let phase = "균형 유지";

  const bfGap =
    currentBf != null && targetBf != null ? currentBf - targetBf : null;
  const weightGap = currentWeight - goals.targetWeight;
  const smmGap = smmTarget != null && smm.current != null ? smmTarget - smm.current : null;

  if (purpose === "다이어트" || weightGap > 1 || (bfGap != null && bfGap > 2)) {
    phase = "체지방·체중 감량";
    recommendedWeightDays = 3;
    recommendedCardioMin = bfGap != null && bfGap > 5 ? 225 : bfGap != null && bfGap > 2 ? 180 : 150;
    if (smmGap != null && smmGap > 1) {
      recommendedWeightDays = 4;
      weightRatio = 45;
      cardioRatio = 55;
    } else if (bfGap != null && bfGap > 5) {
      weightRatio = 35;
      cardioRatio = 65;
    } else {
      weightRatio = 40;
      cardioRatio = 60;
    }
  } else if (purpose === "근비대" || weightGap < -1) {
    phase = "근육량·체중 증가";
    recommendedWeightDays = 4;
    recommendedCardioMin = 90;
    weightRatio = 75;
    cardioRatio = 25;
    if (smmGap != null && smmGap > 2) {
      recommendedWeightDays = 5;
      weightRatio = 80;
      cardioRatio = 20;
    }
  } else {
    recommendedWeightDays = 3;
    recommendedCardioMin = 150;
    weightRatio = 55;
    cardioRatio = 45;
  }

  if (profile.experience === "초급") {
    recommendedWeightDays = Math.min(recommendedWeightDays, 3);
    recommendedCardioMin = Math.min(recommendedCardioMin, 150);
  }

  const availableDays = profile.availableDays?.length || 5;
  recommendedWeightDays = Math.min(recommendedWeightDays, availableDays);
  recommendedCardioMin = Math.max(75, Math.min(recommendedCardioMin, 300));

  const recommendedRunningKm =
    Math.round((recommendedCardioMin / (profile.experience === "고급" ? 5.5 : 6.5)) * 10) / 10;

  const weightDayGap = recommendedWeightDays - currentWeightDays;
  const cardioMinGap = recommendedCardioMin - currentCardioMin;
  const runningKmGap = Math.round((recommendedRunningKm - currentRunningKm) * 10) / 10;

  const tips = [];
  if (weightDayGap > 0) {
    tips.push(`웨이트를 주 ${weightDayGap}회 더 늘리면 좋습니다 (권장 ${recommendedWeightDays}회/주).`);
  } else if (weightDayGap < -1) {
    tips.push(`웨이트 ${Math.abs(weightDayGap)}회를 줄이고 회복·유산소에 배분해도 됩니다.`);
  } else {
    tips.push(`웨이트 주 ${recommendedWeightDays}회 — 현재 목표(${currentWeightDays}회)와 적합합니다.`);
  }

  if (cardioMinGap > 20) {
    tips.push(
      `유산소를 주 ${cardioMinGap}분(약 ${runningKmGap > 0 ? runningKmGap + "km" : "추가 러닝"}) 더 하면 좋습니다.`
    );
  } else if (cardioMinGap < -30 && purpose === "근비대") {
    tips.push("유산소는 심폐 건강 유지 수준으로 충분합니다. 웨이트 볼륨에 집중하세요.");
  } else {
    tips.push(`유산소 주 ${recommendedCardioMin}분(약 ${recommendedRunningKm}km) — 현재와 비슷합니다.`);
  }

  if (smmGap != null && smmGap > 1) {
    tips.push(`골격근량 ${smm.current}kg → 목표 ${smmTarget}kg: 단백질·웨이트 볼륨 유지가 중요합니다.`);
  }

  if (gp?.hasBf && gp.bodyFat?.pct >= 50 && bfGap != null && bfGap > 3) {
    tips.push("체지방 감량 구간 — 고강도 유산소보다 근력+중강도 유산소 병행이 ACSM 권장입니다.");
  }

  return {
    phase,
    weightRatio,
    cardioRatio,
    recommendedWeightDays,
    recommendedCardioMin,
    recommendedRunningKm,
    currentWeightDays,
    currentCardioMin,
    currentRunningKm,
    weightDayGap,
    cardioMinGap,
    runningKmGap,
    tips,
    references: COACH_REFERENCES,
    metrics: {
      weight: currentWeight,
      targetWeight: goals.targetWeight,
      bodyFat: currentBf,
      targetBodyFat: targetBf,
      skeletalMuscle: smm.current,
      targetSkeletalMuscle: smmTarget,
    },
  };
}

function renderTrainingBalanceHtml(advice) {
  if (!advice) return "";

  return `
    <div class="coach-training-advice">
      <strong>🏋️ ${advice.phase} · 운동 비중</strong><br>
      웨이트 <strong>${advice.weightRatio}%</strong> · 유산소 <strong>${advice.cardioRatio}%</strong>
      (주 ${advice.recommendedWeightDays}회 · ${advice.recommendedCardioMin}분)<br>
      <ul class="coach-tip-list">
        ${advice.tips.map((t) => `<li>${t}</li>`).join("")}
      </ul>
      <p class="coach-ref">${advice.references[0]}</p>
    </div>`;
}

function computeLiveCoachMessage(state) {
  const profile = state.profile;
  if (!profile) {
    return "프로필을 설정하면 AI 코치가 맞춤 피드백을 제공합니다.";
  }

  const dateStr = getSelectedDate(state);
  const isToday = dateStr === todayDateStr();
  const insight = computeBodyMetricCoachInsights(state);
  const advice = computeTrainingBalanceAdvice(state);

  let html = `<strong>${profile.name}님, 실시간 AI 코치</strong><br>`;

  if (insight) {
    html += `전체 목표 달성률 <strong>${insight.overallPct}%</strong> — 체중·체지방·골격근량 기반 분석<br>`;
    html += renderMetricProgressHtml(insight.gp, state.goals, profile);
    if (insight.items.length > 0) {
      html += `<ul class="coach-tip-list coach-insight-list">`;
      html += insight.items
        .slice(0, 3)
        .map((item) => `<li>${item.text}</li>`)
        .join("");
      html += `</ul>`;
    }
  }

  if (isToday) {
    html += renderTodayActionHtml(state, dateStr);
  }

  html += renderTrainingBalanceHtml(advice);

  return html;
}

function computeCoachFeedbackItems(state) {
  const insight = computeBodyMetricCoachInsights(state);
  const advice = computeTrainingBalanceAdvice(state);
  if (!insight && !advice) return [];

  const items = [];

  if (insight) {
    items.push({
      type: insight.overallPct >= 70 ? "success" : "info",
      tag: "목표 달성률",
      text: `전체 목표 ${insight.overallPct}% — 체중·체지방·골격근량 종합 진행 중`,
    });
    insight.items.forEach((item) => {
      items.push({
        type: item.type || "info",
        tag: item.tag,
        text: item.text,
      });
    });
  }

  if (advice) {
    items.push({
      type: "info",
      tag: "AI 코치 · 운동 비중",
      text: `${advice.phase} — 웨이트 ${advice.weightRatio}% · 유산소 ${advice.cardioRatio}% (웨이트 주 ${advice.recommendedWeightDays}회, 유산소 ${advice.recommendedCardioMin}분)`,
    });
  }

  return items;
}
