import Link from "next/link";
import { Panel, ScoreBar, SectionHeader } from "../components";

const reportCards = [
  ["Data Suitability Statement", "재사용 가능 조건, 검수 상태, 위험 후보를 요약합니다.", "B+"],
  ["PoC Result Brief", "장면 분할, 관계 분석, 검수 효율 지표를 정리합니다.", "Draft"],
  ["Risk Review Export", "권리·윤리·맥락 위험 후보와 처리 상태를 내보냅니다.", "Ready"],
];

export default function ReportsPage() {
  return (
    <>
      <SectionHeader
        eyebrow="Reports"
        title="데이터 적합성 명세서와 PoC 리포트"
        description="MVP에서는 보고서 초안 화면을 제공하고, 이후 PDF/Excel 생성 API와 연결할 수 있습니다."
        action={
          <button className="rounded-lg bg-violet-400 px-4 py-2 text-sm font-bold text-white">
            Generate Statement
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {reportCards.map(([title, description, status]) => (
          <Panel key={title}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold">{title}</h2>
              <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-slate-300 ring-1 ring-white/10">
                {status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
            <button className="mt-6 w-full rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/7">
              미리보기
            </button>
          </Panel>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <h2 className="text-xl font-bold">Data Suitability Statement Preview</h2>
          <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 p-5">
            <p className="text-sm font-bold text-slate-400">VIDSET-001</p>
            <h3 className="mt-2 text-2xl font-bold">
              지역 기록 영상 PoC 데이터 적합성 명세서
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              본 데이터셋은 비드라마 지역 기록 영상 4건, 184개 장면으로 구성되어 있으며,
              발화-화면 관계, 장면 기능, 정서·서사 역할, 맥락 의존도, 위험 후보 태그가
              장면 단위로 생성되었습니다. 현재 적합성 등급은 B+이며, 고위험 후보 장면은
              Human-in-the-loop 검수 후 사용 조건을 확정해야 합니다.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-3xl font-bold text-amber-200">B+</p>
                <p className="mt-1 text-xs text-slate-500">Suitability</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-3xl font-bold text-sky-200">184</p>
                <p className="mt-1 text-xs text-slate-500">Scenes</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-3xl font-bold text-rose-200">37</p>
                <p className="mt-1 text-xs text-slate-500">Review needed</p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold">Export Readiness</h2>
          <div className="mt-5 space-y-5">
            <ScoreBar label="Metadata completeness" value={91} tone="green" />
            <ScoreBar label="Risk review coverage" value={68} tone="gold" />
            <ScoreBar label="Evidence traceability" value={84} tone="blue" />
          </div>
          <div className="mt-6 grid gap-2">
            <button className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-200">
              PDF 초안 생성
            </button>
            <button className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/7">
              Excel 메타데이터 내보내기
            </button>
            <Link
              href="/audit-logs"
              className="rounded-lg border border-white/15 px-4 py-2 text-center text-sm font-bold text-slate-200 hover:bg-white/7"
            >
              검수 이력 확인
            </Link>
          </div>
        </Panel>
      </section>
    </>
  );
}
