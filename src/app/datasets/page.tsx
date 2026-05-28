import Link from "next/link";
import {
  DataSourceBadge,
  DataSourceNotice,
  DatasetTable,
  DistributionBar,
  Panel,
  SectionHeader,
  ScoreBar,
} from "../components";
import { distribution } from "../data";
import { getDataDictionDatasetsResult } from "../queries";

export default async function DatasetsPage() {
  const { data: datasetList, status: dataStatus } =
    await getDataDictionDatasetsResult();

  return (
    <>
      <SectionHeader
        eyebrow="Datasets"
        title="영상자산 데이터셋 관리"
        description="기관별 영상 묶음, 장면 수, 검수율, 적합성 등급을 추적하는 MVP 데이터셋 화면입니다."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge status={dataStatus} />
            <Link
              href="/analysis"
              className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-200"
            >
              데이터셋 추가
            </Link>
          </div>
        }
      />

      <DataSourceNotice status={dataStatus} />

      <section className="grid gap-4 md:grid-cols-3">
        {datasetList.map((dataset) => (
          <Panel key={dataset.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  {dataset.id}
                </p>
                <h2 className="mt-2 text-xl font-bold">{dataset.name}</h2>
              </div>
              <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-slate-300 ring-1 ring-white/10">
                {dataset.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {dataset.owner} · {dataset.sourceType}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-2xl font-bold">{dataset.videos}</p>
                <p className="mt-1 text-xs text-slate-500">videos</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-2xl font-bold">{dataset.scenes}</p>
                <p className="mt-1 text-xs text-slate-500">scenes</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-2xl font-bold text-amber-200">
                  {dataset.suitability}
                </p>
                <p className="mt-1 text-xs text-slate-500">grade</p>
              </div>
            </div>
            <div className="mt-5">
              <ScoreBar
                label="Review Coverage"
                value={dataset.reviewRate}
                tone={dataset.reviewRate > 70 ? "green" : "gold"}
              />
            </div>
          </Panel>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <SectionHeader
            title="Dataset Registry"
            description="Supabase datadiction_datasets 테이블을 우선 조회하고, 연결 실패 시 데모 데이터로 표시합니다."
          />
          <DatasetTable datasets={datasetList} />
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold">Input Composition</h2>
          <div className="mt-6 space-y-5">
            {distribution.map((item) => (
              <DistributionBar key={item.label} item={item} />
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
