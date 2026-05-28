import { createClient } from "@supabase/supabase-js";
import { formatKstDateTime } from "../../../date";

type DatasetRow = {
  code: string;
  name: string;
  source_type: string;
  scenes_count: number;
  suitability_grade: string;
  status: string;
};

type SceneStatusRow = {
  scene_code: string;
  review_status: string;
};

type SceneOverviewRow = {
  id: string;
  summary: string;
  risk: string;
  status: string;
  suitability: number;
  tags: string[] | null;
};

type ReviewRow = {
  reviewer_name: string;
  field_name: string;
  before_value: string | null;
  after_value: string | null;
  comment: string | null;
  created_at: string;
};

type AuditEventRow = {
  event_time: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
};

type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeStatus(status: string) {
  return status.trim().toUpperCase();
}

function isOpenReviewStatus(status: string) {
  const normalized = normalizeStatus(status);
  return (
    normalized === "REVIEW_REQUIRED" ||
    normalized === "IN_REVIEW" ||
    normalized === "PENDING" ||
    normalized === "PENDING_REVIEW" ||
    normalized.includes("대기")
  );
}

function normalizeRisk(risk: string): RiskLevel {
  const normalized = risk.trim().toUpperCase();
  if (normalized === "HIGH" || normalized === "MEDIUM" || normalized === "LOW") {
    return normalized;
  }
  return "MEDIUM";
}

function countByValue(values: string[]) {
  const counts: Record<string, number> = {};

  for (const value of values) {
    const key = value.trim() || "UNKNOWN";
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function average(values: number[]) {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (validValues.length === 0) return 0;

  const total = validValues.reduce((sum, value) => sum + value, 0);
  return Math.round((total / validValues.length) * 10) / 10;
}

function topRiskCandidates(scenes: SceneOverviewRow[]) {
  const tagCounts = new Map<string, number>();

  for (const scene of scenes) {
    for (const tag of scene.tags ?? []) {
      const normalizedTag = tag.trim();
      if (!normalizedTag) continue;
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) ?? 0) + 1);
    }
  }

  const tags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([tag, count]) => ({
      label: tag,
      count,
    }));

  if (tags.length > 0) return tags;

  return scenes
    .filter((scene) => normalizeRisk(scene.risk) === "HIGH")
    .slice(0, 6)
    .map((scene) => ({
      label: scene.id,
      count: 1,
    }));
}

function buildUsageConditions(highRiskCount: number, openReviewCount: number) {
  const conditions = [
    "본 초안은 법률적 사용 가능 판정이 아니라 데이터 재사용 전 검토를 돕는 운영 참고 자료입니다.",
    "권리, 초상, 민감 맥락, 발화-화면 불일치 후보는 사용 전 담당자 확인이 필요합니다.",
  ];

  if (highRiskCount > 0) {
    conditions.push(
      "HIGH risk 장면은 검수 필요 후보로 분류하고, 대외 활용 전 별도 확인 절차를 권장합니다.",
    );
  }

  if (openReviewCount > 0) {
    conditions.push(
      "미확정 review status가 남아 있으므로 조건부 활용 가능 범위로 제한하는 것이 적절합니다.",
    );
  }

  return conditions;
}

function buildRecommendedUseScope(averageSuitability: number, highRiskCount: number) {
  if (averageSuitability >= 80 && highRiskCount === 0) {
    return [
      "내부 검색, 장면 태깅, PoC 분석 리포트에는 활용 가능성이 높습니다.",
      "대외 배포 전에는 샘플링 검수와 권리 확인 절차를 유지하세요.",
    ];
  }

  if (averageSuitability >= 65) {
    return [
      "내부 분석, 메타데이터 보강, 후보 클립 선별에는 조건부 활용 가능합니다.",
      "외부 서비스 노출이나 자동 재배포에는 검수 완료 장면 중심 사용을 권장합니다.",
    ];
  }

  return [
    "현재는 탐색적 분석과 검수 큐 운영 중심으로 활용하는 것이 적절합니다.",
    "재사용 범위를 넓히기 전 추가 검토와 위험 후보 정리가 필요합니다.",
  ];
}

function jsonFailure(message: string, status: number, detail = message) {
  return Response.json(
    {
      success: false,
      error: message,
      detail,
    },
    { status },
  );
}

export async function POST() {
  const client = getSupabaseAdminClient();

  if (!client) {
    return jsonFailure(
      "Supabase 서버 환경변수가 없어 statement를 생성할 수 없습니다.",
      500,
    );
  }

  const [
    datasetsResult,
    scenesResult,
    overviewResult,
    reviewsResult,
    auditEventsResult,
  ] = await Promise.all([
    client
      .from("datadiction_datasets")
      .select("code, name, source_type, scenes_count, suitability_grade, status")
      .order("created_at", { ascending: true }),
    client
      .from("datadiction_scenes")
      .select("scene_code, review_status")
      .order("scene_code", { ascending: true }),
    client
      .from("datadiction_scene_overview")
      .select("id, summary, risk, status, suitability, tags")
      .order("id", { ascending: true }),
    client
      .from("datadiction_reviews")
      .select("reviewer_name, field_name, before_value, after_value, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    client
      .from("datadiction_audit_events")
      .select("event_time, actor, action, target, detail")
      .order("event_time", { ascending: false })
      .limit(5),
  ]);

  const queryErrors = [
    datasetsResult.error ? "datadiction_datasets: " + datasetsResult.error.message : null,
    scenesResult.error ? "datadiction_scenes: " + scenesResult.error.message : null,
    overviewResult.error
      ? "datadiction_scene_overview: " + overviewResult.error.message
      : null,
    reviewsResult.error ? "datadiction_reviews: " + reviewsResult.error.message : null,
    auditEventsResult.error
      ? "datadiction_audit_events: " + auditEventsResult.error.message
      : null,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    return jsonFailure(
      "statement 생성에 필요한 Supabase 데이터를 조회하지 못했습니다.",
      500,
      queryErrors.join(" / "),
    );
  }

  const datasets = (datasetsResult.data ?? []) as DatasetRow[];
  const scenes = (scenesResult.data ?? []) as SceneStatusRow[];
  const overview = (overviewResult.data ?? []) as SceneOverviewRow[];
  const reviews = (reviewsResult.data ?? []) as ReviewRow[];
  const auditEvents = (auditEventsResult.data ?? []) as AuditEventRow[];
  const sceneCount = scenes.length > 0 ? scenes.length : overview.length;
  const reviewStatusSummary = countByValue(
    scenes.map((scene) => normalizeStatus(scene.review_status)),
  );
  const openReviewScenes = scenes.filter((scene) =>
    isOpenReviewStatus(scene.review_status),
  );
  const riskDistribution = {
    HIGH: overview.filter((scene) => normalizeRisk(scene.risk) === "HIGH").length,
    MEDIUM: overview.filter((scene) => normalizeRisk(scene.risk) === "MEDIUM").length,
    LOW: overview.filter((scene) => normalizeRisk(scene.risk) === "LOW").length,
  };
  const averageSuitability = average(
    overview.map((scene) => Number(scene.suitability)),
  );
  const datasetGrades = datasets.map((dataset) => ({
    code: dataset.code,
    name: dataset.name,
    grade: dataset.suitability_grade,
    status: dataset.status,
  }));
  const highRiskCount = riskDistribution.HIGH;
  const openReviewCount = openReviewScenes.length;
  const generatedAt = formatKstDateTime(new Date().toISOString());
  const target =
    datasets.length === 1
      ? datasets[0].code
      : datasets.length > 1
        ? "All datasets"
        : "No dataset";

  const statement = {
    generatedAt,
    datasetCount: datasets.length,
    sceneCount,
    datasetGrades,
    reviewStatusSummary,
    openReviewCount,
    riskDistribution,
    riskCandidates: topRiskCandidates(overview),
    recentReviews: reviews.map((review) => ({
      reviewer: review.reviewer_name,
      field: review.field_name,
      change:
        (review.before_value ?? "empty") + " -> " + (review.after_value ?? "empty"),
      comment: review.comment ?? "No comment",
      time: formatKstDateTime(review.created_at),
    })),
    recentAuditEvents: auditEvents.map((event) => ({
      time: formatKstDateTime(event.event_time),
      actor: event.actor,
      action: event.action,
      target: event.target,
      detail: event.detail,
    })),
    averageSuitability,
    usageConditions: buildUsageConditions(highRiskCount, openReviewCount),
    recommendedUseScope: buildRecommendedUseScope(averageSuitability, highRiskCount),
    itemsNeedingReview: openReviewScenes.slice(0, 8).map((scene) => ({
      sceneId: scene.scene_code,
      status: normalizeStatus(scene.review_status),
    })),
  };

  const { error: auditError } = await client.from("datadiction_audit_events").insert({
    actor: "Report Bot",
    action: "Generated data suitability statement",
    target,
    detail:
      "statement 초안 생성: " +
      datasets.length +
      " datasets, " +
      sceneCount +
      " scenes, " +
      openReviewCount +
      " review items",
    tone: "green",
  });

  if (auditError) {
    return Response.json(
      {
        success: true,
        partialSuccess: true,
        error: "statement는 생성됐지만 audit log 기록에 실패했습니다.",
        detail: auditError.message,
        statement,
      },
      { status: 207 },
    );
  }

  return Response.json({
    success: true,
    partialSuccess: false,
    error: null,
    detail: "statement 생성 및 audit log 기록 완료",
    statement,
  });
}
