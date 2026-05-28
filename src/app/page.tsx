import Link from "next/link";
import {
  BarChart,
  DashboardSidePanels,
  Legend,
  LineChart,
  MetricCard,
  Panel,
  SceneTable,
  SectionHeader,
} from "./components";
import { metrics } from "./data";
import { getDataDictionScenes } from "./queries";

export default async function DataDictionDashboardPage() {
  const sceneList = await getDataDictionScenes();

  return (
    <>
      <SectionHeader
        eyebrow="MVP Dashboard"
        title="DataDiction 장면 맥락 감사 대시보드"
        description="비드라마 영상 장면의 관계, 기능, 정서·서사, 맥락 의존도, 권리 위험 후보를 한눈에 확인합니다."
        action={
          <Link
            href="/analysis"
            className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-200"
          >
            새 분석 시작
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel className="min-h-[390px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Context Audit Trends (Last 30 Scenes)
                </h2>
                <div className="mt-4 flex flex-wrap gap-5 text-sm font-semibold text-slate-300">
                  <Legend tone="violet" label="Context Accuracy" />
                  <Legend tone="blue" label="Video Integrity" />
                </div>
              </div>
              <div className="flex items-end gap-4">
                <p className="text-4xl font-bold text-violet-300">72.4%</p>
                <span className="mb-1 h-8 w-px bg-white/15" />
                <p className="text-4xl font-bold text-sky-300">88.1%</p>
              </div>
            </div>

            <LineChart />
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Video & Text Model Analysis</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Comparison for risk and context categories
                </p>
              </div>
              <span className="text-2xl leading-none text-slate-500">...</span>
            </div>

            <BarChart />
          </Panel>

          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Scene Review Queue</h2>
                <p className="mt-2 text-sm text-slate-500">
                  장면을 선택하면 상세 검수 페이지로 이동합니다.
                </p>
              </div>
              <Link
                href="/diagnostics"
                className="rounded-full bg-rose-400/12 px-3 py-1 text-xs font-bold text-rose-200 ring-1 ring-rose-300/30"
              >
                HIGH 우선 보기
              </Link>
            </div>

            <SceneTable scenes={sceneList} />
          </Panel>
        </div>

        <DashboardSidePanels />
      </section>
    </>
  );
}
