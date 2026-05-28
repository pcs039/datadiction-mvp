import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DataSourceBadge,
  DataSourceNotice,
  Panel,
  SceneTable,
  ScoreBar,
  SectionHeader,
  toneStyles,
} from "../../components";
import { getDataDictionDatasetDetailResult } from "../../queries";

function formatDate(value: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DatasetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: detail, status: dataStatus } =
    await getDataDictionDatasetDetailResult(id);

  if (!detail) {
    notFound();
  }

  const { dataset } = detail;
  const statusTone = dataset.status === "Reviewed" ? "green" : "gold";
  const statusColors = toneStyles(statusTone);

  return (
    <>
      <SectionHeader
        eyebrow="Dataset Detail"
        title={dataset.name}
        description="Supabase datadiction_datasets 기준 상세 정보입니다."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge status={dataStatus} />
            <Link
              href="/datasets"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/7"
            >
              목록으로
            </Link>
          </div>
        }
      />

      <DataSourceNotice status={dataStatus} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  {dataset.id}
                </p>
                <h2 className="mt-2 text-2xl font-bold">{dataset.name}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {dataset.owner} · {dataset.sourceType}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={"rounded-full px-3 py-1 text-xs font-bold ring-1 " + statusColors.soft}>
                  {dataset.status}
                </span>
                <span className="rounded-full bg-amber-400/12 px-3 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-300/30">
                  Grade {dataset.suitability}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <InfoBox label="Dataset ID" value={dataset.id} />
              <InfoBox label="Source Type" value={dataset.sourceType} />
              <InfoBox label="Scene Count" value={dataset.scenes.toLocaleString("ko-KR")} />
              <InfoBox label="Videos" value={dataset.videos.toLocaleString("ko-KR")} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoBox label="Created" value={formatDate(dataset.createdAt)} />
              <InfoBox label="Updated" value={formatDate(dataset.updatedAt)} />
            </div>

            <div className="mt-6">
              <ScoreBar
                label="Review Coverage"
                value={dataset.reviewRate}
                tone={dataset.reviewRate > 70 ? "green" : "gold"}
              />
            </div>
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Related Scene Overview</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  dataset과 직접 연결된 scene overview를 표시합니다.
                </p>
              </div>
              <span className="rounded-full bg-slate-400/12 px-3 py-1 text-xs font-bold text-slate-200 ring-1 ring-slate-300/25">
                Connection unavailable
              </span>
            </div>

            {detail.sceneConnectionAvailable && detail.relatedScenes.length > 0 ? (
              <SceneTable scenes={detail.relatedScenes} />
            ) : (
              <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/8 p-4 text-sm leading-6 text-amber-100/80">
                {detail.sceneConnectionMessage}
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel>
            <h2 className="text-xl font-bold">Dataset Status</h2>
            <p className={"mt-4 text-3xl font-bold " + statusColors.text}>
              {dataset.status}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              이 값은 datadiction_datasets.status에서 읽습니다.
            </p>
          </Panel>

          <Panel>
            <h2 className="text-xl font-bold">Supabase Row</h2>
            <div className="mt-5 space-y-3 text-sm">
              <KeyValue label="Code" value={dataset.id} />
              <KeyValue label="Row UUID" value={dataset.rowId ?? "Not available"} />
              <KeyValue label="Grade" value={dataset.suitability} />
              <KeyValue label="Review" value={dataset.reviewRate + "%"} />
            </div>
          </Panel>
        </aside>
      </section>
    </>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-slate-100">{value}</p>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="break-all text-right font-bold text-slate-200">{value}</span>
    </div>
  );
}
