import { createClient } from "@supabase/supabase-js";
import {
  auditEvents as fallbackAuditEvents,
  datasets as fallbackDatasets,
  scenes as fallbackScenes,
  type AuditEvent,
  type Dataset,
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
  if (!client) return fallbackResult(fallbackAuditEvents, missingEnvironmentReason());

  try {
    const { data, error } = await client
      .from("datadiction_audit_events")
      .select("event_time, actor, action, target, detail, tone")
      .order("event_time", { ascending: false });

    if (error) {
      return fallbackResult(
        fallbackAuditEvents,
        queryFailureReason("datadiction_audit_events", error.message),
      );
    }

    if (!data || data.length === 0) {
      return fallbackResult(fallbackAuditEvents, emptyResultReason("datadiction_audit_events"));
    }

    return liveResult(
      (data as AuditEventRow[]).map((row) => ({
        time: row.event_time.slice(0, 16).replace("T", " "),
        actor: row.actor,
        action: row.action,
        target: row.target,
        detail: row.detail,
        tone: normalizeTone(row.tone),
      })),
    );
  } catch (error) {
    return fallbackResult(
      fallbackAuditEvents,
      queryFailureReason("datadiction_audit_events", unknownErrorMessage(error)),
    );
  }
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
