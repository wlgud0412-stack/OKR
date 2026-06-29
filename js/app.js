let state = loadState();

const STATE_VERSION = 5;

function migrateStateIfNeeded() {
  const version = state.stateVersion || 0;
  if (version >= STATE_VERSION) return;

  if (version < 2) {
    state.workoutTemplate = [];
    state.dailyWorkouts = {};
    state.selectedRoutineId = null;
    state.selectedRoutineName = null;
    if (!state.mealRecommendations) state.mealRecommendations = {};
    const today = todayDateStr();
    if (state.setupStep === "complete" && state.nutrition?.calories?.target) {
      state.mealRecommendations[today] = generateMealPlanRecommendation(state, today);
      const hasMeals = (state.mealLog || []).some(
        (m) => m.date === today && ["breakfast", "lunch", "dinner"].includes(m.mealType)
      );
      if (!hasMeals && state.mealRecommendations[today]) {
        applyMealRecommendation(state, state.mealRecommendations[today]);
      }
    }
  }

  if (version < 3 && state.profile) {
    if (state.profile.skeletalMuscle == null && state.profile.bodyFat != null) {
      const est = estimateSkeletalMuscle(
        state.profile.weight,
        state.profile.bodyFat,
        state.profile.gender
      );
      if (est != null) state.profile.skeletalMuscle = est;
    }
    if (state.profile.skeletalMuscle != null && state.profile.startSkeletalMuscle == null) {
      state.profile.startSkeletalMuscle = state.profile.skeletalMuscle;
    }
    (state.weightHistory || []).forEach((r) => {
      if (r.skeletalMuscle == null && r.bodyFat != null) {
        r.skeletalMuscle = estimateSkeletalMuscle(r.weight, r.bodyFat, state.profile.gender);
      }
    });
  }

  if (version < 4) {
    if (state.workoutTemplate?.length) {
      state.workoutTemplate = state.workoutTemplate.map((w) => {
        const normalized = normalizeWorkoutEntry(w);
        return { title: normalized.title, meta: normalized.meta };
      });
    }
    if (state.dailyWorkouts) {
      Object.keys(state.dailyWorkouts).forEach((dateStr) => {
        state.dailyWorkouts[dateStr] = state.dailyWorkouts[dateStr].map(normalizeWorkoutEntry);
      });
    }
  }

  if (version < 5) {
    if (!state.workoutRecommendations) state.workoutRecommendations = {};
  }

  state.stateVersion = STATE_VERSION;
  saveState(state);
}

migrateStateIfNeeded();
let calendarViewMonth = new Date();

document.addEventListener("DOMContentLoaded", () => {
  initSetupFlow();
  if (state.setupStep === "complete") {
    showMainApp();
  } else {
    showSetupFlow();
  }
});

function showSetupFlow() {
  document.getElementById("setup-flow").classList.remove("hidden");
  document.getElementById("main-app").classList.add("hidden");
  document.getElementById("mobile-nav").classList.add("hidden");

  if (state.setupStep === "goals" && state.profile) {
    showSetupPage("goals");
    prefillGoalsForm();
  } else {
    showSetupPage("onboarding");
  }
}

function showMainApp() {
  document.getElementById("setup-flow").classList.add("hidden");
  document.getElementById("main-app").classList.remove("hidden");
  document.getElementById("mobile-nav").classList.remove("hidden");

  if (!state.selectedDate) state.selectedDate = todayDateStr();

  initGreeting();
  initDatePicker();
  renderAll();
  initNavigation();
  initForms();
  initMealForm();
  initCoachBtn();
  initResetBtn();
  initAppVersion();
  initWorkoutAddModal();
  initMealAddModal();
  initGoalTargetsForm();
}

function initGoalTargetsForm() {
  const form = document.getElementById("goal-targets-form");
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "true";

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => applyGoalTargetChanges());
    input.addEventListener("change", () => applyGoalTargetChanges());
  });
}

function applyGoalTargetChanges() {
  if (!state.goals) return;
  const form = document.getElementById("goal-targets-form");
  if (!form) return;

  const weightRaw = form.targetWeight.value;
  if (weightRaw === "" || Number.isNaN(Number(weightRaw))) return;

  state.goals.targetWeight = Number(weightRaw);

  const bfRaw = form.targetBodyFat.value;
  state.goals.targetBodyFat = bfRaw !== "" && !Number.isNaN(Number(bfRaw)) ? Number(bfRaw) : null;

  const smmRaw = form.targetSkeletalMuscle.value;
  state.goals.targetSkeletalMuscle =
    smmRaw !== "" && !Number.isNaN(Number(smmRaw)) ? Number(smmRaw) : null;

  saveState(state);
  refreshGoalProgressUI();
}

function refreshGoalProgressUI() {
  if (!state.plan) return;

  state.plan.objective.progress = computeObjectiveProgress(state);
  const progress = state.plan.objective.progress;

  const percentEl = document.getElementById("objective-percent");
  const ring = document.getElementById("objective-ring");
  if (percentEl) percentEl.textContent = `${progress}%`;
  if (ring) {
    const circumference = 2 * Math.PI * 52;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference - (progress / 100) * circumference;
  }

  renderGoalMetricCards();
  renderKeyResultsList();
}

function renderGoalMetricCards() {
  const gp = computeGoalProgress(state);
  if (!gp) return;

  const isLoss = gp.targetWeight < gp.currentWeight;
  const weightToGo = Math.round(Math.abs(gp.weightRemaining) * 10) / 10;
  const weightGoalLabel =
    gp.weightRemaining === 0
      ? "목표 달성"
      : isLoss
        ? `${weightToGo}kg 감량`
        : `${weightToGo}kg 증량`;

  document.getElementById("goal-weight-card").innerHTML = renderGoalMetricCard({
    title: "체중 목표",
    rows: [
      ["현재 체중", `${gp.currentWeight}kg`],
      ["목표 체중", `${gp.targetWeight}kg`],
      ["남은 목표", weightGoalLabel],
    ],
    pct: gp.weightPct,
    color: "#0d9488",
  });

  document.getElementById("goal-bodyfat-card").innerHTML = gp.hasBf
    ? renderGoalMetricCard({
        title: "체지방률 목표",
        rows: [
          ["현재 체지방률", `${gp.bodyFat.current}%`],
          ["목표 체지방률", `${gp.bodyFat.target}%`],
          ["남은 목표", `${Math.abs(gp.bodyFat.remaining)}%p`],
        ],
        pct: gp.bodyFat.pct,
        color: "#2563eb",
      })
    : renderGoalMetricCard({
        title: "체지방률 목표",
        rows: state.goals?.targetBodyFat
          ? [
              ["현재 체지방률", "기록 없음"],
              ["목표 체지방률", `${state.goals.targetBodyFat}%`],
            ]
          : [],
        emptyHint: "체지방률을 기록하면 목표 달성률이 계산됩니다.",
      });

  document.getElementById("goal-smm-card").innerHTML = gp.hasSmm
    ? renderGoalMetricCard({
        title: "골격근량 목표",
        rows: [
          [
            "현재 골격근량",
            `${gp.skeletalMuscle.current}kg${gp.skeletalMuscle.estimated ? " (추정)" : ""}`,
          ],
          ["목표 골격근량", `${gp.skeletalMuscle.target}kg`],
          ["남은 목표", `${Math.abs(gp.skeletalMuscle.remaining)}kg`],
        ],
        pct: gp.skeletalMuscle.pct,
        color: "#7c3aed",
      })
    : renderGoalMetricCard({
        title: "골격근량 목표",
        rows: state.goals?.targetSkeletalMuscle
          ? [
              ["현재 골격근량", "기록 없음"],
              ["목표 골격근량", `${state.goals.targetSkeletalMuscle}kg`],
            ]
          : [],
        emptyHint: "골격근량(인바디)을 기록하면 목표 달성률이 계산됩니다.",
      });
}

function renderKeyResultsList() {
  const keyResults = computeKeyResults(state);
  document.getElementById("kr-list").innerHTML =
    keyResults.length === 0
      ? `<p class="empty-state">설정된 Key Results가 없습니다.</p>`
      : keyResults
          .map((kr) => {
            if (kr.noData) {
              return `
              <div class="kr-item kr-no-data">
                <div class="kr-header">
                  <span>${kr.label}</span>
                  <span>기록 없음</span>
                </div>
                <p class="empty-hint">체지방률을 기록하면 달성률이 계산됩니다.</p>
              </div>`;
            }
            const pct =
              kr.displayPct != null
                ? kr.displayPct
                : kr.target > 0
                  ? Math.min(100, Math.round((kr.current / kr.target) * 100))
                  : 0;
            return `
              <div class="kr-item">
                <div class="kr-header">
                  <span>${kr.label}</span>
                  <span>${kr.displayCurrent != null ? `${kr.displayCurrent} / ${kr.target} ${kr.unit}` : `${kr.current} / ${kr.target} ${kr.unit}`}</span>
                </div>
                <div class="kr-bar"><div class="kr-bar-fill" style="width:${pct}%"></div></div>
                <span class="progress-pct">${pct}%</span>
              </div>`;
          })
          .join("");
}

function showSetupPage(page) {
  document.querySelectorAll(".setup-page").forEach((p) => p.classList.remove("active"));
  document.getElementById(`setup-${page}`).classList.add("active");

  const stepMap = { onboarding: 1, goals: 2, generating: 3 };
  document.querySelectorAll(".setup-step").forEach((s) => {
    const n = Number(s.dataset.step);
    s.classList.toggle("active", n === stepMap[page]);
    s.classList.toggle("done", n < stepMap[page]);
  });
}

function initSetupFlow() {
  document.getElementById("onboarding-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const days = fd.getAll("days");
    if (days.length === 0) {
      showToast("운동 가능 요일을 1개 이상 선택해주세요");
      return;
    }

    const smmRaw = fd.get("skeletalMuscle");
    const bodyFatVal = fd.get("bodyFat") ? Number(fd.get("bodyFat")) : null;
    const weightVal = Number(fd.get("weight"));
    let skeletalMuscle = smmRaw ? Number(smmRaw) : null;
    if (skeletalMuscle == null && bodyFatVal != null) {
      skeletalMuscle = estimateSkeletalMuscle(weightVal, bodyFatVal, fd.get("gender"));
    }

    state.profile = {
      name: fd.get("name").trim(),
      age: Number(fd.get("age")),
      gender: fd.get("gender"),
      height: Number(fd.get("height")),
      weight: weightVal,
      startWeight: weightVal,
      bodyFat: bodyFatVal,
      skeletalMuscle,
      startSkeletalMuscle: skeletalMuscle,
      experience: fd.get("experience"),
      purpose: fd.get("purpose"),
      availableDays: days,
      availableTime: fd.get("availableTime"),
      gym: fd.get("gym") === "true",
    };

    state.setupStep = "goals";
    saveState(state);

    const targetInput = document.querySelector('#goals-form [name="targetWeight"]');
    if (targetInput && state.profile.purpose === "다이어트") {
      targetInput.value = Math.max(30, state.profile.weight - 5);
    } else if (targetInput && state.profile.purpose === "근비대") {
      targetInput.value = state.profile.weight + 3;
    } else if (targetInput) {
      targetInput.value = state.profile.weight;
    }

    const smmTargetInput = document.querySelector('#goals-form [name="targetSkeletalMuscle"]');
    if (smmTargetInput && state.profile.skeletalMuscle != null) {
      smmTargetInput.value =
        state.profile.purpose === "근비대"
          ? Math.round((state.profile.skeletalMuscle + 2) * 10) / 10
          : state.profile.skeletalMuscle;
    }

    showSetupPage("goals");
    showToast("다음 단계: 목표를 설정해주세요");
  });

  document.getElementById("goals-back-btn").addEventListener("click", () => {
    state.setupStep = "onboarding";
    saveState(state);
    showSetupPage("onboarding");
    prefillOnboardingForm();
  });

  document.getElementById("goals-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    state.goals = {
      targetWeight: Number(fd.get("targetWeight")),
      targetBodyFat: fd.get("targetBodyFat") ? Number(fd.get("targetBodyFat")) : null,
      targetSkeletalMuscle: fd.get("targetSkeletalMuscle")
        ? Number(fd.get("targetSkeletalMuscle"))
        : null,
      periodMonths: Number(fd.get("periodMonths")),
      workoutGoal: fd.get("workoutGoal").trim(),
      weeklyWorkouts: Number(fd.get("weeklyWorkouts")),
      weeklyRunningKm: Number(fd.get("weeklyRunningKm")),
      customGoal: fd.get("customGoal")?.trim() || "",
    };

    saveState(state);
    runAiGeneration();
  });
}

function prefillOnboardingForm() {
  if (!state.profile) return;
  const f = document.getElementById("onboarding-form");
  const p = state.profile;
  f.name.value = p.name;
  f.age.value = p.age;
  f.gender.value = p.gender;
  f.height.value = p.height;
  f.weight.value = p.weight;
  f.bodyFat.value = p.bodyFat ?? "";
  f.skeletalMuscle.value = p.skeletalMuscle ?? "";
  f.experience.value = p.experience;
  f.purpose.value = p.purpose;
  f.availableTime.value = p.availableTime;
  f.gym.value = String(p.gym);
  f.querySelectorAll('[name="days"]').forEach((cb) => {
    cb.checked = p.availableDays.includes(cb.value);
  });
}

function prefillGoalsForm() {
  if (!state.goals) return;
  const f = document.getElementById("goals-form");
  const g = state.goals;
  f.targetWeight.value = g.targetWeight;
  f.targetBodyFat.value = g.targetBodyFat ?? "";
  f.targetSkeletalMuscle.value = g.targetSkeletalMuscle ?? "";
  f.periodMonths.value = g.periodMonths;
  f.workoutGoal.value = g.workoutGoal;
  f.weeklyWorkouts.value = g.weeklyWorkouts;
  f.weeklyRunningKm.value = g.weeklyRunningKm;
  f.customGoal.value = g.customGoal ?? "";
}

async function runAiGeneration() {
  showSetupPage("generating");
  const statuses = [
    "목표 분석 중...",
    "OKR 구조 생성 중...",
    "운동 루틴 생성 중...",
    "식단 계획 생성 중...",
    "대시보드 준비 중...",
  ];
  const steps = ["gen-step-1", "gen-step-2", "gen-step-3", "gen-step-4"];

  for (let i = 0; i < statuses.length; i++) {
    document.getElementById("generating-status").textContent = statuses[i];
    if (i > 0 && i <= steps.length) {
      document.getElementById(steps[i - 1]).classList.add("done");
    }
    await sleep(600);
  }

  const plan = generatePlan(state.profile, state.goals);
  const today = todayDateStr();

  state.plan = {
    objective: plan.objective,
    keyResults: plan.keyResults,
    coachMessage: plan.coachMessage,
    goalChain: plan.goalChain,
    timeline: plan.timeline,
  };
  state.workoutTemplate = [];
  state.dailyWorkouts = {};
  state.nutrition = plan.nutritionTargets;
  state.mealLog = [];
  state.mealRecommendations = {};
  state.mealRecommendations[today] = generateMealPlanRecommendation(
    { ...state, nutrition: plan.nutritionTargets },
    today
  );
  applyMealRecommendation(state, state.mealRecommendations[today]);
  state.workoutRecommendations = {};
  state.workoutRecommendations[today] = generateWorkoutRoutineRecommendation(
    state.profile,
    state.goals,
    today
  );
  state.selectedDate = today;
  state.logHistory = [];
  state.weightHistory = [
    {
      date: today,
      weight: state.profile.weight,
      bodyFat: state.profile.bodyFat ?? null,
      skeletalMuscle: state.profile.skeletalMuscle ?? null,
    },
  ];
  state.setupStep = "complete";

  saveState(state);
  document.getElementById(steps[3]).classList.add("done");
  await sleep(400);

  showMainApp();
  showToast("AI 맞춤 계획이 생성되었습니다!");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function initGreeting() {
  const hour = new Date().getHours();
  let greeting = "좋은 아침이에요";
  if (hour >= 12 && hour < 18) greeting = "좋은 오후예요";
  else if (hour >= 18) greeting = "좋은 저녁이에요";
  const name = state.profile?.name ?? "회원";
  document.getElementById("greeting").textContent = `${greeting}, ${name}님`;
}

function initDatePicker() {
  const btn = document.getElementById("date-picker-btn");
  const popup = document.getElementById("date-picker-popup");
  const closeBtn = document.getElementById("date-picker-close");
  const todayBtn = document.getElementById("date-picker-today");
  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");

  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = "true";

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const sel = getSelectedDate(state);
    calendarViewMonth = new Date(sel + "T12:00:00");
    renderCalendar();
    popup.classList.toggle("hidden");
  });

  closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

  todayBtn.addEventListener("click", () => {
    selectDate(todayDateStr());
    calendarViewMonth = new Date();
    renderCalendar();
    popup.classList.add("hidden");
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    calendarViewMonth.setMonth(calendarViewMonth.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    calendarViewMonth.setMonth(calendarViewMonth.getMonth() + 1);
    renderCalendar();
  });

  document.addEventListener("click", (e) => {
    if (!popup.contains(e.target) && !btn.contains(e.target)) {
      popup.classList.add("hidden");
    }
  });
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const label = document.getElementById("cal-month-label");
  if (!grid || !label) return;

  const year = calendarViewMonth.getFullYear();
  const month = calendarViewMonth.getMonth();
  label.textContent = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const selected = getSelectedDate(state);
  const today = todayDateStr();
  const recordDates = new Set(getDatesWithRecords(state));

  let html = "";
  for (let i = 0; i < startPad; i++) {
    html += `<button type="button" class="cal-day cal-empty" disabled></button>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const classes = ["cal-day"];
    if (dateStr === selected) classes.push("cal-selected");
    if (dateStr === today) classes.push("cal-today");
    if (recordDates.has(dateStr)) classes.push("cal-has-record");
    html += `<button type="button" class="${classes.join(" ")}" data-date="${dateStr}">${d}</button>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll(".cal-day[data-date]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectDate(btn.dataset.date);
      renderCalendar();
      document.getElementById("date-picker-popup").classList.add("hidden");
    });
  });
}

function renderBodyCharts() {
  const goals = state.goals;
  renderSvgLineChart("log-weight-chart", {
    data: getWeightChartData(state),
    goalValue: goals?.targetWeight ?? null,
    unit: "kg",
    lineColor: "#0d9488",
    emptyMessage: "체중을 2회 이상 기록하면 그래프가 표시됩니다.",
  });
  renderSvgLineChart("weight-chart", {
    data: getWeightChartData(state),
    goalValue: goals?.targetWeight ?? null,
    unit: "kg",
    lineColor: "#0d9488",
    emptyMessage: "체중을 2회 이상 기록하면 그래프가 표시됩니다.",
  });

  const bfData = getBodyFatChartData(state);
  renderSvgLineChart("log-bodyfat-chart", {
    data: bfData,
    goalValue: goals?.targetBodyFat ?? null,
    unit: "%",
    lineColor: "#2563eb",
    emptyMessage: "체지방률을 2회 이상 기록하면 그래프가 표시됩니다.",
  });
  renderSvgLineChart("bodyfat-chart", {
    data: bfData,
    goalValue: goals?.targetBodyFat ?? null,
    unit: "%",
    lineColor: "#2563eb",
    emptyMessage: "체지방률을 2회 이상 기록하면 그래프가 표시됩니다.",
  });

  const smmData = getSkeletalMuscleChartData(state);
  renderSvgLineChart("log-smm-chart", {
    data: smmData,
    goalValue: goals?.targetSkeletalMuscle ?? getTargetSkeletalMuscle(state),
    unit: "kg",
    lineColor: "#7c3aed",
    emptyMessage: "골격근량을 2회 이상 기록하면 그래프가 표시됩니다.",
  });
  renderSvgLineChart("smm-chart", {
    data: smmData,
    goalValue: goals?.targetSkeletalMuscle ?? getTargetSkeletalMuscle(state),
    unit: "kg",
    lineColor: "#7c3aed",
    emptyMessage: "골격근량을 2회 이상 기록하면 그래프가 표시됩니다.",
  });
}

function renderMetricsTable() {
  const el = document.getElementById("metrics-table");
  if (!el) return;

  const rows = getSortedBodyMetrics(state);
  if (rows.length === 0) {
    el.innerHTML = `<p class="empty-state">체성분 기록이 없습니다.</p>`;
    return;
  }

  el.innerHTML = `
    <table class="metrics-table">
      <thead>
        <tr><th>날짜</th><th>체중</th><th>체지방률</th><th>골격근량</th><th></th></tr>
      </thead>
      <tbody>
        ${rows
          .slice()
          .reverse()
          .map(
            (r) => `
          <tr data-date="${r.date}">
            <td>${formatChartDate(r.date)}</td>
            <td>${r.weight}kg</td>
            <td>${r.bodyFat != null ? r.bodyFat + "%" : "-"}</td>
            <td>${r.skeletalMuscle != null ? r.skeletalMuscle + "kg" : "-"}</td>
            <td>
              <button type="button" class="btn-icon edit-metric" data-date="${r.date}" title="수정">✏️</button>
              <button type="button" class="btn-icon delete-metric" data-date="${r.date}" title="삭제">🗑️</button>
            </td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>`;

  el.querySelectorAll(".edit-metric").forEach((btn) => {
    btn.addEventListener("click", () => editBodyMetric(btn.dataset.date));
  });
  el.querySelectorAll(".delete-metric").forEach((btn) => {
    btn.addEventListener("click", () => deleteBodyMetric(btn.dataset.date));
  });
}

function editBodyMetric(dateStr) {
  const row = state.weightHistory.find((r) => r.date === dateStr);
  if (!row) return;
  const weight = prompt("체중 (kg):", row.weight);
  if (weight === null) return;
  const bodyFat = prompt("체지방률 (%) — 비우면 유지:", row.bodyFat ?? "");
  if (bodyFat === null) return;
  const smm = prompt("골격근량 (kg) — 비우면 유지:", row.skeletalMuscle ?? "");
  if (smm === null) return;
  upsertBodyMetric(
    state,
    dateStr,
    Number(weight),
    bodyFat === "" ? row.bodyFat : Number(bodyFat),
    smm === "" ? row.skeletalMuscle : Number(smm)
  );
  saveState(state);
  renderAll();
  showToast("기록이 수정되었습니다");
}

function deleteBodyMetric(dateStr) {
  if (!confirm("이 날짜의 기록을 삭제할까요?")) return;
  state.weightHistory = state.weightHistory.filter((r) => r.date !== dateStr);
  saveState(state);
  renderAll();
  showToast("기록이 삭제되었습니다");
}

function prefillBodyForm() {
  const form = document.getElementById("body-form");
  if (!form) return;
  const dateStr = getSelectedDate(state);
  const row = state.weightHistory.find((r) => r.date === dateStr);
  form.recordDate.value = dateStr;
  form.recordDate.max = todayDateStr();
  form.weight.value = row?.weight ?? state.profile?.weight ?? "";
  form.bodyFat.value = row?.bodyFat ?? "";
  form.skeletalMuscle.value = row?.skeletalMuscle ?? "";
}

function selectDate(dateStr) {
  state.selectedDate = dateStr;
  getWorkoutsForDate(state, dateStr);
  saveState(state);
  updateDateDisplay();
  prefillBodyForm();
  renderAll();
}

function updateDateDisplay() {
  const dateStr = getSelectedDate(state);
  const el = document.getElementById("today-date");
  if (el) el.textContent = formatDateDisplay(dateStr);

  const isToday = dateStr === todayDateStr();
  const titleEl = document.getElementById("page-title");
  const todayPage = document.getElementById("page-today")?.classList.contains("active");
  if (todayPage && titleEl) {
    titleEl.textContent = isToday ? PAGE_TITLES.today : `${dateStr} 운동 기록`;
  }

  const dashTitle = document.getElementById("dashboard-title");
  if (dashTitle) dashTitle.textContent = isToday ? "오늘의 대시보드" : `${dateStr} 대시보드`;

  const workoutTitle = document.getElementById("workout-section-title");
  if (workoutTitle) workoutTitle.textContent = isToday ? "오늘의 운동" : "운동 기록";

  const nutritionTitle = document.getElementById("nutrition-section-title");
  if (nutritionTitle) {
    nutritionTitle.textContent = isToday ? "오늘의 식단" : `${dateStr} 식단`;
  }
}

function renderAll() {
  updateDateDisplay();
  updatePlanProgress();
  renderToday();
  renderLog();
  renderGoals();
  renderProgress();
  renderProfile();
  renderBodyCharts();
  renderMetricsTable();
  prefillBodyForm();
  document.getElementById("streak-count").textContent = `${computeStreak(state)}일`;
}

function renderProgressBar(label, pct, detail, color = "var(--accent)") {
  const header = label
    ? `<div class="progress-header"><span>${label}</span><span class="progress-detail">${detail}</span></div>`
    : `<div class="progress-header"><span class="progress-detail">${detail}</span></div>`;
  return `
    <div class="progress-item">
      ${header}
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <span class="progress-pct">${pct}%</span>
    </div>`;
}

function renderGoalMetricCard({ title, rows, pct, color, emptyHint }) {
  if (emptyHint) {
    const rowsHtml = rows?.length
      ? `<div class="goal-metric-rows">
          ${rows
            .map(
              ([label, value]) => `
            <div class="goal-metric-row">
              <span>${label}</span>
              <strong>${value}</strong>
            </div>`
            )
            .join("")}
        </div>`
      : "";

    return `
      <h3 class="goal-metric-title">${title}</h3>
      ${rowsHtml}
      <div class="goal-metric-empty">
        <p class="empty-hint">${emptyHint}</p>
      </div>`;
  }

  return `
    <h3 class="goal-metric-title">${title}</h3>
    <div class="goal-metric-rows">
      ${rows
        .map(
          ([label, value]) => `
        <div class="goal-metric-row">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>`
        )
        .join("")}
    </div>
    <div class="goal-metric-progress">
      ${renderProgressBar("목표 달성률", pct, "", color)}
    </div>`;
}

function renderDashboardHTML(dash) {
  const { workout, weekly, nutritionItems, totals, mealCount } = dash;
  const dateStr = getSelectedDate(state);
  const isToday = dateStr === todayDateStr();
  const dateLabel = isToday ? "오늘" : "선택일";

  const nutritionBars =
    mealCount === 0
      ? '<p class="empty-hint">식단을 기록하면 영양소가 표시됩니다.</p>'
      : nutritionItems
          .map((n) =>
            renderProgressBar(n.label, n.pct, `${n.current} / ${n.target} ${n.unit}`, n.color)
          )
          .join("");

  return `
    <div class="dash-block">
      <h3>🏋️ ${dateLabel} 운동</h3>
      ${renderProgressBar("일일 운동 달성률", workout.pct, `${workout.done}/${workout.total}개 완료 · ${workout.remaining}개 남음`, "#0d9488")}
      <div class="dash-stats-row">
        <div><span>완료</span><strong>${workout.done}개</strong></div>
        <div><span>남음</span><strong>${workout.remaining}개</strong></div>
        <div><span>전체</span><strong>${workout.total}개</strong></div>
      </div>
    </div>
    <div class="dash-block">
      <h3>🍽️ ${dateLabel} 식단</h3>
      <div class="dash-stats-row dash-stats-row-4">
        <div><span>칼로리</span><strong>${totals.calories} kcal</strong></div>
        <div><span>단백질</span><strong>${totals.protein}g</strong></div>
        <div><span>탄수화물</span><strong>${totals.carbs}g</strong></div>
        <div><span>지방</span><strong>${totals.fat}g</strong></div>
      </div>
      ${nutritionBars}
    </div>
    <div class="dash-block">
      <h3>📊 주간 운동 수행률</h3>
      ${renderProgressBar("주간 수행률", weekly.pct, `${weekly.weekLabel} · ${weekly.totalDone}/${weekly.totalPlanned}개 완료`, "#2563eb")}
      <div class="dash-stats-row">
        <div><span>주간 완료</span><strong>${weekly.totalDone}개</strong></div>
        <div><span>주간 전체</span><strong>${weekly.totalPlanned}개</strong></div>
        <div><span>남음</span><strong>${weekly.remaining}개</strong></div>
      </div>
    </div>`;
}

function updatePlanProgress() {
  if (!state.plan) return;
  state.plan.objective.progress = computeObjectiveProgress(state);

  const weekly = computeWeeklyWorkoutRate(state);
  const dateStr = getSelectedDate(state);
  const workouts = getWorkoutsForDate(state, dateStr, false);
  const doneCount = workouts.filter((w) => w.done).length;

  if (state.plan.timeline) {
    state.plan.timeline = state.plan.timeline.map((t) => {
      const copy = { ...t };
      if (t.period === "주간") {
        copy.detail = `${weekly.totalDone}개 / ${weekly.totalPlanned}개 (${weekly.pct}%) · ${weekly.weekLabel}`;
      }
      if (t.period === "오늘" && dateStr === todayDateStr()) {
        copy.detail = `${doneCount} / ${workouts.length} 완료`;
      }
      return copy;
    });
  }
  saveState(state);
}

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item, .mobile-nav-item");
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      showPage(page);
      navItems.forEach((b) => b.classList.toggle("active", b.dataset.page === page));
    });
  });
}

function showPage(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(`page-${page}`).classList.add("active");
  if (page === "today") {
    updateDateDisplay();
  } else {
    document.getElementById("page-title").textContent = PAGE_TITLES[page];
  }
}

function saveActiveWorkouts(workouts) {
  setWorkoutsForDate(state, getSelectedDate(state), workouts);
  saveState(state);
}

function syncWorkoutTemplateFromDaily(workouts) {
  state.workoutTemplate = workouts.map((w) => ({ title: w.title, meta: w.meta }));
}

let workoutAddContext = null;

function initWorkoutAddModal() {
  const modal = document.getElementById("workout-add-modal");
  if (!modal || modal.dataset.bound) return;
  modal.dataset.bound = "true";

  document.getElementById("workout-add-close")?.addEventListener("click", closeWorkoutAddPicker);
  document.getElementById("workout-add-backdrop")?.addEventListener("click", closeWorkoutAddPicker);
  document.getElementById("workout-add-back")?.addEventListener("click", () => {
    if (!workoutAddContext) return;
    workoutAddContext.step = "parts";
    workoutAddContext.partId = null;
    renderWorkoutAddModalContent();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (workoutAddContext) closeWorkoutAddPicker();
      if (mealAddContext) closeMealAddPicker();
    }
  });
}

function openWorkoutAddPicker(workouts, dateStr) {
  workoutAddContext = { workouts, dateStr, step: "parts", partId: null };
  initWorkoutAddModal();
  document.getElementById("workout-add-modal")?.classList.remove("hidden");
  document.body.classList.add("modal-open");
  renderWorkoutAddModalContent();
}

function closeWorkoutAddPicker() {
  workoutAddContext = null;
  document.getElementById("workout-add-modal")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function renderWorkoutAddModalContent() {
  if (!workoutAddContext) return;

  const titleEl = document.getElementById("workout-add-title");
  const subtitleEl = document.getElementById("workout-add-subtitle");
  const backBtn = document.getElementById("workout-add-back");
  const bodyEl = document.getElementById("workout-add-body");
  if (!titleEl || !subtitleEl || !backBtn || !bodyEl) return;

  const hasGym = Boolean(state.profile?.gym);
  const existingTitles = new Set(workoutAddContext.workouts.map((w) => w.title));

  if (workoutAddContext.step === "parts") {
    titleEl.textContent = "운동 부위 선택";
    subtitleEl.textContent = "추가할 부위를 선택하세요";
    backBtn.classList.add("hidden");

    bodyEl.innerHTML = `
      <div class="body-part-grid">
        ${EXERCISE_BODY_PARTS.map(
          (part) => `
          <button type="button" class="body-part-btn" data-part-id="${part.id}">
            <span class="body-part-icon">${part.icon}</span>
            <span class="body-part-label">${part.label}</span>
          </button>`
        ).join("")}
      </div>`;

    bodyEl.querySelectorAll(".body-part-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        workoutAddContext.step = "exercises";
        workoutAddContext.partId = btn.dataset.partId;
        renderWorkoutAddModalContent();
      });
    });
    return;
  }

  const partLabel = getBodyPartLabel(workoutAddContext.partId);
  const exercises = getExercisesForBodyPart(workoutAddContext.partId, hasGym);

  titleEl.textContent = `${partLabel} 추천 운동`;
  subtitleEl.textContent = hasGym
    ? "헬스장 기준 추천 · 원하는 운동을 선택하세요"
    : "맨몸/홈트 기준 추천 · 원하는 운동을 선택하세요";
  backBtn.classList.remove("hidden");

  if (exercises.length === 0) {
    bodyEl.innerHTML = `<p class="empty-state">추천 운동이 없습니다.</p>`;
    return;
  }

  bodyEl.innerHTML = `
    <ul class="exercise-pick-list">
      ${exercises
        .map((ex) => {
          const added = existingTitles.has(ex.title);
          const videoUrl = getExerciseVideoUrl(ex.title);
          return `
          <li class="exercise-pick-item ${added ? "added" : ""}">
            <div class="exercise-pick-info">
              <strong>${escapeHtml(ex.title)}</strong>
              <span class="exercise-pick-meta">${escapeHtml(ex.meta)}</span>
              ${ex.tip ? `<span class="exercise-pick-tip">${escapeHtml(ex.tip)}</span>` : ""}
            </div>
            <div class="exercise-pick-actions">
              ${renderWorkoutVideoLink(videoUrl, { compact: true })}
              <button type="button" class="btn btn-primary btn-sm pick-exercise-btn" data-title="${escapeHtml(ex.title)}" data-meta="${escapeHtml(ex.meta)}" ${added ? "disabled" : ""}>
                ${added ? "추가됨" : "추가"}
              </button>
            </div>
          </li>`;
        })
        .join("")}
    </ul>`;

  bodyEl.querySelectorAll(".pick-exercise-btn:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => {
      addWorkoutFromCatalog(btn.dataset.title, btn.dataset.meta);
    });
  });
}

function addWorkoutFromCatalog(title, meta) {
  if (!workoutAddContext) return;

  const { dateStr } = workoutAddContext;
  if (workoutAddContext.workouts.some((w) => w.title === title)) {
    showToast("이미 추가된 운동입니다");
    renderWorkoutAddModalContent();
    return;
  }

  const newWorkout = {
    id: Date.now(),
    title,
    meta,
    done: false,
    memo: "",
  };
  const updated = [...workoutAddContext.workouts, newWorkout];
  setWorkoutsForDate(state, dateStr, updated);
  syncWorkoutTemplateFromDaily(updated);
  saveState(state);

  workoutAddContext.workouts = updated;
  renderAll();
  renderWorkoutAddModalContent();
  showToast(`「${title}」 운동이 추가되었습니다`);
}

function deleteWorkoutItem(workouts, id, dateStr) {
  const target = workouts.find((w) => w.id === id);
  if (!target) return;
  if (!confirm(`「${target.title}」 운동을 삭제할까요?`)) return;

  const updated = workouts.filter((w) => w.id !== id);
  setWorkoutsForDate(state, dateStr, updated);
  syncWorkoutTemplateFromDaily(updated);
  saveState(state);
  renderAll();
  showToast("운동이 삭제되었습니다");
}

function renderWorkoutListFooter(canEdit, workouts, dateStr) {
  const footer = document.getElementById("workout-list-footer");
  if (!footer) return;

  if (!canEdit || workouts.length === 0) {
    footer.classList.add("hidden");
    footer.innerHTML = "";
    return;
  }

  footer.classList.remove("hidden");
  footer.innerHTML = `
    <button type="button" class="btn btn-ghost btn-sm" id="add-workout-btn">+ 운동 추가</button>
  `;

  footer.querySelector("#add-workout-btn")?.addEventListener("click", () => {
    openWorkoutAddPicker(workouts, dateStr);
  });
}

function renderWorkoutRoutinePicker(dateStr, options = {}) {
  const picker = document.getElementById("workout-routine-picker");
  const list = document.getElementById("workout-list");
  if (!picker || !list) return;

  const canEdit = dateStr <= todayDateStr();
  if (!canEdit || !state.profile || !state.goals) {
    picker.classList.add("hidden");
    return;
  }

  if (!state.workoutRecommendations) state.workoutRecommendations = {};
  if (!state.workoutRecommendations[dateStr] || options.forceNew) {
    const previousRec = options.forceNew ? state.workoutRecommendations[dateStr] : null;
    state.workoutRecommendations[dateStr] = generateWorkoutRoutineRecommendation(
      state.profile,
      state.goals,
      dateStr,
      options.forceNew ? { random: true, previousRec } : {}
    );
    saveState(state);
  }

  const rec = state.workoutRecommendations[dateStr];
  const optionsList = rec?.routines || getWorkoutRoutineOptions(state.profile, state.goals);
  const generatedLabel = rec?.generatedAt
    ? new Date(rec.generatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : "";

  picker.classList.remove("hidden");
  list.innerHTML = "";

  picker.innerHTML = `
    <div class="routine-picker-header">
      <div>
        <h3>AI 추천 운동 루틴</h3>
        <p class="empty-hint">${escapeHtml(rec?.source || "맞춤 AI 추천")}${generatedLabel ? ` · ${generatedLabel} 생성` : ""} · 마음에 드는 루틴을 선택하세요.</p>
      </div>
      <div class="routine-picker-actions">
        <button type="button" class="btn btn-ghost btn-sm" id="regen-workout-routines">새 추천</button>
      </div>
    </div>
    <div class="routine-cards">
      ${optionsList
        .map(
          (r) => `
        <div class="routine-card">
          <div class="routine-card-top">
            <span class="routine-tag">${escapeHtml(r.tag)}</span>
            <h4>${escapeHtml(r.name)}</h4>
            <p>${escapeHtml(r.description)}</p>
          </div>
          <ul class="routine-exercises">
            ${r.exercises
              .slice(0, 5)
              .map((e) => `<li>${escapeHtml(e.title)} <span>${escapeHtml(e.meta)}</span></li>`)
              .join("")}
            ${r.exercises.length > 5 ? `<li class="routine-more">+${r.exercises.length - 5}개 더</li>` : ""}
          </ul>
          <button type="button" class="btn btn-primary btn-full select-routine-btn" data-routine-id="${escapeHtml(r.id)}">
            이 루틴 선택
          </button>
        </div>`
        )
        .join("")}
    </div>`;

  picker.querySelector("#regen-workout-routines")?.addEventListener("click", () => {
    const previousRec = state.workoutRecommendations[dateStr];
    state.workoutRecommendations[dateStr] = generateWorkoutRoutineRecommendation(
      state.profile,
      state.goals,
      dateStr,
      { random: true, previousRec }
    );
    saveState(state);
    renderWorkoutRoutinePicker(dateStr);
    showToast("새로운 운동 루틴 3가지를 추천했습니다");
  });

  picker.querySelectorAll(".select-routine-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const routine = optionsList.find((r) => r.id === btn.dataset.routineId);
      if (!routine) return;
      applyWorkoutRoutine(state, routine, dateStr);
      saveState(state);
      renderAll();
      showToast(`「${routine.name}」 루틴이 적용되었습니다`);
    });
  });
}

function bindWorkoutListEvents(workouts, dateStr, canEdit) {
  const workoutList = document.getElementById("workout-list");
  workoutList.querySelectorAll(".workout-check").forEach((cb) => {
    cb.addEventListener("change", () => {
      const id = Number(cb.dataset.id);
      const updated = workouts.map((w) => (w.id === id ? { ...w, done: cb.checked } : w));
      saveActiveWorkouts(updated);
      renderAll();
    });
  });

  workoutList.querySelectorAll(".edit-workout").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const w = workouts.find((x) => x.id === id);
      if (!w) return;
      const newTitle = prompt("운동명:", w.title);
      if (newTitle === null) return;
      const draft = normalizeWorkoutEntry({ ...w, title: newTitle.trim() || w.title });
      const newMeta = prompt(getWorkoutMetaHint(draft), draft.meta);
      if (newMeta === null) return;
      const title = newTitle.trim() || w.title;
      const meta = isCardioWorkout({ title, meta: newMeta })
        ? normalizeCardioMeta(title, newMeta.trim())
        : newMeta.trim() || w.meta;
      const updated = workouts.map((x) =>
        x.id === id ? normalizeWorkoutEntry({ ...x, title, meta }) : x
      );
      syncWorkoutTemplateFromDaily(updated);
      saveActiveWorkouts(updated);
      renderAll();
      showToast("운동 항목이 수정되었습니다");
    });
  });

  if (canEdit) {
    workoutList.querySelectorAll(".delete-workout").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteWorkoutItem(workouts, Number(btn.dataset.id), dateStr);
      });
    });
  }

  workoutList.querySelectorAll(".workout-memo").forEach((input) => {
    input.addEventListener("change", () => {
      const id = Number(input.dataset.id);
      const updated = workouts.map((w) => (w.id === id ? { ...w, memo: input.value } : w));
      saveActiveWorkouts(updated);
    });
    input.addEventListener("click", (e) => e.stopPropagation());
  });
}

function renderWorkoutListHtml(workouts, canEdit = true) {
  return workouts
    .map((w) => {
      const videoUrl = getExerciseVideoUrl(w.title);
      const memoPlaceholder = isCardioWorkout(w)
        ? "메모 (예: 페이스, 심박)"
        : isStretchWorkout(w)
          ? "메모 (예: 스트레칭 부위)"
          : "메모 (예: 80kg, 8회)";
      return `
    <li class="workout-item ${w.done ? "done" : ""}" data-id="${w.id}">
      <label class="check-label">
        <input type="checkbox" class="workout-check" data-id="${w.id}" ${w.done ? "checked" : ""} />
        <div class="check-info">
          <div class="check-title">${escapeHtml(w.title)}</div>
          <div class="check-meta">${escapeHtml(w.meta)}</div>
          ${renderWorkoutVideoLink(videoUrl)}
        </div>
      </label>
      <div class="workout-item-actions">
        ${canEdit ? `<button type="button" class="btn-icon edit-workout" data-id="${w.id}" title="수정">✏️</button>` : ""}
        ${canEdit ? `<button type="button" class="btn-icon delete-workout" data-id="${w.id}" title="삭제">🗑️</button>` : ""}
      </div>
      <div class="workout-memo-wrap">
        <input type="text" class="workout-memo" data-id="${w.id}" placeholder="${memoPlaceholder}" value="${escapeHtml(w.memo || "")}" />
      </div>
    </li>`;
    })
    .join("");
}

function renderMealRecommendationPanel(dateStr) {
  const panel = document.getElementById("meal-recommendation-panel");
  if (!panel || !state.nutrition) return;

  const canEdit = dateStr <= todayDateStr();
  if (!canEdit) {
    panel.innerHTML = "";
    return;
  }

  if (!state.mealRecommendations) state.mealRecommendations = {};
  if (!state.mealRecommendations[dateStr]) {
    state.mealRecommendations[dateStr] = generateMealPlanRecommendation(state, dateStr);
    saveState(state);
  }

  const rec = state.mealRecommendations[dateStr];
  if (!rec) {
    panel.innerHTML = "";
    return;
  }

  const { totals, targets } = rec;
  const generatedLabel = rec.generatedAt
    ? new Date(rec.generatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : "";
  const withinBadge = rec.withinTargets
    ? `<span class="badge badge-nutrition">목표치 이내 ✓</span>`
    : `<span class="badge" style="background:rgba(217,119,6,0.12);color:var(--warning)">목표 재조정됨</span>`;

  panel.innerHTML = `
    <div class="meal-rec-header">
      <div>
        <h3>AI 추천 식단</h3>
        <p class="empty-hint">${rec.source}${generatedLabel ? ` · ${generatedLabel} 생성` : ""}</p>
      </div>
      <div class="meal-rec-actions">
        ${withinBadge}
        <button type="button" class="btn btn-ghost btn-sm" id="regen-meal-plan">새 추천</button>
        <button type="button" class="btn btn-primary btn-sm" id="apply-all-meals">전체 적용</button>
      </div>
    </div>
    <div class="meal-rec-summary">
      <span>합계 <strong>${totals.calories}</strong> / ${targets.calories} kcal</span>
      <span>단백질 <strong>${totals.protein}g</strong> / ${targets.protein}g</span>
      <span>탄수 <strong>${totals.carbs}g</strong> / ${targets.carbs}g</span>
      <span>지방 <strong>${totals.fat}g</strong> / ${targets.fat}g</span>
    </div>
    <div class="meal-rec-grid">
      ${["breakfast", "lunch", "dinner"]
        .map((type) => {
          const meal = rec.meals[type];
          if (!meal) return "";
          return `
          <div class="meal-rec-card">
            <div class="meal-rec-card-head">
              <strong>${MEAL_LABELS[type]}</strong>
              <span>${meal.nutrition.calories} kcal</span>
            </div>
            <p class="meal-rec-name">${escapeHtml(meal.name)}</p>
            <p class="meal-rec-items">${escapeHtml(meal.itemsText)}</p>
            <p class="meal-rec-macros">P ${meal.nutrition.protein}g · C ${meal.nutrition.carbs}g · F ${meal.nutrition.fat}g</p>
            <div class="meal-rec-card-actions">
              ${renderMealVideoLink(meal.videoUrl || getMealVideoUrl(meal.name))}
              <button type="button" class="btn btn-ghost btn-sm apply-meal-btn" data-meal-type="${type}">${MEAL_LABELS[type]} 적용</button>
            </div>
          </div>`;
        })
        .join("")}
    </div>`;

  panel.querySelector("#regen-meal-plan")?.addEventListener("click", () => {
    const previousRec = state.mealRecommendations[dateStr];
    state.mealRecommendations[dateStr] = generateMealPlanRecommendation(state, dateStr, {
      random: true,
      previousRec,
    });
    saveState(state);
    renderMealRecommendationPanel(dateStr);
    renderMealSections(dateStr);
    renderNutritionSection(dateStr);
    showToast("새 식단 추천이 생성되었습니다");
  });

  panel.querySelector("#apply-all-meals")?.addEventListener("click", () => {
    const n = applyMealRecommendation(state, rec);
    saveState(state);
    renderAll();
    showToast(`${n}끼 식단이 기록에 적용되었습니다`);
  });

  panel.querySelectorAll(".apply-meal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = applyMealRecommendation(state, rec, [btn.dataset.mealType]);
      saveState(state);
      renderAll();
      showToast(`${MEAL_LABELS[btn.dataset.mealType]} 식단이 적용되었습니다`);
    });
  });
}

function renderToday() {
  if (!state.plan) return;

  const dateStr = getSelectedDate(state);
  const isToday = dateStr === todayDateStr();
  const workouts = getWorkoutsForDate(state, dateStr);

  document.getElementById("coach-message").innerHTML = isToday
    ? typeof computeLiveCoachMessage === "function"
      ? computeLiveCoachMessage(state)
      : state.plan.coachMessage
    : `<strong>${dateStr}</strong> 운동 기록입니다.<br>운동 완료 체크, 항목 수정, 메모 편집이 가능합니다.`;

  const dash = computeTodayDashboard(state);
  document.getElementById("today-dashboard").innerHTML = renderDashboardHTML(dash);

  const workoutList = document.getElementById("workout-list");
  const picker = document.getElementById("workout-routine-picker");
  const canEditWorkout = dateStr <= todayDateStr();
  const showPicker = workouts.length === 0 && canEditWorkout && state.profile && state.goals;

  if (showPicker) {
    renderWorkoutRoutinePicker(dateStr);
    document.getElementById("workout-daily-progress").innerHTML = "";
    renderWorkoutListFooter(false, workouts, dateStr);
  } else {
    if (picker) {
      picker.classList.add("hidden");
      picker.innerHTML = "";
    }

    if (workouts.length === 0) {
      workoutList.innerHTML = `<li class="empty-state">이 날짜의 운동 계획이 없습니다.</li>`;
      document.getElementById("workout-daily-progress").innerHTML = "";
      renderWorkoutListFooter(false, workouts, dateStr);
    } else {
      const routineLabel = state.selectedRoutineName
        ? `<p class="routine-selected-label">선택 루틴: <strong>${escapeHtml(state.selectedRoutineName)}</strong>${
            canEditWorkout
              ? ` · <button type="button" class="link-btn" id="change-routine-btn">루틴 변경</button>`
              : ""
          }</p>`
        : canEditWorkout
          ? `<p class="routine-selected-label"><button type="button" class="link-btn" id="change-routine-btn">루틴 다시 선택</button></p>`
          : "";

      workoutList.innerHTML = routineLabel + renderWorkoutListHtml(workouts, canEditWorkout);
      bindWorkoutListEvents(workouts, dateStr, canEditWorkout);
      renderWorkoutListFooter(canEditWorkout, workouts, dateStr);

      document.getElementById("change-routine-btn")?.addEventListener("click", () => {
        if (!confirm("현재 운동 목록을 지우고 루틴을 다시 선택할까요?")) return;
        const previousRec = state.workoutRecommendations?.[dateStr];
        delete state.dailyWorkouts[dateStr];
        state.workoutTemplate = [];
        state.selectedRoutineId = null;
        state.selectedRoutineName = null;
        if (!state.workoutRecommendations) state.workoutRecommendations = {};
        state.workoutRecommendations[dateStr] = generateWorkoutRoutineRecommendation(
          state.profile,
          state.goals,
          dateStr,
          { random: true, previousRec }
        );
        saveState(state);
        renderAll();
      });

      const wp = computeWorkoutProgress(workouts);
      document.getElementById("workout-daily-progress").innerHTML = `
        <div class="daily-progress-header">
          <span>운동 목표 달성률</span>
          <strong>${wp.pct}%</strong>
        </div>
        ${renderProgressBar("", wp.pct, `완료 ${wp.done}개 / 전체 ${wp.total}개`, "#0d9488")}
      `;
    }
  }

  const wp = computeWorkoutProgress(workouts);
  document.getElementById("workout-progress-badge").textContent = `${wp.done}/${wp.total}`;

  const feedback = computeAiFeedback(state, dateStr);
  document.getElementById("today-ai-feedback").innerHTML = feedback
    .map(
      (f) => `
      <div class="feedback-item ${f.type === "warning" ? "warning" : ""}">
        <span class="tag">${f.tag}</span>
        <p>${f.text}</p>
      </div>`
    )
    .join("");

  document.getElementById("goal-chain").innerHTML = (state.plan.goalChain || [])
    .map((item, i, arr) => {
      const arrow = i < arr.length - 1 ? '<span class="goal-chain-arrow">→</span>' : "";
      return `<span class="goal-chain-item ${item.current ? "current" : ""}">${item.label}: ${item.text}</span>${arrow}`;
    })
    .join("");

  renderNutritionSection(dateStr);
  renderMealRecommendationPanel(dateStr);
  renderMealSections(dateStr);
}

function renderNutritionSection(dateStr) {
  const nutrition = state.nutrition || createEmptyState().nutrition;
  const totals = computeNutritionTotalsForDate(state, dateStr);
  document.getElementById("nutrition-cal-badge").textContent =
    `${totals.calories.toLocaleString()} / ${nutrition.calories.target.toLocaleString()} kcal`;

  const nutritionItems = computeNutritionProgress(state, dateStr);
  document.getElementById("nutrition-summary").innerHTML = nutritionItems
    .map((n) =>
      renderProgressBar(n.label, n.pct, `${n.current} / ${n.target} ${n.unit}`, n.color)
    )
    .join("");
}

function sumMealNutrition(items) {
  return items.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.nutrition?.calories || 0),
      protein: acc.protein + (m.nutrition?.protein || 0),
      carbs: acc.carbs + (m.nutrition?.carbs || 0),
      fat: acc.fat + (m.nutrition?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function renderMealItemHtml(m, canEdit) {
  const videoUrl = m.videoUrl || getMealVideoUrl(m.name.split(" (")[0]);
  return `
    <div class="meal-item" data-id="${m.id}">
      <div class="meal-item-info">
        <strong>${escapeHtml(m.name)}</strong>
        <span class="meal-nutrition">
          ${m.nutrition.calories} kcal · P ${m.nutrition.protein}g
        </span>
        ${renderMealVideoLink(videoUrl)}
        ${m.confidence === "estimate" ? '<span class="meal-estimate">AI 추정</span>' : ""}
      </div>
      ${
        canEdit
          ? `<div class="meal-item-actions">
              <button type="button" class="btn-icon edit-meal" data-id="${m.id}" title="수정">✏️</button>
              <button type="button" class="btn-icon delete-meal" data-id="${m.id}" title="삭제">🗑️</button>
            </div>`
          : ""
      }
    </div>`;
}

function renderMealColumn(type, items, canEdit) {
  const totals = sumMealNutrition(items);
  const itemsHtml =
    items.length > 0
      ? items.map((m) => renderMealItemHtml(m, canEdit)).join("")
      : `<p class="meal-empty">${canEdit ? "음식을 추가하세요" : "기록 없음"}</p>`;

  return `
    <div class="meal-column" data-meal-type="${type}">
      <div class="meal-column-header">
        <h4>${MEAL_LABELS[type]}</h4>
        <span class="meal-column-kcal">${totals.calories > 0 ? `${totals.calories} kcal` : "-"}</span>
      </div>
      <div class="meal-column-body">
        ${itemsHtml}
      </div>
      ${
        totals.calories > 0
          ? `<div class="meal-column-footer">P ${totals.protein}g · C ${totals.carbs}g · F ${totals.fat}g</div>`
          : ""
      }
    </div>`;
}

function renderMealSections(dateStr) {
  const container = document.getElementById("meal-sections");
  const form = document.getElementById("meal-add-form");
  const canEdit = dateStr <= todayDateStr();

  if (form) {
    form.style.display = canEdit ? "flex" : "none";
    form.querySelectorAll("input, select, button").forEach((el) => {
      el.disabled = !canEdit;
    });
    const pickerBtn = document.getElementById("open-meal-picker-btn");
    if (pickerBtn) pickerBtn.style.display = canEdit ? "" : "none";
  }

  const meals = getMealsForDate(state, dateStr);
  const mainTypes = ["breakfast", "lunch", "dinner"];
  const snackItems = meals.filter((m) => m.mealType === "snack");

  const mainGrid = mainTypes
    .map((type) => {
      const items = meals.filter((m) => m.mealType === type);
      return renderMealColumn(type, items, canEdit);
    })
    .join("");

  const snackHtml =
    snackItems.length > 0
      ? `
      <div class="meal-snack-row">
        <div class="meal-column meal-column-snack" data-meal-type="snack">
          <div class="meal-column-header">
            <h4>${MEAL_LABELS.snack}</h4>
            <span class="meal-column-kcal">${sumMealNutrition(snackItems).calories} kcal</span>
          </div>
          <div class="meal-column-body meal-snack-items">
            ${snackItems.map((m) => renderMealItemHtml(m, canEdit)).join("")}
          </div>
        </div>
      </div>`
      : "";

  container.innerHTML = `
    <div class="meal-grid">${mainGrid}</div>
    ${snackHtml}`;

  if (canEdit) {
    container.querySelectorAll(".delete-meal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        state.mealLog = state.mealLog.filter((m) => m.id !== id);
        saveState(state);
        renderAll();
        showToast("음식이 삭제되었습니다");
      });
    });

    container.querySelectorAll(".edit-meal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const meal = state.mealLog.find((m) => m.id === id);
        if (!meal) return;
        const newName = prompt("음식명을 수정하세요:", meal.name);
        if (!newName || newName.trim() === meal.name) return;
        const analyzed = analyzeFood(newName.trim());
        if (!analyzed) return;
        meal.name = analyzed.name;
        meal.nutrition = analyzed.nutrition;
        meal.confidence = analyzed.confidence;
        meal.matched = analyzed.matched;
        saveState(state);
        renderAll();
        showToast("AI가 영양 정보를 다시 계산했습니다");
      });
    });
  }
}

let mealAddContext = null;

function initMealAddModal() {
  const modal = document.getElementById("meal-add-modal");
  if (!modal || modal.dataset.bound) return;
  modal.dataset.bound = "true";

  document.getElementById("meal-add-close")?.addEventListener("click", closeMealAddPicker);
  document.getElementById("meal-add-backdrop")?.addEventListener("click", closeMealAddPicker);
  document.getElementById("meal-add-back")?.addEventListener("click", () => {
    if (!mealAddContext) return;
    if (mealAddContext.step === "meals") {
      mealAddContext.step = "purpose";
      renderMealAddModalContent();
    } else if (mealAddContext.step === "purpose") {
      mealAddContext.step = "cuisine";
      mealAddContext.cuisineId = null;
      renderMealAddModalContent();
    }
  });
}

function openMealAddPicker(dateStr) {
  const form = document.getElementById("meal-add-form");
  const selectedMealType = form?.querySelector('[name="mealType"]')?.value || "lunch";

  mealAddContext = {
    dateStr,
    step: "cuisine",
    cuisineId: null,
    purposeId: getDefaultPurposeId(state.profile),
    highlightMealType: selectedMealType,
  };
  initMealAddModal();
  document.getElementById("meal-add-modal")?.classList.remove("hidden");
  document.body.classList.add("modal-open");
  renderMealAddModalContent();
}

function closeMealAddPicker() {
  mealAddContext = null;
  document.getElementById("meal-add-modal")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function renderMealAddModalContent() {
  if (!mealAddContext) return;

  const titleEl = document.getElementById("meal-add-title");
  const subtitleEl = document.getElementById("meal-add-subtitle");
  const backBtn = document.getElementById("meal-add-back");
  const bodyEl = document.getElementById("meal-add-body");
  if (!titleEl || !subtitleEl || !backBtn || !bodyEl) return;

  const { dateStr, step } = mealAddContext;
  const existingMeals = getMealsForDate(state, dateStr);
  const existingNames = new Set(existingMeals.map((m) => m.name.split(" (")[0]));

  if (step === "cuisine") {
    titleEl.textContent = "요리 종류 선택";
    subtitleEl.textContent = "한식 · 중식 · 양식 · 일식 중 선택하세요";
    backBtn.classList.add("hidden");

    bodyEl.innerHTML = `
      <div class="body-part-grid meal-cuisine-grid">
        ${MEAL_CUISINE_TYPES.map(
          (c) => `
          <button type="button" class="body-part-btn meal-cuisine-btn" data-cuisine-id="${c.id}">
            <span class="body-part-icon">${c.icon}</span>
            <span class="body-part-label">${c.label}</span>
          </button>`
        ).join("")}
      </div>`;

    bodyEl.querySelectorAll(".meal-cuisine-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        mealAddContext.cuisineId = btn.dataset.cuisineId;
        mealAddContext.step = "purpose";
        renderMealAddModalContent();
      });
    });
    return;
  }

  if (step === "purpose") {
    const cuisineLabel = getCuisineLabel(mealAddContext.cuisineId);
    titleEl.textContent = `${cuisineLabel} · 목표 선택`;
    subtitleEl.textContent = "다이어트 · 근비대 · 균형 중 선택하세요";
    backBtn.classList.remove("hidden");
    backBtn.textContent = "← 요리 종류";

    const defaultPurpose = getDefaultPurposeId(state.profile);

    bodyEl.innerHTML = `
      <div class="meal-purpose-grid">
        ${MEAL_PURPOSE_TYPES.map(
          (p) => `
          <button type="button" class="meal-purpose-btn ${p.id === defaultPurpose ? "recommended" : ""}" data-purpose-id="${p.id}">
            <strong>${p.label}</strong>
            <span>${p.desc}</span>
            ${p.id === defaultPurpose ? '<em class="meal-purpose-badge">내 목표</em>' : ""}
          </button>`
        ).join("")}
      </div>`;

    bodyEl.querySelectorAll(".meal-purpose-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        mealAddContext.purposeId = btn.dataset.purposeId;
        mealAddContext.step = "meals";
        renderMealAddModalContent();
      });
    });
    return;
  }

  const cuisineLabel = getCuisineLabel(mealAddContext.cuisineId);
  const purposeLabel = MEAL_PURPOSE_TYPES.find((p) => p.id === mealAddContext.purposeId)?.label || "";
  titleEl.textContent = `${cuisineLabel} ${purposeLabel} 추천 식단`;
  subtitleEl.textContent = "원하는 메뉴를 선택하면 해당 끼니에 추가됩니다";
  backBtn.classList.remove("hidden");
  backBtn.textContent = "← 목표 선택";

  const grouped = getMealsByCuisineAndPurpose(mealAddContext.cuisineId, mealAddContext.purposeId);

  bodyEl.innerHTML = ["breakfast", "lunch", "dinner"]
    .map((type) => {
      const items = grouped[type];
      if (!items.length) return "";
      const highlight = mealAddContext.highlightMealType === type ? " meal-pick-section--highlight" : "";
      return `
        <div class="meal-pick-section${highlight}">
          <h4 class="meal-pick-section-title">${MEAL_LABELS[type]}</h4>
          <ul class="exercise-pick-list">
            ${items
              .map((menu) => {
                const added = existingNames.has(menu.name);
                const itemsText = menu.items.join(" · ");
                return `
                <li class="exercise-pick-item ${added ? "added" : ""}">
                  <div class="exercise-pick-info">
                    <strong>${escapeHtml(menu.name)}</strong>
                    <span class="exercise-pick-meta">${menu.nutrition.calories} kcal · P ${menu.nutrition.protein}g</span>
                    <span class="exercise-pick-tip">${escapeHtml(itemsText)}</span>
                  </div>
                  <div class="exercise-pick-actions">
                    ${renderMealVideoLink(menu.videoUrl)}
                    <button type="button" class="btn btn-primary btn-sm pick-meal-btn" data-meal-type="${type}" data-meal-name="${escapeHtml(menu.name)}" ${added ? "disabled" : ""}>
                      ${added ? "추가됨" : "추가"}
                    </button>
                  </div>
                </li>`;
              })
              .join("")}
          </ul>
        </div>`;
    })
    .join("");

  bodyEl.querySelectorAll(".pick-meal-btn:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => {
      const menu = grouped[btn.dataset.mealType]?.find((m) => m.name === btn.dataset.mealName);
      if (!menu) return;
      applyCatalogMeal(state, dateStr, btn.dataset.mealType, {
        ...menu,
        itemsText: menu.items.join(" · "),
      });
      saveState(state);
      existingNames.add(menu.name);
      renderAll();
      renderMealAddModalContent();
      showToast(`「${menu.name}」이 ${MEAL_LABELS[btn.dataset.mealType]}에 추가되었습니다`);
    });
  });
}

function initMealForm() {
  const form = document.getElementById("meal-add-form");
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "true";

  document.getElementById("open-meal-picker-btn")?.addEventListener("click", () => {
    const dateStr = getSelectedDate(state);
    if (dateStr > todayDateStr()) {
      showToast("미래 날짜에는 식단을 추가할 수 없습니다");
      return;
    }
    openMealAddPicker(dateStr);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dateStr = getSelectedDate(state);
    if (dateStr > todayDateStr()) {
      showToast("미래 날짜에는 식단을 기록할 수 없습니다");
      return;
    }

    const fd = new FormData(e.target);
    const mealType = fd.get("mealType");
    const foodName = fd.get("foodName").trim();
    if (!foodName) return;

    const analyzed = analyzeFood(foodName);
    if (!analyzed) return;

    state.mealLog.push({
      id: Date.now(),
      mealType,
      name: analyzed.name,
      nutrition: analyzed.nutrition,
      confidence: analyzed.confidence,
      matched: analyzed.matched,
      date: dateStr,
    });

    state.logHistory.unshift({
      type: "식단",
      category: "meal",
      detail: `${MEAL_LABELS[mealType]} · ${analyzed.name} · ${analyzed.nutrition.calories} kcal`,
      time: formatTime(),
      date: dateStr,
      weekKey: getWeekKey(new Date(dateStr + "T12:00:00")),
    });

    saveState(state);
    renderAll();
    showToast(
      analyzed.confidence === "estimate"
        ? "음식이 추가되었습니다 (AI 추정 영양)"
        : "AI가 영양 정보를 분석하여 추가했습니다"
    );
    e.target.foodName.value = "";
  });
}

function renderLog() {
  const dateStr = getSelectedDate(state);
  const weekly = computeWeeklyWorkoutRate(state, dateStr);

  document.getElementById("log-weekly-pct").textContent = `${weekly.pct}%`;
  const rangeEl = document.getElementById("log-weekly-range");
  if (rangeEl) rangeEl.textContent = weekly.weekLabel;

  document.getElementById("log-weekly-summary").innerHTML = `
    ${renderProgressBar("주간 운동 수행률", weekly.pct, `${weekly.totalDone}/${weekly.totalPlanned}개 완료 · ${weekly.remaining}개 남음`, "#2563eb")}
  `;

  const weeklyChart = computeWeeklyChart(state, dateStr);
  const hasData = weekly.totalPlanned > 0;
  document.getElementById("log-weekly-chart").innerHTML = hasData
    ? weeklyChart
        .map(
          (d) => `
          <div class="bar-col ${d.date === getSelectedDate(state) ? "bar-col-active" : ""}">
            <span class="bar-value">${d.label}</span>
            <div class="bar" style="height:${Math.max(d.value, 4)}%"></div>
            <span class="bar-label">${d.day}</span>
          </div>`
        )
        .join("")
    : `<p class="empty-state chart-empty">운동을 체크하면 주간 수행률이 표시됩니다.</p>`;

  renderLogHistory();
}

function renderGoals() {
  if (!state.plan) return;

  const form = document.getElementById("goal-targets-form");
  if (form && state.goals) {
    const active = document.activeElement;
    const editingTargets = active && form.contains(active);
    if (!editingTargets) {
      form.targetWeight.value = state.goals.targetWeight ?? "";
      form.targetBodyFat.value = state.goals.targetBodyFat ?? "";
      form.targetSkeletalMuscle.value = state.goals.targetSkeletalMuscle ?? "";
    }
  }

  refreshGoalProgressUI();

  document.getElementById("goal-timeline").innerHTML = (state.plan.timeline || [])
    .map(
      (t) => `
      <div class="timeline-item ${t.active ? "active" : ""}">
        <div class="timeline-period">${t.period}</div>
        <div class="timeline-goal">${t.goal}</div>
        <div class="timeline-detail">${t.detail}</div>
      </div>`
    )
    .join("");
}

function renderProgress() {
  const dash = computeTodayDashboard(state);
  document.getElementById("progress-dashboard").innerHTML = renderDashboardHTML(dash);

  const stats = computeStats(state);
  document.getElementById("stats-grid").innerHTML = stats
    .map(
      (s) => `
      <div class="stat-card">
        <span class="label">${s.label}</span>
        <strong>${s.value}</strong>
      </div>`
    )
    .join("");

  const weeklyChart = computeWeeklyChart(state, getSelectedDate(state));
  const weekly = computeWeeklyWorkoutRate(state, getSelectedDate(state));
  document.getElementById("weekly-chart").innerHTML =
    weekly.totalPlanned > 0
      ? weeklyChart
          .map(
            (d) => `
            <div class="bar-col">
              <span class="bar-value">${d.label}</span>
              <div class="bar" style="height:${Math.max(d.value, 4)}%"></div>
              <span class="bar-label">${d.day}</span>
            </div>`
          )
          .join("")
      : `<p class="empty-state chart-empty">운동을 체크하면 차트가 표시됩니다.</p>`;

  renderBodyCharts();

  const feedback = computeAiFeedback(state, getSelectedDate(state));
  document.getElementById("ai-feedback-list").innerHTML = feedback
    .map(
      (f) => `
      <div class="feedback-item ${f.type === "warning" ? "warning" : ""}">
        <span class="tag">${f.tag}</span>
        <p>${f.text}</p>
      </div>`
    )
    .join("");
}

function renderProfile() {
  if (!state.profile) return;
  const p = state.profile;
  const currentWeight = getLatestBodyMetric(state)?.weight ?? p.weight;
  const smm = getCurrentSkeletalMuscle(state);
  const fields = [
    ["이름", p.name],
    ["나이", `${p.age}세`],
    ["성별", p.gender],
    ["키", `${p.height}cm`],
    ["시작 체중", `${getStartWeight(state)}kg`],
    ["현재 체중", `${currentWeight}kg`],
    ["체지방률", p.bodyFat ? `${p.bodyFat}%` : "-"],
    [
      "골격근량",
      smm.current != null ? `${smm.current}kg${smm.estimated ? " (추정)" : ""}` : "-",
    ],
    ["운동 경력", p.experience],
    ["운동 목적", p.purpose],
    ["가능 요일", p.availableDays.join(", ")],
    ["가능 시간", p.availableTime],
    ["헬스장", p.gym ? "이용" : "미이용"],
  ];

  document.getElementById("profile-grid").innerHTML = fields
    .map(
      ([label, value]) => `
      <div class="profile-item">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>`
    )
    .join("");

  if (state.goals) {
    const g = state.goals;
    const goalFields = [
      ["목표 체중", `${g.targetWeight}kg`],
      ["목표 체지방률", g.targetBodyFat ? `${g.targetBodyFat}%` : "-"],
      ["목표 골격근량", g.targetSkeletalMuscle ? `${g.targetSkeletalMuscle}kg` : "-"],
      ["달성 기간", `${g.periodMonths}개월`],
      ["운동 목표", g.workoutGoal],
      ["주간 운동", `${g.weeklyWorkouts}회`],
      ["주간 러닝", `${g.weeklyRunningKm}km`],
      ["개인 목표", g.customGoal || "-"],
    ];
    document.getElementById("goals-grid").innerHTML = goalFields
      .map(
        ([label, value]) => `
        <div class="profile-item">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>`
      )
      .join("");
  }
}

function renderLogHistory() {
  const el = document.getElementById("log-history");
  const logs = state.logHistory.filter(
    (l) => l.category === "workout" || l.category === "weight" || l.category === "meal"
  );
  if (logs.length === 0) {
    el.innerHTML = `<p class="empty-state">아직 기록이 없습니다. 운동과 식단을 기록해보세요.</p>`;
    return;
  }
  el.innerHTML = logs
    .slice(0, 20)
    .map(
      (entry) => `
      <div class="log-entry">
        <span><strong>${entry.type}</strong> · ${entry.detail}</span>
        <span class="time">${entry.time}</span>
      </div>`
    )
    .join("");
}

function initForms() {
  prefillBodyForm();

  const workoutForm = document.getElementById("workout-form");
  if (workoutForm && !workoutForm.dataset.bound) {
    workoutForm.dataset.bound = "true";
    workoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const type = fd.get("type");
      const duration = fd.get("duration");
      const intensity = fd.get("intensity");
      const distance = fd.get("distance");
      const dateStr = getSelectedDate(state);

      let detail = `${type} · ${duration}분 · ${intensity}`;
      if (type === "러닝" && distance) detail += ` · ${distance}km`;

      state.logHistory.unshift({
        type: "운동",
        category: "workout",
        detail,
        time: formatTime(),
        date: dateStr,
        weekKey: getWeekKey(new Date(dateStr + "T12:00:00")),
      });

      saveState(state);
      renderAll();
      showToast(`${type} ${duration}분 기록이 추가되었습니다`);
      e.target.reset();
    });
  }

  const bodyForm = document.getElementById("body-form");
  if (bodyForm && !bodyForm.dataset.bound) {
    bodyForm.dataset.bound = "true";
    bodyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const dateStr = fd.get("recordDate");
      const weight = Number(fd.get("weight"));
      const bodyFatRaw = fd.get("bodyFat");
      const bodyFat =
        bodyFatRaw != null && bodyFatRaw !== "" ? Number(bodyFatRaw) : null;
      const smmRaw = fd.get("skeletalMuscle");
      const skeletalMuscle =
        smmRaw != null && smmRaw !== "" ? Number(smmRaw) : null;

      if (dateStr > todayDateStr()) {
        showToast("미래 날짜에는 기록할 수 없습니다");
        return;
      }

      upsertBodyMetric(state, dateStr, weight, bodyFat, skeletalMuscle);

      let detail = `${weight}kg`;
      if (bodyFat != null) detail += ` · 체지방 ${bodyFat}%`;
      const saved = state.weightHistory.find((r) => r.date === dateStr);
      if (saved?.skeletalMuscle != null) detail += ` · 골격근 ${saved.skeletalMuscle}kg`;

      state.logHistory.unshift({
        type: "체성분",
        category: "weight",
        detail,
        time: formatTime(),
        date: dateStr,
        weekKey: getWeekKey(new Date(dateStr + "T12:00:00")),
      });

      saveState(state);
      renderAll();
      showToast("체성분 기록이 저장되었습니다");
    });
  }
}

function initCoachBtn() {
  const btn = document.getElementById("coach-btn");
  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = "true";
  btn.addEventListener("click", () => {
    showPage("today");
    document.querySelectorAll(".nav-item, .mobile-nav-item").forEach((b) => {
      b.classList.toggle("active", b.dataset.page === "today");
    });
    document.querySelector(".coach-banner")?.scrollIntoView({ behavior: "smooth" });
  });
}

function initAppVersion() {
  const el = document.getElementById("app-version");
  if (!el) return;
  fetch(`version.json?v=${Date.now()}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.version) {
        el.textContent = `${data.name || "FitCoach AI"} v${data.version}${data.updated ? ` · ${data.updated}` : ""}`;
      }
    })
    .catch(() => {});
}

function initResetBtn() {
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("모든 데이터가 삭제되고 처음부터 다시 시작합니다. 계속할까요?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = createEmptyState();
    showSetupFlow();
    document.getElementById("onboarding-form").reset();
    document.getElementById("goals-form").reset();
    showToast("초기화되었습니다. 기본 정보를 입력해주세요.");
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
