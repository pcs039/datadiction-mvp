export type Tone = "violet" | "blue" | "green" | "gold" | "rose" | "slate";

export type Metric = {
  label: string;
  value: string;
  delta: string;
  caption: string;
  tone: Tone;
};

export type Alert = {
  id: string;
  title: string;
  detail: string;
  tone: Tone;
};

export type Distribution = {
  label: string;
  value: number;
  tone: Tone;
};

export type Scene = {
  id: string;
  time: string;
  summary: string;
  functionLabel: string;
  relation: string;
  emotion: string[];
  narrative: string[];
  cds: number;
  confidence: number;
  suitability: number;
  risk: "HIGH" | "MEDIUM" | "LOW";
  status: string;
  evidence: string;
  tags: string[];
};

export type Dataset = {
  id: string;
  name: string;
  owner: string;
  sourceType: string;
  videos: number;
  scenes: number;
  reviewRate: number;
  suitability: string;
  status: string;
};

export type AuditEvent = {
  time: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  tone: Tone;
};

export const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Analysis", href: "/analysis" },
  { label: "Datasets", href: "/datasets" },
  { label: "Diagnostics", href: "/diagnostics" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
  { label: "Audit logs", href: "/audit-logs" },
];

export const metrics: Metric[] = [
  {
    label: "Context Integrity Score",
    value: "91.8%",
    delta: "+3.2%",
    caption: "전후 장면 정합성",
    tone: "violet",
  },
  {
    label: "Relation Detection Rate",
    value: "89.4%",
    delta: "+5.1%",
    caption: "발화-화면 관계 식별",
    tone: "blue",
  },
  {
    label: "Data Suitability Score",
    value: "B+",
    delta: "Acceptable",
    caption: "재사용 가능성 등급",
    tone: "gold",
  },
  {
    label: "Review Compliance",
    value: "High",
    delta: "HITL Ready",
    caption: "검수 프로토콜 준수",
    tone: "green",
  },
];

export const alerts: Alert[] = [
  {
    id: "VID-452",
    title: "Temporal drift detected",
    detail: "전후 장면 요약과 현재 발화의 주제 연결 약화",
    tone: "blue",
  },
  {
    id: "SCN-109",
    title: "Contextual risk flagged",
    detail: "발언 단독 사용 시 맥락 왜곡 가능성",
    tone: "rose",
  },
  {
    id: "SCN-024",
    title: "Rights review required",
    detail: "미성년자 등장 후보, 검수 우선순위 상향",
    tone: "gold",
  },
];

export const distribution: Distribution[] = [
  { label: "Speech + Text", value: 65, tone: "violet" },
  { label: "Visual Frames", value: 52, tone: "blue" },
  { label: "Context Window", value: 31, tone: "green" },
  { label: "Rights Metadata", value: 18, tone: "gold" },
];

export const scenes: Scene[] = [
  {
    id: "SCN_0001",
    time: "00:01:10-00:01:42",
    summary: "농촌 마을 길을 걷는 고령 주민과 공동체 회상 발화",
    functionLabel: "EMOTIONAL_BROLL",
    relation: "EMOTIONAL_REINFORCEMENT",
    emotion: ["NOSTALGIA", "WARMTH"],
    narrative: ["RECOLLECTION", "CONTEXT_BRIDGE"],
    cds: 0.72,
    confidence: 82,
    suitability: 61,
    risk: "HIGH",
    status: "REVIEW_REQUIRED",
    evidence:
      "발화는 마을 공동체의 기억을 설명하고, 화면은 노부부와 시골길을 보여주어 향수와 공동체 정서를 보강합니다.",
    tags: ["ELDERLY_OR_DECEASED_REVIEW", "CONTEXT_DISTORTION_RISK"],
  },
  {
    id: "SCN_0008",
    time: "00:04:18-00:04:51",
    summary: "정책 담당자 인터뷰와 현장 지원 사업 설명",
    functionLabel: "CORE_INTERVIEW",
    relation: "EXPLANATORY_INSERT",
    emotion: ["GRAVITY"],
    narrative: ["EXPLANATION", "EVIDENCE"],
    cds: 0.38,
    confidence: 89,
    suitability: 78,
    risk: "MEDIUM",
    status: "IN_REVIEW",
    evidence:
      "담당자 발화가 핵심 정보를 전달하며, 현장 화면은 정책 설명의 근거로 붙어 있습니다.",
    tags: ["SPEECH_ISOLATION_RISK"],
  },
  {
    id: "SCN_0017",
    time: "00:09:32-00:09:58",
    summary: "행사장 전경, 참가자 이동, 현장 분위기 스케치",
    functionLabel: "TRANSITION_CUT",
    relation: "BACKGROUND_BROLL",
    emotion: ["ACTIVITY"],
    narrative: ["TRANSITION"],
    cds: 0.18,
    confidence: 93,
    suitability: 86,
    risk: "LOW",
    status: "CONFIRMED",
    evidence:
      "발화 의존도가 낮고 행사 분위기 전달에 적합해 독립 재사용 가능성이 높습니다.",
    tags: ["LOW_CONTEXT_DEPENDENCY"],
  },
  {
    id: "SCN_0024",
    time: "00:13:04-00:13:46",
    summary: "아동 체험 활동과 교육 효과를 설명하는 내레이션",
    functionLabel: "EVIDENCE_INSERT",
    relation: "DIRECT_MATCH",
    emotion: ["JOY", "HOPE"],
    narrative: ["EVIDENCE", "EMOTIONAL_BUILDUP"],
    cds: 0.51,
    confidence: 77,
    suitability: 54,
    risk: "HIGH",
    status: "REVIEW_REQUIRED",
    evidence:
      "화면과 내레이션은 직접 대응하지만 미성년자 등장 후보로 권리·동의 범위 검수가 필요합니다.",
    tags: ["MINOR_APPEARANCE", "PORTRAIT_RIGHT_REVIEW"],
  },
];

export const barMetrics: {
  label: string;
  source: string;
  value: number;
  tone: Tone;
}[] = [
  { label: "Speech Isolation", source: "Risk Source 1", value: 12, tone: "violet" },
  { label: "Rights Review", source: "Risk Source 2", value: 8, tone: "blue" },
  { label: "Language Nuance", source: "Risk Source 3", value: 19, tone: "violet" },
  { label: "Cultural Context", source: "Risk Source 4", value: 15, tone: "blue" },
];

export const sourceTypes = [
  ["Text", "65%"],
  ["Video", "35%"],
  ["Source Rights", "7%"],
  ["Portrait Risk", "8%"],
  ["Language Nuance", "1%"],
  ["Cultural Context", "0%"],
];

export const datasets: Dataset[] = [
  {
    id: "VIDSET-001",
    name: "지역 기록 영상 PoC",
    owner: "○○문화재단",
    sourceType: "지역 기록",
    videos: 4,
    scenes: 184,
    reviewRate: 68,
    suitability: "B+",
    status: "Active",
  },
  {
    id: "VIDSET-002",
    name: "공공 홍보 영상 샘플",
    owner: "공공기관 홍보팀",
    sourceType: "홍보·정책",
    videos: 7,
    scenes: 312,
    reviewRate: 42,
    suitability: "B",
    status: "Ingesting",
  },
  {
    id: "VIDSET-003",
    name: "교육 행사 아카이브",
    owner: "지역 교육센터",
    sourceType: "교육·행사",
    videos: 3,
    scenes: 96,
    reviewRate: 81,
    suitability: "A-",
    status: "Reviewed",
  },
];

export const workflowStages: [string, string, number, Tone][] = [
  ["Video Ingestion", "영상 파일과 기관·권리 메모 수집", 100, "green"],
  ["Preprocessing", "오디오, STT, 자막, 대표 프레임 추출", 100, "green"],
  ["Scene Segmentation", "컷 변화, 발화 주제, 시간 간격 기반 분할", 92, "blue"],
  ["Multimodal Alignment", "프레임·발화·자막·전후 장면 정렬", 76, "violet"],
  ["SceneContext Inference", "관계, 기능, 정서·서사, 위험 후보 추론", 64, "gold"],
  ["HITL Review", "AI 판단 근거 확인, 라벨 수정, 최종 확정", 41, "rose"],
];

export const auditEvents: AuditEvent[] = [
  {
    time: "2026-05-27 17:42",
    actor: "AI Pipeline",
    action: "Generated inference labels",
    target: "VIDSET-001 / 184 scenes",
    detail: "Scene function, relation, CDS, risk candidates generated.",
    tone: "blue",
  },
  {
    time: "2026-05-27 18:05",
    actor: "Reviewer",
    action: "Changed scene function",
    target: "SCN_0001",
    detail: "BACKGROUND_BROLL에서 EMOTIONAL_BROLL로 수정했습니다.",
    tone: "violet",
  },
  {
    time: "2026-05-27 18:22",
    actor: "Reviewer",
    action: "Confirmed rights flag",
    target: "SCN_0024",
    detail: "MINOR_APPEARANCE 후보를 검수 필요 상태로 유지했습니다.",
    tone: "rose",
  },
  {
    time: "2026-05-27 18:49",
    actor: "Report Bot",
    action: "Drafted suitability statement",
    target: "VIDSET-001",
    detail: "B+ 등급의 데이터 적합성 명세서 초안을 생성했습니다.",
    tone: "gold",
  },
];
