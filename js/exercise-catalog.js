const EXERCISE_BODY_PARTS = [
  { id: "chest", label: "가슴", icon: "🏋️" },
  { id: "back", label: "등", icon: "🔙" },
  { id: "shoulders", label: "어깨", icon: "⬆️" },
  { id: "arms", label: "팔", icon: "💪" },
  { id: "legs", label: "하체", icon: "🦵" },
  { id: "core", label: "코어", icon: "🎯" },
  { id: "cardio", label: "유산소", icon: "🏃" },
  { id: "stretch", label: "스트레칭", icon: "🧘" },
];

const EXERCISE_CATALOG = {
  chest: {
    gym: [
      { title: "벤치프레스", meta: "4세트 × 8~10회", tip: "가슴 전체 볼륨" },
      { title: "인클라인 덤벨 프레스", meta: "4세트 × 10회", tip: "윗가슴 집중" },
      { title: "덤벨 프레스", meta: "4세트 × 10~12회", tip: "가동성·균형" },
      { title: "케이블 플라이", meta: "4세트 × 12~15회", tip: "가슴 수축" },
      { title: "딥스", meta: "4세트 × 10회", tip: "가슴·삼두" },
      { title: "펙덱 플라이", meta: "4세트 × 12회", tip: "가슴 고립" },
    ],
    home: [
      { title: "푸시업", meta: "4세트 × 15~20회", tip: "맨몸 가슴" },
      { title: "와이드 푸시업", meta: "4세트 × 12회", tip: "가슴 외측" },
      { title: "인클라인 푸시업", meta: "4세트 × 12회", tip: "윗가슴" },
      { title: "딥스(의자)", meta: "4세트 × 12회", tip: "삼두·가슴" },
    ],
  },
  back: {
    gym: [
      { title: "데드리프트", meta: "5세트 × 5~6회", tip: "전신·등 두께" },
      { title: "랫풀다운", meta: "4세트 × 10~12회", tip: "광배근" },
      { title: "바벨 로우", meta: "4세트 × 10회", tip: "등 중앙" },
      { title: "시티드 로우", meta: "4세트 × 12회", tip: "등 두께" },
      { title: "풀업", meta: "4세트 × 6~10회", tip: "당기는 근력" },
      { title: "페이스 풀", meta: "4세트 × 15회", tip: "후면 어깨·등" },
    ],
    home: [
      { title: "슈퍼맨", meta: "4세트 × 15회", tip: "척추 기립근" },
      { title: "역기립푸시업", meta: "4세트 × 12회", tip: "등·어깨" },
      { title: "밴드 로우", meta: "4세트 × 15회", tip: "등 중앙" },
      { title: "풀업/랫풀다운", meta: "4세트 × 10회", tip: "당기기 패턴" },
    ],
  },
  shoulders: {
    gym: [
      { title: "오버헤드 프레스", meta: "4세트 × 8~10회", tip: "어깨 전체" },
      { title: "숄더 프레스", meta: "4세트 × 10회", tip: "전면·측면" },
      { title: "사이드 레터럴 레이즈", meta: "4세트 × 12~15회", tip: "측면 삼각근" },
      { title: "프론트 레이즈", meta: "4세트 × 12회", tip: "전면 삼각근" },
      { title: "리어 델트 플라이", meta: "4세트 × 15회", tip: "후면 삼각근" },
      { title: "아놀드 프레스", meta: "4세트 × 10회", tip: "3면 자극" },
    ],
    home: [
      { title: "피크 푸시업", meta: "4세트 × 10회", tip: "어깨 집중" },
      { title: "밴드 레터럴 레이즈", meta: "4세트 × 15회", tip: "측면 어깨" },
      { title: "밴드 프레스", meta: "4세트 × 12회", tip: "어깨 전체" },
    ],
  },
  arms: {
    gym: [
      { title: "덤벨 컬", meta: "4세트 × 10~12회", tip: "이두근" },
      { title: "해머 컬", meta: "4세트 × 12회", tip: "전완·이두" },
      { title: "케이블 트라이셉스", meta: "4세트 × 12~15회", tip: "삼두" },
      { title: "스컬크러셔", meta: "4세트 × 12회", tip: "삼두 장두" },
      { title: "바벨 컬", meta: "4세트 × 10회", tip: "이두 볼륨" },
      { title: "오버헤드 익스텐션", meta: "4세트 × 12회", tip: "삼두 장두" },
    ],
    home: [
      { title: "다이아몬드 푸시업", meta: "4세트 × 10회", tip: "삼두" },
      { title: "딥스(의자)", meta: "4세트 × 12회", tip: "삼두" },
      { title: "밴드 컬", meta: "4세트 × 15회", tip: "이두" },
    ],
  },
  legs: {
    gym: [
      { title: "스쿼트", meta: "5세트 × 6~10회", tip: "하체 기본" },
      { title: "레그프레스", meta: "4세트 × 12~15회", tip: "대퇴사두" },
      { title: "루마니안 데드리프트", meta: "4세트 × 10회", tip: "햄스트링" },
      { title: "런지", meta: "4세트 × 12회(각 다리)", tip: "균형·하체" },
      { title: "레그 컬", meta: "4세트 × 12~15회", tip: "햄스트링" },
      { title: "힙 쓰러스트", meta: "4세트 × 12회", tip: "둔근" },
      { title: "카프 레이즈", meta: "4세트 × 15~20회", tip: "종아리" },
    ],
    home: [
      { title: "스쿼트", meta: "5세트 × 20~25회", tip: "맨몸 하체" },
      { title: "런지", meta: "4세트 × 12회(각 다리)", tip: "균형" },
      { title: "점프 스쿼트", meta: "4세트 × 15회", tip: "폭발력" },
      { title: "글루트 브릿지", meta: "4세트 × 20회", tip: "둔근" },
      { title: "카프 레이즈", meta: "4세트 × 20회", tip: "종아리" },
    ],
  },
  core: {
    gym: [
      { title: "플랭크", meta: "4세트 × 45~60초", tip: "코어 안정" },
      { title: "케이블 크런치", meta: "4세트 × 15회", tip: "복근" },
      { title: "행잉 레그 레이즈", meta: "4세트 × 12회", tip: "하복부" },
      { title: "데드버그", meta: "4세트 × 12회(각쪽)", tip: "코어 조절" },
      { title: "러시안 트위스트", meta: "4세트 × 20회", tip: "복사근" },
    ],
    home: [
      { title: "플랭크", meta: "4세트 × 45초", tip: "코어" },
      { title: "마운틴 클라이머", meta: "4세트 × 30초", tip: "유산소+코어" },
      { title: "크런치", meta: "4세트 × 20회", tip: "복근" },
      { title: "레그 레이즈", meta: "4세트 × 15회", tip: "하복부" },
    ],
  },
  cardio: {
    gym: [
      { title: "러닝", meta: "3km", tip: "유산소 · 거리" },
      { title: "사이클", meta: "20분", tip: "저충격 유산소" },
      { title: "로잉", meta: "15분", tip: "전신 유산소" },
      { title: "스텝밀", meta: "15분", tip: "하체·심폐" },
    ],
    home: [
      { title: "러닝", meta: "3km", tip: "야외·트레드밀" },
      { title: "줄넘기", meta: "10분", tip: "순발력·유산소" },
      { title: "버피", meta: "15분", tip: "전신 유산소" },
      { title: "인터벌 러닝", meta: "20분", tip: "HIIT" },
    ],
  },
  stretch: {
    gym: [
      { title: "스트레칭", meta: "10~15분", tip: "운동 후 쿨다운" },
      { title: "폼롤러", meta: "10분", tip: "근막 이완" },
      { title: "고관절 스트레칭", meta: "5분", tip: "하체 유연성" },
      { title: "어깨·가슴 스트레칭", meta: "5분", tip: "상체 이완" },
    ],
    home: [
      { title: "스트레칭", meta: "10~15분", tip: "전신 이완" },
      { title: "고관절 스트레칭", meta: "5분", tip: "하체" },
      { title: "목·어깨 스트레칭", meta: "5분", tip: "상체" },
    ],
  },
};

function getBodyPartLabel(partId) {
  return EXERCISE_BODY_PARTS.find((p) => p.id === partId)?.label || partId;
}

function getExercisesForBodyPart(partId, hasGym) {
  const part = EXERCISE_CATALOG[partId];
  if (!part) return [];
  const key = hasGym ? "gym" : "home";
  return part[key] || part.gym || [];
}
