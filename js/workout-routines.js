function getWorkoutRoutineOptions(profile, goals) {
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
