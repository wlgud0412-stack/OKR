/**
 * AI 코치 — 유산소·웨이트 비중 권장
 * 근거: ACSM Consensus (2024), ACSM Position Stand, WHO 2020
 * - 유산소: 주 150~300분(중강도) 또는 75~150분(고강도)
 * - 근력: 주 2~3회 이상, 주요 근군
 * - 체중·체지방 감량: 유산소+근력 병행(근손실 완화)
 */

const COACH_REFERENCES = [
  "ACSM Consensus Statement (2024): 체중·체지방 관리에 유산소+근력 병행",
  "ACSM Position Stand: 주 150분+ 유산소, 주 2일+ 근력",
  "WHO 2020: 성인 주 150~300분 중강도 유산소 권장",
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

  const m = advice.metrics;
  const metricsLine = [
    m.weight != null ? `체중 ${m.weight}kg → ${m.targetWeight}kg` : null,
    m.bodyFat != null && m.targetBodyFat != null
      ? `체지방 ${m.bodyFat}% → ${m.targetBodyFat}%`
      : null,
    m.skeletalMuscle != null && m.targetSkeletalMuscle != null
      ? `골격근 ${m.skeletalMuscle}kg → ${m.targetSkeletalMuscle}kg`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return `
    <div class="coach-training-advice">
      <strong>📊 AI 코치 · ${advice.phase} 단계</strong><br>
      ${metricsLine ? `<span class="coach-metrics">${metricsLine}</span><br>` : ""}
      <strong>권장 비중:</strong> 웨이트 <strong>${advice.weightRatio}%</strong> · 유산소 <strong>${advice.cardioRatio}%</strong><br>
      <strong>주간 목표:</strong> 웨이트 ${advice.recommendedWeightDays}회 · 유산소 ${advice.recommendedCardioMin}분(≈${advice.recommendedRunningKm}km)<br>
      <ul class="coach-tip-list">
        ${advice.tips.map((t) => `<li>${t}</li>`).join("")}
      </ul>
      <p class="coach-ref">${advice.references[0]}</p>
    </div>`;
}

function computeLiveCoachMessage(state) {
  if (!state.plan?.coachMessage) return "";
  const advice = computeTrainingBalanceAdvice(state);
  const base = state.plan.coachMessage.split("<br><br>")[0] || state.plan.coachMessage;
  return base + "<br><br>" + renderTrainingBalanceHtml(advice);
}

function computeCoachFeedbackItems(state) {
  const advice = computeTrainingBalanceAdvice(state);
  if (!advice) return [];

  return [
    {
      type: "info",
      tag: "AI 코치 · 운동 비중",
      text: `${advice.phase} — 웨이트 ${advice.weightRatio}% · 유산소 ${advice.cardioRatio}% (웨이트 주 ${advice.recommendedWeightDays}회, 유산소 ${advice.recommendedCardioMin}분 권장)`,
    },
    ...advice.tips.slice(0, 2).map((t) => ({
      type: "info",
      tag: "코치 조언",
      text: t,
    })),
  ];
}
