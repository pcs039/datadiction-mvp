import Link from "next/link";
import { Panel, ScoreBar, SectionHeader } from "../components";
import { SuitabilityStatementGenerator } from "./suitability-statement-generator";

const reportCards = [
  ["Data Suitability Statement", "재사용 가능 조건, 검수 상태, 위험 후보를 요약합니다.", "B+"],
  ["PoC Result Brief", "장면 분할, 관계 분석, 검수 효율 지표를 정리합니다.", "Draft"],
  ["Risk Review Export", "권리·윤리·맥락 위험 후보와 처리 상태를 내보냅니다.", "Ready"],
];

type ReportsPageProps = {
  searchParams: Promise<{
    generate?: string | string[];
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const generateParam = Array.isArray(params.generate)
    ? params.generate[0]
    : params.generate;
  const autoGenerate = generateParam === "suitability-statement";

  return (
    <>
      <SectionHeader
        eyebrow="Reports"
        title="데이터 적합성 명세서와 PoC 리포트"
        description="현재 Supabase 데이터를 기준으로 데이터 적합성 명세서 초안을 생성하고 감사 로그에 기록합니다."
        action={
          <Link
            href="/reports?generate=suitability-statement#suitability-statement"
            className="rounded-lg bg-violet-400 px-4 py-2 text-sm font-bold text-white hover:bg-violet-300"
          >
            Generate Statement
          </Link>
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
        <SuitabilityStatementGenerator autoGenerate={autoGenerate} />

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
