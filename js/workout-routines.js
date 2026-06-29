function getWorkoutRoutineOptions(profile, goals) {
  return getStaticWorkoutRoutineOptions(profile, goals);
}

function getStaticWorkoutRoutineOptions(profile, goals) {
  const hasGym = profile.gym;
  const purpose = profile.purpose;
  const dailyKm =
    goals.weeklyRunningKm > 0
      ? Math.max(2, Math.round((goals.weeklyRunningKm / Math.max(profile.availableDays.length, 1)) * 10) / 10)
      : 0;

  const stretch = { title: "스트레칭", meta: "10~15분" };
  const running =
    dailyKm > 0 ? { title: "러닝", meta: `${dailyKm}km` } : null;

  function withExtras(exercises) {
    const list = [...exercises];
    if (running) list.push(running);
    list.push(stretch);
    return list;
  }

  if (hasGym) {
    if (purpose === "근비대") {
      return [
        {
          id: "bulk-push",
          name: "가슴 · 삼두 중심",
          description: "벤치프레스 중심 상체 밀기 루틴. 4~5세트로 볼륨 확보.",
          tag: "근비대",
          exercises: withExtras([
            { title: "벤치프레스", meta: "5세트 × 6~8회" },
            { title: "인클라인 덤벨 프레스", meta: "4세트 × 10회" },
            { title: "딥스", meta: "4세트 × 10회" },
            { title: "케이블 트라이셉스", meta: "4세트 × 12회" },
          ]),
        },
        {
          id: "bulk-pull",
          name: "등 · 이두 중심",
          description: "데드리프트·풀업으로 등 두께와 당기는 근력 강화.",
          tag: "근비대",
          exercises: withExtras([
            { title: "데드리프트", meta: "5세트 × 5~6회" },
            { title: "랫풀다운", meta: "4세트 × 10회" },
            { title: "바벨 로우", meta: "4세트 × 10회" },
            { title: "덤벨 컬", meta: "4세트 × 12회" },
          ]),
        },
        {
          id: "bulk-legs",
          name: "하체 · 어깨 중심",
          description: "스쿼트 5세트로 하체 볼륨 + 어깨 안정화.",
          tag: "근비대",
          exercises: withExtras([
            { title: "스쿼트", meta: "5세트 × 6~8회" },
            { title: "루마니안 데드리프트", meta: "4세트 × 10회" },
            { title: "레그프레스", meta: "4세트 × 12회" },
            { title: "오버헤드 프레스", meta: "4세트 × 8회" },
          ]),
        },
      ];
    }

    if (purpose === "다이어트") {
      return [
        {
          id: "cut-full",
          name: "전신 서킷",
          description: "복합 운동 위주 전신 루틴. 칼로리 소모와 근육 유지.",
          tag: "다이어트",
          exercises: withExtras([
            { title: "스쿼트", meta: "4세트 × 12~15회" },
            { title: "랫풀다운", meta: "4세트 × 12회" },
            { title: "덤벨 프레스", meta: "4세트 × 12회" },
            { title: "플랭크", meta: "4세트 × 45초" },
          ]),
        },
        {
          id: "cut-upper",
          name: "상체 · 코어",
          description: "상체 근력 + 코어 안정. 4~5세트 고반복.",
          tag: "다이어트",
          exercises: withExtras([
            { title: "인cline 벤치프레스", meta: "4세트 × 12회" },
            { title: "시티드 로우", meta: "4세트 × 12회" },
            { title: "숄더 프레스", meta: "4세트 × 12회" },
            { title: "케이블 크런치", meta: "5세트 × 15회" },
          ]),
        },
        {
          id: "cut-lower",
          name: "하체 · 유산소",
          description: "하체 근력 5세트 + 유산소로 체지방 연소.",
          tag: "다이어트",
          exercises: withExtras([
            { title: "레그프레스", meta: "5세트 × 15회" },
            { title: "루마니안 데드리프트", meta: "4세트 × 12회" },
            { title: "런지", meta: "4세트 × 12회(각 다리)" },
            { title: "레그 컬", meta: "4세트 × 15회" },
          ]),
        },
      ];
    }

    return [
      {
        id: "bal-full",
        name: "전신 밸런스",
        description: "상·하체 균형 잡힌 4~5세트 전신 루틴.",
        tag: "체력",
        exercises: withExtras([
          { title: "스쿼트", meta: "4세트 × 10회" },
          { title: "벤치프레스", meta: "4세트 × 10회" },
          { title: "랫풀다운", meta: "4세트 × 10회" },
          { title: "숄더 프레스", meta: "4세트 × 10회" },
        ]),
      },
      {
        id: "bal-upper",
        name: "상체 집중",
        description: "밀기·당기기 패턴으로 상체 근력 강화.",
        tag: "체력",
        exercises: withExtras([
          { title: "벤치프레스", meta: "5세트 × 8회" },
          { title: "바벨 로우", meta: "4세트 × 10회" },
          { title: "딥스", meta: "4세트 × 10회" },
          { title: "페이스 풀", meta: "4세트 × 15회" },
        ]),
      },
      {
        id: "bal-lower",
        name: "하체 집중",
        description: "하체 중심 5세트 + 코어 보강.",
        tag: "체력",
        exercises: withExtras([
          { title: "스쿼트", meta: "5세트 × 8회" },
          { title: "레그프레스", meta: "4세트 × 12회" },
          { title: "힙 쓰러스트", meta: "4세트 × 12회" },
          { title: "플랭크", meta: "4세트 × 60초" },
        ]),
      },
    ];
  }

  return [
    {
      id: "home-full",
      name: "맨몸 전신",
      description: "장비 없이 전신을 4~5세트로 자극.",
      tag: "홈트",
      exercises: withExtras([
        { title: "푸시업", meta: "4세트 × 15~20회" },
        { title: "스쿼트", meta: "5세트 × 20회" },
        { title: "런지", meta: "4세트 × 12회(각 다리)" },
        { title: "플랭크", meta: "4세트 × 45초" },
      ]),
    },
    {
      id: "home-upper",
      name: "맨몸 상체",
      description: "푸시업 변형 + 코어 4~5세트.",
      tag: "홈트",
      exercises: withExtras([
        { title: "와이드 푸시업", meta: "4세트 × 12회" },
        { title: "다이아몬드 푸시업", meta: "4세트 × 10회" },
        { title: "딥스(의자)", meta: "4세트 × 12회" },
        { title: "마운틴 클라이머", meta: "5세트 × 30초" },
      ]),
    },
    {
      id: "home-lower",
      name: "맨몸 하체",
      description: "하체 볼륨 5세트 + 유산소.",
      tag: "홈트",
      exercises: withExtras([
        { title: "스쿼트", meta: "5세트 × 25회" },
        { title: "점프 스쿼트", meta: "4세트 × 15회" },
        { title: "글루트 브릿지", meta: "4세트 × 20회" },
        { title: "카프 레이즈", meta: "4세트 × 20회" },
      ]),
    },
  ];
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getCatalogExercises(partId, profile, count) {
  const env = profile.gym ? "gym" : "home";
  const pool = EXERCISE_CATALOG[partId]?.[env] || [];
  return shuffleArray(pool)
    .slice(0, Math.min(count, pool.length))
    .map(({ title, meta }) => ({ title, meta }));
}

function buildCardioExtra(profile, goals) {
  const dailyKm =
    goals.weeklyRunningKm > 0
      ? Math.max(2, Math.round((goals.weeklyRunningKm / Math.max(profile.availableDays.length, 1)) * 10) / 10)
      : 0;
  if (dailyKm > 0) return { title: "러닝", meta: `${dailyKm}km` };
  const env = profile.gym ? "gym" : "home";
  const pool = EXERCISE_CATALOG.cardio?.[env] || [];
  if (!pool.length) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { title: pick.title, meta: pick.meta };
}

function buildStretchExtra(profile) {
  const env = profile.gym ? "gym" : "home";
  const pool = EXERCISE_CATALOG.stretch?.[env] || [];
  if (!pool.length) return { title: "스트레칭", meta: "10~15분" };
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { title: pick.title, meta: pick.meta };
}

function withWorkoutExtras(exercises, profile, goals) {
  const list = [...exercises];
  const cardio = buildCardioExtra(profile, goals);
  if (cardio) list.push(cardio);
  list.push(buildStretchExtra(profile));
  return list;
}

function getDynamicRoutineBlueprints(profile) {
  const tag =
    profile.purpose === "근비대"
      ? "근비대"
      : profile.purpose === "다이어트"
        ? "다이어트"
        : profile.gym
          ? "체력"
          : "홈트";

  return [
    {
      id: "dyn-push",
      name: "푸시 데이",
      description: "가슴·어깨·삼두 밀기 패턴으로 상체 전면 자극.",
      tag,
      parts: [
        { id: "chest", n: 2 },
        { id: "shoulders", n: 1 },
        { id: "arms", n: 1 },
      ],
    },
    {
      id: "dyn-pull",
      name: "풀 데이",
      description: "등·이두 당기기 + 코어로 균형 잡힌 상체 루틴.",
      tag,
      parts: [
        { id: "back", n: 2 },
        { id: "arms", n: 1 },
        { id: "core", n: 1 },
      ],
    },
    {
      id: "dyn-legs",
      name: "레그 데이",
      description: "하체 볼륨 집중 + 코어 안정화.",
      tag,
      parts: [
        { id: "legs", n: 3 },
        { id: "core", n: 1 },
      ],
    },
    {
      id: "dyn-upper",
      name: "상체 통합",
      description: "가슴·등·어깨·팔을 골고루 자극하는 상체 루틴.",
      tag,
      parts: [
        { id: "chest", n: 1 },
        { id: "back", n: 1 },
        { id: "shoulders", n: 1 },
        { id: "arms", n: 1 },
      ],
    },
    {
      id: "dyn-full",
      name: "전신 서킷",
      description: "하체·상체·코어 복합 운동으로 전신 자극.",
      tag,
      parts: [
        { id: "legs", n: 1 },
        { id: "chest", n: 1 },
        { id: "back", n: 1 },
        { id: "core", n: 1 },
      ],
    },
    {
      id: "dyn-shoulder-core",
      name: "어깨 · 코어",
      description: "어깨 안정성과 코어 강화에 집중.",
      tag,
      parts: [
        { id: "shoulders", n: 2 },
        { id: "core", n: 2 },
      ],
    },
  ];
}

function buildDynamicRoutines(profile, goals) {
  return getDynamicRoutineBlueprints(profile).map((bp) => ({
    id: bp.id,
    name: bp.name,
    description: bp.description,
    tag: bp.tag,
    dynamic: true,
    exercises: withWorkoutExtras(
      bp.parts.flatMap(({ id, n }) => getCatalogExercises(id, profile, n)),
      profile,
      goals
    ),
  }));
}

function getWorkoutRoutinePool(profile, goals) {
  const staticRoutines = getStaticWorkoutRoutineOptions(profile, goals);
  const dynamicRoutines = buildDynamicRoutines(profile, goals);
  const seen = new Set();
  return [...staticRoutines, ...dynamicRoutines].filter((routine) => {
    if (seen.has(routine.id)) return false;
    seen.add(routine.id);
    return routine.exercises?.length > 0;
  });
}

function generateWorkoutRoutineRecommendation(profile, goals, dateStr, options = {}) {
  const staticRoutines = getStaticWorkoutRoutineOptions(profile, goals);
  const envLabel = profile.gym ? "헬스장" : "홈트";
  const purposeLabel = profile.purpose || "맞춤";
  const source = `${envLabel} · ${purposeLabel} AI 추천`;

  if (!options.random) {
    return {
      date: dateStr,
      routines: staticRoutines.slice(0, 3),
      generatedAt: new Date().toISOString(),
      source,
    };
  }

  const pool = getWorkoutRoutinePool(profile, goals);
  const previousIds = new Set((options.previousRec?.routines || []).map((r) => r.id));
  let candidates = pool.filter((r) => !previousIds.has(r.id));
  if (candidates.length < 3) candidates = pool;

  const picked = shuffleArray(candidates).slice(0, Math.min(3, candidates.length));
  const routines = picked.map((routine) => {
    if (!routine.dynamic) return routine;
    return buildDynamicRoutines(profile, goals).find((d) => d.id === routine.id) || routine;
  });

  return {
    date: dateStr,
    routines,
    generatedAt: new Date().toISOString(),
    source,
  };
}

function applyWorkoutRoutine(state, routine, dateStr) {
  state.workoutTemplate = routine.exercises.map(({ title, meta }) => ({ title, meta }));
  state.selectedRoutineId = routine.id;
  state.selectedRoutineName = routine.name;

  const workouts = routine.exercises.map((e, i) => ({
    id: Date.parse(dateStr + "T12:00:00") + i,
    title: e.title,
    meta: e.meta,
    done: false,
    memo: "",
  }));

  setWorkoutsForDate(state, dateStr, workouts);
  return workouts;
}
