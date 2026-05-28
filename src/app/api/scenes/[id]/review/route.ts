import { createClient } from "@supabase/supabase-js";

type ReviewDecision = "label_revision" | "hold" | "confirm";

type SceneRow = {
  id: string;
  scene_code: string;
  review_status: string;
};

const reviewDecisions: Record<
  ReviewDecision,
  {
    action: string;
    comment: string;
    status: "IN_REVIEW" | "REVIEW_REQUIRED" | "CONFIRMED";
    tone: "violet" | "gold" | "green";
  }
> = {
  label_revision: {
    action: "Requested label revision",
    comment: "라벨 수정 action으로 review_status를 IN_REVIEW로 변경했습니다.",
    status: "IN_REVIEW",
    tone: "violet",
  },
  hold: {
    action: "Held review decision",
    comment: "검수 보류 action으로 review_status를 REVIEW_REQUIRED로 변경했습니다.",
    status: "REVIEW_REQUIRED",
    tone: "gold",
  },
  confirm: {
    action: "Confirmed review decision",
    comment: "최종 확정 action으로 review_status를 CONFIRMED로 변경했습니다.",
    status: "CONFIRMED",
    tone: "green",
  },
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

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

function parseDecision(value: unknown): ReviewDecision | null {
  if (
    value === "label_revision" ||
    value === "hold" ||
    value === "confirm"
  ) {
    return value;
  }

  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sceneCode = decodeURIComponent(id).trim();
  const client = getSupabaseAdminClient();

  if (!client) {
    return jsonError("Supabase 서버 환경변수가 없어 review decision을 저장할 수 없습니다.", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문을 읽을 수 없습니다.", 400);
  }

  const decision = parseDecision(
    typeof body === "object" && body !== null && "decision" in body
      ? (body as { decision?: unknown }).decision
      : undefined,
  );

  if (!decision) {
    return jsonError("지원하지 않는 review decision입니다.", 400);
  }

  const nextDecision = reviewDecisions[decision];

  const { data: scene, error: sceneError } = await client
    .from("datadiction_scenes")
    .select("id, scene_code, review_status")
    .eq("scene_code", sceneCode)
    .maybeSingle();

  if (sceneError) {
    return jsonError("원본 scene row 조회에 실패했습니다: " + sceneError.message, 500);
  }

  if (!scene) {
    return jsonError("요청한 scene id를 찾을 수 없습니다.", 404);
  }

  const sceneRow = scene as SceneRow;
  const previousStatus = sceneRow.review_status;
  const nextStatus = nextDecision.status;

  const { error: updateError } = await client
    .from("datadiction_scenes")
    .update({
      review_status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sceneRow.id);

  if (updateError) {
    return jsonError("review_status 업데이트에 실패했습니다: " + updateError.message, 500);
  }

  const { error: reviewError } = await client.from("datadiction_reviews").insert({
    scene_id: sceneRow.id,
    reviewer_name: "MVP Reviewer",
    field_name: "review_status",
    before_value: previousStatus,
    after_value: nextStatus,
    comment: nextDecision.comment,
  });

  if (reviewError) {
    return jsonError("review 이력 저장에 실패했습니다: " + reviewError.message, 500);
  }

  const detail = sceneRow.scene_code + " review_status: " + previousStatus + " -> " + nextStatus;
  const { error: auditError } = await client.from("datadiction_audit_events").insert({
    actor: "MVP Reviewer",
    action: nextDecision.action,
    target: sceneRow.scene_code,
    detail,
    tone: nextDecision.tone,
  });

  if (auditError) {
    return jsonError("audit event 저장에 실패했습니다: " + auditError.message, 500);
  }

  return Response.json({
    message: "Review decision이 저장되었습니다.",
    sceneId: sceneRow.scene_code,
    beforeStatus: previousStatus,
    afterStatus: nextStatus,
  });
}
