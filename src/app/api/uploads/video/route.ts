import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

type DatasetInsertResult = {
  id: string;
  code: string;
};

const uploadBucket = "datadiction-assets";

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

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function safeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "uploaded-video";
}

function fileExtension(fileName: string) {
  const safeName = safeFileName(fileName);
  const parts = safeName.split(".");
  if (parts.length < 2) return "unknown";
  return parts[parts.length - 1].toLowerCase() || "unknown";
}

function timestampCodePart(date = new Date()) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "")
    .replace("T", "-");
}

function shortRandomId() {
  return crypto.randomUUID().slice(0, 8).toUpperCase();
}

function revalidateUploadPaths() {
  for (const path of ["/", "/analysis", "/datasets", "/audit-logs"]) {
    revalidatePath(path);
  }
}

export async function POST(request: Request) {
  const client = getSupabaseAdminClient();

  if (!client) {
    return jsonFailure("Supabase 서버 환경변수가 없어 영상 업로드를 처리할 수 없습니다.", 500);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonFailure("업로드 요청 본문을 읽을 수 없습니다.", 400);
  }

  const fileValue = formData.get("videoFile");
  const datasetName = readTextField(formData, "datasetName");
  const ownerOrg = readTextField(formData, "ownerOrg");
  const sourceType = readTextField(formData, "sourceType");
  const rightsNote = readTextField(formData, "rightsNote");

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return jsonFailure("업로드할 영상 파일을 선택하세요.", 400);
  }

  if (!datasetName || !ownerOrg || !sourceType) {
    return jsonFailure("dataset name, owner organization, source type은 필수입니다.", 400);
  }

  const generatedAt = new Date();
  const codePart = timestampCodePart(generatedAt);
  const randomPart = shortRandomId();
  const datasetCode = "VIDSET-" + codePart + "-" + randomPart;
  const videoCode = "VID-" + codePart + "-" + randomPart;
  const originalFileName = fileValue.name || "uploaded-video";
  const cleanedFileName = safeFileName(originalFileName);
  const storagePath =
    "videos/" +
    datasetCode +
    "/" +
    generatedAt.getTime().toString() +
    "-" +
    cleanedFileName;

  const { error: storageError } = await client.storage
    .from(uploadBucket)
    .upload(storagePath, fileValue, {
      contentType: fileValue.type || "application/octet-stream",
      upsert: false,
    });

  if (storageError) {
    return jsonFailure(
      "Supabase Storage 업로드에 실패했습니다.",
      500,
      storageError.message,
    );
  }

  const { data: dataset, error: datasetError } = await client
    .from("datadiction_datasets")
    .insert({
      code: datasetCode,
      name: datasetName,
      owner_org: ownerOrg,
      source_type: sourceType,
      videos_count: 1,
      scenes_count: 0,
      review_rate: 0,
      suitability_grade: "Not processed",
      status: "UPLOADED",
      updated_at: generatedAt.toISOString(),
    })
    .select("id, code")
    .single();

  if (datasetError || !dataset) {
    await client.storage.from(uploadBucket).remove([storagePath]);
    return jsonFailure(
      "dataset row 생성에 실패했습니다.",
      500,
      datasetError?.message ?? "insert 결과가 없습니다.",
    );
  }

  const datasetRow = dataset as DatasetInsertResult;
  const { error: videoError } = await client.from("datadiction_videos").insert({
    dataset_id: datasetRow.id,
    code: videoCode,
    file_name: originalFileName,
    file_format: fileExtension(originalFileName),
    source_type: sourceType,
    rights_note: rightsNote,
    storage_path: storagePath,
  });

  if (videoError) {
    return jsonFailure(
      "video row 생성에 실패했습니다. 파일과 dataset은 등록되었지만 video 메타데이터 기록이 실패했습니다.",
      500,
      videoError.message,
    );
  }

  const { error: auditError } = await client.from("datadiction_audit_events").insert({
    actor: "Upload Bot",
    action: "Uploaded video file",
    target: datasetRow.code,
    detail:
      originalFileName +
      " 파일이 분석 전 업로드 상태로 등록됨. storage_path=" +
      storagePath,
    tone: "green",
  });

  revalidateUploadPaths();

  if (auditError) {
    return Response.json(
      {
        success: true,
        partialSuccess: true,
        error: "업로드는 완료됐지만 audit log 기록에 실패했습니다.",
        detail: auditError.message,
        datasetCode: datasetRow.code,
        storagePath,
      },
      { status: 207 },
    );
  }

  return Response.json({
    success: true,
    partialSuccess: false,
    error: null,
    detail: "업로드 완료, 아직 자동 장면 분석 전 상태입니다.",
    datasetCode: datasetRow.code,
    videoCode,
    storagePath,
  });
}
