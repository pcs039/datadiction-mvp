"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ReviewDecision = "label_revision" | "hold" | "confirm";

type Message = {
  tone: "success" | "error";
  text: string;
};

const reviewActions: {
  decision: ReviewDecision;
  label: string;
  targetStatus: string;
  className: string;
}[] = [
  {
    decision: "label_revision",
    label: "라벨 수정",
    targetStatus: "IN_REVIEW",
    className:
      "rounded-lg border border-white/15 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/7 disabled:cursor-not-allowed disabled:opacity-50",
  },
  {
    decision: "hold",
    label: "검수 보류",
    targetStatus: "REVIEW_REQUIRED",
    className:
      "rounded-lg border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100 hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50",
  },
  {
    decision: "confirm",
    label: "최종 확정",
    targetStatus: "CONFIRMED",
    className:
      "rounded-lg bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50",
  },
];

export function ReviewDecisionActions({
  canWrite,
  currentStatus,
  sceneId,
}: {
  canWrite: boolean;
  currentStatus: string;
  sceneId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<Message | null>(null);
  const [pendingDecision, setPendingDecision] = useState<ReviewDecision | null>(null);
  const [isRefreshing, startTransition] = useTransition();
  const isBusy = pendingDecision !== null || isRefreshing;

  async function submitDecision(decision: ReviewDecision) {
    if (!canWrite) {
      setMessage({
        tone: "error",
        text: "Live Supabase 상태에서만 review decision을 저장할 수 있습니다.",
      });
      return;
    }

    setPendingDecision(decision);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/scenes/" + encodeURIComponent(sceneId) + "/review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ decision }),
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        afterStatus?: string;
        beforeStatus?: string;
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Review decision 저장에 실패했습니다.");
      }

      setMessage({
        tone: "success",
        text:
          (payload?.message ?? "Review decision이 저장되었습니다.") +
          " " +
          (payload?.beforeStatus ?? currentStatus) +
          " -> " +
          (payload?.afterStatus ?? "updated"),
      });
      startTransition(() => router.refresh());
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Review decision 저장에 실패했습니다.",
      });
    } finally {
      setPendingDecision(null);
    }
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {reviewActions.map((action) => (
          <button
            key={action.decision}
            className={action.className}
            disabled={isBusy || !canWrite}
            onClick={() => void submitDecision(action.decision)}
            type="button"
          >
            {pendingDecision === action.decision
              ? "저장 중..."
              : action.label + " → " + action.targetStatus}
          </button>
        ))}
      </div>

      {!canWrite ? (
        <p className="rounded-lg border border-amber-300/20 bg-amber-300/8 p-3 text-sm leading-6 text-amber-100/80">
          Demo fallback 상태에서는 저장을 막았습니다. Supabase Live 연결을 확인하세요.
        </p>
      ) : null}

      {message ? (
        <p
          className={
            "rounded-lg border p-3 text-sm font-semibold " +
            (message.tone === "success"
              ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
              : "border-rose-300/25 bg-rose-400/10 text-rose-100")
          }
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
