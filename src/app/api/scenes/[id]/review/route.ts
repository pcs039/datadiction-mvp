import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

type ReviewDecision = "label_revision" | "hold" | "confirm";

type SceneRow = {
  id: string;
  scene_code: string;
  review_status: string;
};

type FailureStage =
  | "configuration"
  | "request_body"
  | "validation"
  | "scene_lookup"
  | "status_update"
  | "history_insert";

type HistoryFailure = {
  step: "datadiction_reviews" | "datadiction_audit_events";
  message: string;
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

function jsonFailure(
  message: string,
  status: number,
  failureStage: FailureStage,
  detail = message,
) {
  return Response.json(
    {
      success: false,
      partialSuccess: false,
      error: message,
      detail,
      failureStage,
    },
    { status },
  );
}

function historyFailureDetail(failures: HistoryFailure[]) {
  return failures
    .map((failure) => failure.step + ": " + failure.message)
    .join(" / ");
}

function revalidateReviewDecisionPaths(sceneCode: string) {
  const scenePath = "/scenes/" + encodeURIComponent(sceneCode);

  for (const path of ["/", "/diagnostics", "/analysis", scenePath, "/audit-logs"]) {
    revalidatePath(path);
  }
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
    return jsonFailure(
      "Supabase 서버 환경변수가 없어 review decision을 저장할 수 없습니다.",
      500,
      "configuration",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonFailure("요청 본문을 읽을 수 없습니다.", 400, "request_body");
  }

  const decision = parseDecision(
    typeof body === "object" && body !== null && "decision" in body
      ? (body as { decision?: unknown }).decision
      : undefined,
  );

  if (!decision) {
    return jsonFailure("지원하지 않는 review decision입니다.", 400, "validation");
  }

  const nextDecision = reviewDecisions[decision];

  const { data: scene, error: sceneError } = await client
    .from("datadiction_scenes")
    .select("id, scene_code, review_status")
    .eq("scene_code", sceneCode)
    .maybeSingle();

  if (sceneError) {
    return jsonFailure(
      "원본 scene row 조회에 실패했습니다.",
      500,
      "scene_lookup",
      sceneError.message,
    );
  }

  if (!scene) {
    return jsonFailure("요청한 scene id를 찾을 수 없습니다.", 404, "scene_lookup");
  }

  const sceneRow = scene as SceneRow;
  const previousStatus = sceneRow.review_status;
  const nextStatus = nextDecision.status;

  const { data: updatedScene, error: updateError } = await client
    .from("datadiction_scenes")
    .update({
      review_status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sceneRow.id)
    .select("id, review_status")
    .maybeSingle();

  if (updateError) {
    return jsonFailure(
      "review_status 업데이트에 실패했습니다.",
      500,
      "status_update",
      updateError.message,
    );
  }

  if (!updatedScene) {
    return jsonFailure(
      "review_status 업데이트 결과를 확인할 수 없습니다.",
      500,
      "status_update",
      "datadiction_scenes update가 성공 응답을 반환했지만 갱신된 row를 확인하지 못했습니다.",
    );
  }

  const { error: reviewError } = await client.from("datadiction_reviews").insert({
    scene_id: sceneRow.id,
    reviewer_name: "MVP Reviewer",
    field_name: "review_status",
    before_value: previousStatus,
    after_value: nextStatus,
    comment: nextDecision.comment,
  });

  const historyFailures: HistoryFailure[] = [];

  if (reviewError) {
    historyFailures.push({
      step: "datadiction_reviews",
      message: reviewError.message,
    });
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
    historyFailures.push({
      step: "datadiction_audit_events",
      message: auditError.message,
    });
  }

  revalidateReviewDecisionPaths(sceneRow.scene_code);

  if (historyFailures.length > 0) {
    return Response.json(
      {
        success: false,
        partialSuccess: true,
        error: "상태는 변경됐지만 이력 기록 일부가 실패했습니다.",
        detail: historyFailureDetail(historyFailures),
        failureStage: "history_insert",
        historyFailures,
        message: "Review status는 " + nextStatus + "로 변경되었습니다.",
        sceneId: sceneRow.scene_code,
        beforeStatus: previousStatus,
        afterStatus: nextStatus,
      },
      { status: 207 },
    );
  }

  return Response.json({
    success: true,
    partialSuccess: false,
    error: null,
    detail: "datadiction_scenes, datadiction_reviews, datadiction_audit_events 저장 완료",
    message: "Review decision이 저장되었습니다.",
    sceneId: sceneRow.scene_code,
    beforeStatus: previousStatus,
    afterStatus: nextStatus,
  });
}
