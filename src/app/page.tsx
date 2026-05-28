import Link from "next/link";
import {
  BarChart,
  DashboardSidePanels,
  DataSourceBadge,
  DataSourceNotice,
  Legend,
  LineChart,
  MetricCard,
  Panel,
  SceneTable,
  SectionHeader,
  toneStyles,
} from "./components";
import type { AuditEvent, Metric } from "./data";
import {
  getDataDictionDashboardResult,
  type DashboardSummary,
} from "./queries";

function formatCount(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function buildDashboardMetrics(summary: DashboardSummary): Metric[] {
  return [
    {
      label: "Datasets",
      value: formatCount(summary.datasetsTotal),
      delta: "total",
      caption: "등록 데이터셋 총 개수",
      tone: "violet",
    },
    {
      label: "Scenes",
      value: formatCount(summary.scenesTotal),
      delta: "view rows",
      caption: "scene overview 기준 장면 수",
      tone: "blue",
    },
    {
      label: "Review Pending",
      value: formatCount(summary.pendingReviewTotal),
      delta: "pending",
      caption: "REVIEW_REQUIRED/PENDING 상태",
      tone: summary.pendingReviewTotal > 0 ? "rose" : "green",
    },
    {
      label: "Audit Logs",
      value: formatCount(summary.auditEventsTotal),
      delta: "recent " + summary.recentAuditEvents.length,
      caption: "검수·추론 감사 이벤트",
      tone: "gold",
    },
  ];
}

function RecentAuditEventsPanel({ events }: { events: AuditEvent[] }) {
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Recent Audit Events</h2>
          <p className="mt-2 text-sm text-slate-500">
            Supabase 감사 로그 기준 최근 5개 이벤트입니다.
          </p>
        </div>
        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-slate-300 ring-1 ring-white/10">
          latest {events.length}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {events.length > 0 ? (
          events.map((event) => {
            const tone = toneStyles(event.tone);
            const key = [event.time, event.action, event.target].join("-");

            return (
              <div
                key={key}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={"text-sm font-bold " + tone.text}>
                      {event.actor}
                    </p>
                    <h3 className="mt-1 font-bold text-slate-100">
                      {event.action}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {event.time}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-300">
                  {event.target}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {event.detail}
                </p>
              </div>
            );
          })
        ) : (
          <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-500">
            표시할 audit event가 없습니다.
          </p>
        )}
      </div>
    </Panel>
  );
}

export default async function DataDictionDashboardPage() {
  const { data: dashboard, status: dataStatus } =
    await getDataDictionDashboardResult();
  const dashboardMetrics = buildDashboardMetrics(dashboard);

  return (
    <>
      <SectionHeader
        eyebrow="MVP Dashboard"
        title="DataDiction 운영 현황"
        description="Supabase에 적재된 데이터셋, 장면, 검수 대기, 감사 로그 상태를 첫 화면에서 확인합니다."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge status={dataStatus} />
            <Link
              href="/analysis"
              className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-200"
            >
              새 분석 시작
            </Link>
          </div>
        }
      />

      <DataSourceNotice status={dataStatus} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
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
                  Supabase scene overview 기준 장면 검수 목록입니다.
                </p>
              </div>
              <Link
                href="/diagnostics"
                className="rounded-full bg-rose-400/12 px-3 py-1 text-xs font-bold text-rose-200 ring-1 ring-rose-300/30"
              >
                HIGH 우선 보기
              </Link>
            </div>

            <SceneTable scenes={dashboard.scenes} />
          </Panel>
        </div>

        <aside className="space-y-6">
          <RecentAuditEventsPanel events={dashboard.recentAuditEvents} />
          <DashboardSidePanels totalScenes={dashboard.scenesTotal} />
        </aside>
      </section>
    </>
  );
}
