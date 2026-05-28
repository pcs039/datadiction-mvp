"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useRef, useState } from "react";

type UploadResponse = {
  datasetCode?: string;
  detail?: string;
  error?: string | null;
  partialSuccess?: boolean;
  success?: boolean;
  videoCode?: string;
};

type Message = {
  tone: "success" | "warning" | "error";
  text: string;
};

const profiles = [
  ["Documentary", "인터뷰·B-roll 중심 비드라마 분석"],
  ["Public Archive", "권리·맥락 위험 검수 우선"],
  ["Education", "미성년자·교육 맥락 민감 태그 강화"],
];

function messageClassName(tone: Message["tone"]) {
  if (tone === "success") {
    return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  }

  if (tone === "warning") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }

  return "border-rose-300/25 bg-rose-400/10 text-rose-100";
}

export function VideoUploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("videoFile");

    if (!(file instanceof File) || file.size === 0) {
      setMessage({
        tone: "error",
        text: "업로드할 영상 파일을 선택하세요.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch("/api/uploads/video", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as UploadResponse | null;

      if (payload?.partialSuccess) {
        setMessage({
          tone: "warning",
          text:
            "업로드 완료, 아직 자동 장면 분석 전 상태입니다. 다만 일부 기록이 실패했습니다." +
            (payload.detail ? " 상세: " + payload.detail : ""),
        });
        router.refresh();
        return;
      }

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error ?? "영상 업로드에 실패했습니다.");
      }

      setMessage({
        tone: "success",
        text:
          "업로드 완료, 아직 자동 장면 분석 전 상태입니다. Dataset " +
          (payload?.datasetCode ?? "created") +
          "로 등록했습니다.",
      });
      formRef.current?.reset();
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "영상 업로드에 실패했습니다.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form ref={formRef} className="mt-5 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
      <div className="rounded-xl border-2 border-dashed border-sky-300/25 bg-sky-300/7 p-6 text-center">
        <p className="text-sm font-bold text-sky-200">Drop video file</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          mp4, mov, mxf 등 비드라마 영상 파일을 분석 대상으로 등록합니다.
        </p>
        <input
          accept="video/*,.mxf"
          className="mt-5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-sky-300 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-slate-950"
          disabled={isUploading}
          name="videoFile"
          required
          type="file"
        />
        <p className="mt-3 text-xs leading-5 text-slate-500">
          1차 Stub에서는 대용량 영상 업로드를 권장하지 않습니다. Vercel/Supabase 요청
          제한에 걸릴 수 있으므로 작은 샘플 파일로 먼저 확인하세요.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-bold text-slate-400">Dataset name</span>
          <input
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
            defaultValue="신규 업로드 영상"
            disabled={isUploading}
            name="datasetName"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-400">분석 프로파일</span>
          <select
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
            disabled={isUploading}
            name="sourceType"
            required
          >
            {profiles.map(([name, description]) => (
              <option key={name} value={name}>
                {`${name} · ${description}`}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-400">Owner organization</span>
          <input
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
            defaultValue="○○문화재단"
            disabled={isUploading}
            name="ownerOrg"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-400">Rights note</span>
          <textarea
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm leading-6 text-slate-200"
            defaultValue="내부 촬영본. 일부 외부 자료화면 포함 가능성 있음."
            disabled={isUploading}
            name="rightsNote"
            rows={4}
          />
        </label>
      </div>

      <button
        className="w-full rounded-lg bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-55"
        disabled={isUploading}
        type="submit"
      >
        {isUploading ? "업로드 중..." : "Upload video stub"}
      </button>

      {message ? (
        <p className={"rounded-lg border p-3 text-sm font-semibold " + messageClassName(message.tone)}>
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
