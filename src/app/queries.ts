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

export async function getDataDictionDatasets(): Promise<Dataset[]> {
  const client = getDataDictionClient();
  if (!client) return fallbackDatasets;

  try {
    const { data, error } = await client
      .from("datadiction_datasets")
      .select(
        "code, name, owner_org, source_type, videos_count, scenes_count, review_rate, suitability_grade, status",
      )
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) return fallbackDatasets;

    return (data as DatasetRow[]).map((row) => ({
      id: row.code,
      name: row.name,
      owner: row.owner_org,
      sourceType: row.source_type,
      videos: row.videos_count,
      scenes: row.scenes_count,
      reviewRate: row.review_rate,
      suitability: row.suitability_grade,
      status: row.status,
    }));
  } catch {
    return fallbackDatasets;
  }
}

export async function getDataDictionScenes(): Promise<Scene[]> {
  const client = getDataDictionClient();
  if (!client) return fallbackScenes;

  try {
    const { data, error } = await client
      .from("datadiction_scene_overview")
      .select(
        "id, time, summary, function_label, relation, emotion, narrative, cds, confidence, suitability, risk, status, evidence, tags",
      )
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) return fallbackScenes;

    return (data as SceneOverviewRow[]).map((row) => ({
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
    }));
  } catch {
    return fallbackScenes;
  }
}

export async function getDataDictionAuditEvents(): Promise<AuditEvent[]> {
  const client = getDataDictionClient();
  if (!client) return fallbackAuditEvents;

  try {
    const { data, error } = await client
      .from("datadiction_audit_events")
      .select("event_time, actor, action, target, detail, tone")
      .order("event_time", { ascending: false });

    if (error || !data || data.length === 0) return fallbackAuditEvents;

    return (data as AuditEventRow[]).map((row) => ({
      time: row.event_time.slice(0, 16).replace("T", " "),
      actor: row.actor,
      action: row.action,
      target: row.target,
      detail: row.detail,
      tone: normalizeTone(row.tone),
    }));
  } catch {
    return fallbackAuditEvents;
  }
}
