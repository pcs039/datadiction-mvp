import { createClient } from "@supabase/supabase-js";
import { formatKstDateTime } from "./date";
import {
  auditEvents as fallbackAuditEvents,
  datasets as fallbackDatasets,
  scenes as fallbackScenes,
  type Alert,
  type AuditEvent,
  type Dataset,
  type Distribution,
  type Scene,
  type Tone,
} from "./data";

type DatasetRow = {
  code: string;
  name: string;
  owner_org: string;
  source_type: string;
  videos_count: number;
  scenes_count: number;
  review_rate: number;
  suitability_grade: string;
  status: string;
};

type DatasetDetailRow = DatasetRow & {
  id: string;
  created_at: string | null;
  updated_at: string | null;
};

type SceneOverviewRow = {
  id: string;
  time: string;
  summary: string;
  function_label: string;
  relation: string;
  emotion: string[] | null;
  narrative: string[] | null;
  cds: number | string;
  confidence: number;
  suitability: number;
  risk: Scene["risk"];
  status: string;
  evidence: string;
  tags: string[] | null;
};

type AuditEventRow = {
  event_time: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  tone: Tone;
};

export type DataSourceStatus = {
  source: "supabase" | "fallback";
  label: "Live Supabase" | "Demo fallback";
  reason: string;
};

export type DataResult<T> = {
  data: T;
  status: DataSourceStatus;
};

const liveSupabaseStatus: DataSourceStatus = {
  source: "supabase",
  label: "Live Supabase",
  reason: "Supabase query completed successfully.",
};

function fallbackStatus(reason: string): DataSourceStatus {
  return {
    source: "fallback",
    label: "Demo fallback",
    reason,
  };
}

function fallbackResult<T>(data: T, reason: string): DataResult<T> {
  return {
    data,
    status: fallbackStatus(reason),
  };
}

function liveResult<T>(data: T): DataResult<T> {
  return {
    data,
    status: liveSupabaseStatus,
  };
}

function missingEnvironmentReason() {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  return "Supabase 서버 환경변수(" + missing.join(", ") + ")가 없어 내장 데모 데이터를 표시합니다.";
}

function getDataDictionClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function queryFailureReason(target: string, message?: string) {
  return (
    "Supabase " +
    target +
    " 조회에 실패해 내장 데모 데이터를 표시합니다." +
    (message ? " 원인: " + message : "")
  );
}

function emptyResultReason(target: string) {
  return "Supabase " + target + " 조회 결과가 비어 있어 내장 데모 데이터를 표시합니다.";
}

function unknownErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류";
}

function normalizeRisk(risk: string): Scene["risk"] {
  if (risk === "HIGH" || risk === "MEDIUM" || risk === "LOW") return risk;
  return "MEDIUM";
}

function normalizeTone(tone: string): Tone {
  if (
    tone === "violet" ||
    tone === "blue" ||
    tone === "green" ||
    tone === "gold" ||
    tone === "rose" ||
    tone === "slate"
  ) {
    return tone;
  }

  return "blue";
}

function formatAuditEventTimes(events: AuditEvent[]): AuditEvent[] {
  return events.map((event) => ({
    ...event,
    time: formatKstDateTime(event.time),
  }));
}

export async function getDataDictionDatasetsResult(): Promise<DataResult<Dataset[]>> {
  const client = getDataDictionClient();
  if (!client) return fallbackResult(fallbackDatasets, missingEnvironmentReason());

  try {
    const { data, error } = await client
      .from("datadiction_datasets")
      .select(
        "code, name, owner_org, source_type, videos_count, scenes_count, review_rate, suitability_grade, status",
      )
      .order("created_at", { ascending: true });

    if (error) {
      return fallbackResult(
        fallbackDatasets,
        queryFailureReason("datadiction_datasets", error.message),
      );
    }

    if (!data || data.length === 0) {
      return fallbackResult(fallbackDatasets, emptyResultReason("datadiction_datasets"));
    }

    return liveResult(
      (data as DatasetRow[]).map((row) => ({
        id: row.code,
        name: row.name,
        owner: row.owner_org,
        sourceType: row.source_type,
        videos: row.videos_count,
        scenes: row.scenes_count,
        reviewRate: row.review_rate,
        suitability: row.suitability_grade,
        status: row.status,
      })),
    );
  } catch (error) {
    return fallbackResult(
      fallbackDatasets,
      queryFailureReason("datadiction_datasets", unknownErrorMessage(error)),
    );
  }
}

export async function getDataDictionScenesResult(): Promise<DataResult<Scene[]>> {
  const client = getDataDictionClient();
  if (!client) return fallbackResult(fallbackScenes, missingEnvironmentReason());

  try {
    const { data, error } = await client
      .from("datadiction_scene_overview")
      .select(
        "id, time, summary, function_label, relation, emotion, narrative, cds, confidence, suitability, risk, status, evidence, tags",
      )
      .order("id", { ascending: true });

    if (error) {
      return fallbackResult(
        fallbackScenes,
        queryFailureReason("datadiction_scene_overview", error.message),
      );
    }

    if (!data || data.length === 0) {
      return fallbackResult(fallbackScenes, emptyResultReason("datadiction_scene_overview"));
    }

    return liveResult(
      (data as SceneOverviewRow[]).map((row) => ({
        id: row.id,
        time: row.time,
        summary: row.summary,
        functionLabel: row.function_label,
        relation: row.relation,
        emotion: row.emotion ?? [],
        narrative: row.narrative ?? [],
        cds: Number(row.cds),
        confidence: row.confidence,
        suitability: row.suitability,
        risk: normalizeRisk(row.risk),
        status: row.status,
        evidence: row.evidence,
        tags: row.tags ?? [],
      })),
    );
  } catch (error) {
    return fallbackResult(
      fallbackScenes,
      queryFailureReason("datadiction_scene_overview", unknownErrorMessage(error)),
    );
  }
}

export async function getDataDictionAuditEventsResult(): Promise<DataResult<AuditEvent[]>> {
  const client = getDataDictionClient();
  if (!client) return fallbackResult(formatAuditEventTimes(fallbackAuditEvents), missingEnvironmentReason());

  try {
    const { data, error } = await client
      .from("datadiction_audit_events")
      .select("event_time, actor, action, target, detail, tone")
      .order("event_time", { ascending: false });

    if (error) {
      return fallbackResult(
        formatAuditEventTimes(fallbackAuditEvents),
        queryFailureReason("datadiction_audit_events", error.message),
      );
    }

    if (!data || data.length === 0) {
      return fallbackResult(formatAuditEventTimes(fallbackAuditEvents), emptyResultReason("datadiction_audit_events"));
    }

    return liveResult(
      (data as AuditEventRow[]).map((row) => ({
        time: formatKstDateTime(row.event_time),
        actor: row.actor,
        action: row.action,
        target: row.target,
        detail: row.detail,
        tone: normalizeTone(row.tone),
      })),
    );
  } catch (error) {
    return fallbackResult(
      formatAuditEventTimes(fallbackAuditEvents),
      queryFailureReason("datadiction_audit_events", unknownErrorMessage(error)),
    );
  }
}


export type DatasetDetailRecord = Dataset & {
  rowId?: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type DatasetDetail = {
  dataset: DatasetDetailRecord;
  relatedScenes: Scene[];
  sceneConnectionAvailable: boolean;
  sceneConnectionMessage: string;
};

const sceneOverviewDatasetConnectionMessage =
  "현재 datadiction_scene_overview에는 dataset_id, dataset_code, video_id 같은 dataset 연결 키가 없어 이 dataset으로 scene 목록을 직접 필터링할 수 없습니다.";

function mapDatasetDetailRow(row: DatasetDetailRow): DatasetDetailRecord {
  return {
    rowId: row.id,
    id: row.code,
    name: row.name,
    owner: row.owner_org,
    sourceType: row.source_type,
    videos: row.videos_count,
    scenes: row.scenes_count,
    reviewRate: row.review_rate,
    suitability: row.suitability_grade,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildDatasetDetail(dataset: DatasetDetailRecord): DatasetDetail {
  return {
    dataset,
    relatedScenes: [],
    sceneConnectionAvailable: false,
    sceneConnectionMessage: sceneOverviewDatasetConnectionMessage,
  };
}

function fallbackDatasetDetail(dataset: Dataset): DatasetDetail {
  return buildDatasetDetail({
    ...dataset,
    createdAt: null,
    updatedAt: null,
  });
}

export async function getDataDictionDatasetDetailResult(
  datasetId: string,
): Promise<DataResult<DatasetDetail | null>> {
  const normalizedId = decodeURIComponent(datasetId).trim();
  const fallbackDataset = fallbackDatasets.find(
    (dataset) => dataset.id === normalizedId,
  );
  const client = getDataDictionClient();

  if (!client) {
    return fallbackResult(
      fallbackDataset ? fallbackDatasetDetail(fallbackDataset) : null,
      missingEnvironmentReason(),
    );
  }

  try {
    const { data, error } = await client
      .from("datadiction_datasets")
      .select(
        "id, code, name, owner_org, source_type, videos_count, scenes_count, review_rate, suitability_grade, status, created_at, updated_at",
      )
      .eq("code", normalizedId)
      .maybeSingle();

    if (error) {
      return fallbackResult(
        fallbackDataset ? fallbackDatasetDetail(fallbackDataset) : null,
        queryFailureReason("datadiction_datasets", error.message),
      );
    }

    if (!data) {
      return liveResult(null);
    }

    return liveResult(buildDatasetDetail(mapDatasetDetailRow(data as DatasetDetailRow)));
  } catch (error) {
    return fallbackResult(
      fallbackDataset ? fallbackDatasetDetail(fallbackDataset) : null,
      queryFailureReason("datadiction_datasets", unknownErrorMessage(error)),
    );
  }
}

export type DashboardBreakdownItem = {
  label: string;
  value: number;
  count: number;
  tone: Tone;
};

export type DashboardSummary = {
  datasetsTotal: number;
  scenesTotal: number;
  pendingReviewTotal: number;
  auditEventsTotal: number;
  recentAuditEvents: AuditEvent[];
  scenes: Scene[];
  averageConfidence: number;
  averageSuitability: number;
  riskBreakdown: DashboardBreakdownItem[];
  contextAlerts: Alert[];
  datasetDistribution: Distribution[];
  sourceTypeShares: [string, string][];
};

const distributionTones: Tone[] = ["violet", "blue", "green", "gold", "rose", "slate"];

function isPendingReviewStatus(status: string) {
  const normalized = status.trim().toUpperCase();

  return (
    normalized === "REVIEW_REQUIRED" ||
    normalized === "PENDING" ||
    normalized === "PENDING_REVIEW" ||
    normalized.includes("대기")
  );
}

function averagePercent<T>(items: T[], selector: (item: T) => number) {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + selector(item), 0);
  return Math.round((total / items.length) * 10) / 10;
}

function percentage(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function riskTone(risk: Scene["risk"]): Tone {
  if (risk === "HIGH") return "rose";
  if (risk === "MEDIUM") return "gold";
  return "green";
}

function buildRiskBreakdown(scenes: Scene[]): DashboardBreakdownItem[] {
  const total = scenes.length;
  const high = scenes.filter((scene) => scene.risk === "HIGH").length;
  const medium = scenes.filter((scene) => scene.risk === "MEDIUM").length;
  const low = scenes.filter((scene) => scene.risk === "LOW").length;
  const pending = scenes.filter((scene) => isPendingReviewStatus(scene.status)).length;

  return [
    { label: "High risk", value: percentage(high, total), count: high, tone: "rose" },
    { label: "Medium risk", value: percentage(medium, total), count: medium, tone: "gold" },
    { label: "Low risk", value: percentage(low, total), count: low, tone: "green" },
    { label: "Review pending", value: percentage(pending, total), count: pending, tone: "blue" },
  ];
}

function buildContextAlerts(scenes: Scene[]): Alert[] {
  return scenes
    .filter((scene) => scene.risk === "HIGH" || isPendingReviewStatus(scene.status))
    .slice(0, 4)
    .map((scene) => ({
      id: scene.id,
      title: scene.risk + " review signal",
      detail:
        scene.tags.length > 0
          ? scene.tags.slice(0, 2).join(", ") + " · " + scene.summary
          : scene.summary,
      tone: riskTone(scene.risk),
    }));
}

function buildDatasetDistribution(datasets: Dataset[]): Distribution[] {
  const sourceTotals = new Map<string, number>();

  for (const dataset of datasets) {
    const label = dataset.sourceType || "Unknown";
    const weight = dataset.scenes > 0 ? dataset.scenes : 1;
    sourceTotals.set(label, (sourceTotals.get(label) ?? 0) + weight);
  }

  const total = Array.from(sourceTotals.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(sourceTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count], index) => ({
      label,
      value: percentage(count, total),
      tone: distributionTones[index % distributionTones.length],
    }));
}

function buildSourceTypeShares(distribution: Distribution[]): [string, string][] {
  return distribution.map((item) => [item.label, item.value + "%"]);
}

function combineDataSourceStatuses(statuses: DataSourceStatus[]): DataSourceStatus {
  if (statuses.every((status) => status.source === "supabase")) {
    return liveSupabaseStatus;
  }

  const reasons = Array.from(
    new Set(
      statuses
        .filter((status) => status.source === "fallback")
        .map((status) => status.reason),
    ),
  );

  return fallbackStatus(
    reasons.length > 0
      ? reasons.join(" / ")
      : "Dashboard 일부 데이터가 Supabase에서 로드되지 않아 데모 데이터를 함께 표시합니다.",
  );
}

export async function getDataDictionDashboardResult(): Promise<
  DataResult<DashboardSummary>
> {
  const [datasetsResult, scenesResult, auditEventsResult] = await Promise.all([
    getDataDictionDatasetsResult(),
    getDataDictionScenesResult(),
    getDataDictionAuditEventsResult(),
  ]);
  const datasets = datasetsResult.data;
  const scenes = scenesResult.data;
  const auditEvents = auditEventsResult.data;
  const datasetDistribution = buildDatasetDistribution(datasets);

  return {
    data: {
      datasetsTotal: datasets.length,
      scenesTotal: scenes.length,
      pendingReviewTotal: scenes.filter((scene) =>
        isPendingReviewStatus(scene.status),
      ).length,
      auditEventsTotal: auditEvents.length,
      recentAuditEvents: auditEvents.slice(0, 5),
      scenes,
      averageConfidence: averagePercent(scenes, (scene) => scene.confidence),
      averageSuitability: averagePercent(scenes, (scene) => scene.suitability),
      riskBreakdown: buildRiskBreakdown(scenes),
      contextAlerts: buildContextAlerts(scenes),
      datasetDistribution,
      sourceTypeShares: buildSourceTypeShares(datasetDistribution),
    },
    status: combineDataSourceStatuses([
      datasetsResult.status,
      scenesResult.status,
      auditEventsResult.status,
    ]),
  };
}

export async function getDataDictionDatasets(): Promise<Dataset[]> {
  const result = await getDataDictionDatasetsResult();
  return result.data;
}

export async function getDataDictionScenes(): Promise<Scene[]> {
  const result = await getDataDictionScenesResult();
  return result.data;
}

export async function getDataDictionAuditEvents(): Promise<AuditEvent[]> {
  const result = await getDataDictionAuditEventsResult();
  return result.data;
}
