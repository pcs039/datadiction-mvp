import {
  DataSourceBadge,
  DataSourceNotice,
  Panel,
  SectionHeader,
  toneStyles,
} from "../components";
import { getDataDictionAuditEventsResult } from "../queries";

export default async function AuditLogsPage() {
  const { data: auditEvents, status: dataStatus } =
    await getDataDictionAuditEventsResult();

  return (
    <>
      <SectionHeader
        eyebrow="Audit Logs"
        title="검수 이력과 모델 판단 추적"
        description="AI 라벨 생성, 검수자 수정, 위험 태그 확정, 리포트 생성까지 추적 가능한 감사 로그입니다."
        action={<DataSourceBadge status={dataStatus} />}
      />

      <DataSourceNotice status={dataStatus} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <h2 className="text-xl font-bold">Timeline</h2>
          <div className="mt-6 space-y-5">
            {auditEvents.map((event) => {
              const tone = toneStyles(event.tone);
              return (
                <div
                  key={`${event.time}-${event.action}`}
                  className="grid grid-cols-[24px_minmax(0,1fr)] gap-4"
                >
                  <div className="relative">
                    <span className={`mt-1 block h-3 w-3 rounded-full ${tone.dot}`} />
                    <span className="absolute left-[5px] top-5 h-[calc(100%+16px)] w-px bg-white/10" />
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-bold ${tone.text}`}>
                          {event.actor}
                        </p>
                        <h2 className="mt-1 font-bold text-slate-100">
                          {event.action}
                        </h2>
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
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold">Traceability Coverage</h2>
          <div className="mt-5 space-y-4">
            {[
              ["AI inference evidence", "184 / 184"],
              ["Human review comment", "126 / 184"],
              ["Risk tag decision", "37 / 37"],
              ["Report export log", "3 / 3"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-white/10 pb-3 text-sm"
              >
                <span className="font-semibold text-slate-400">{label}</span>
                <span className="font-bold text-slate-100">{value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
