import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Panel,
  ScoreBar,
  SectionHeader,
  riskClass,
  toneStyles,
} from "../../components";
import { getDataDictionScenes } from "../../queries";

export default async function SceneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sceneList = await getDataDictionScenes();
  const scene = sceneList.find((item) => item.id === id);

  if (!scene) {
    notFound();
  }

  const statusTone = scene.status === "CONFIRMED" ? "green" : "gold";
  const statusColors = toneStyles(statusTone);

  return (
    <>
      <SectionHeader
        eyebrow="Scene Review"
        title={`${scene.id} 상세 검수`}
        description="장면 단위 입력 패키지, AI 추론 결과, 위험 후보, 검수 결정을 한 화면에서 확인합니다."
        action={
          <Link
            href="/diagnostics"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/7"
          >
            진단 화면으로
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-sky-300">{scene.time}</p>
                <h2 className="mt-2 text-2xl font-bold">{scene.summary}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${riskClass(scene.risk)}`}>
                {scene.risk}
              </span>
            </div>

            <div className="mt-6 aspect-video overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#164e63_44%,#581c87_100%)]">
              <div className="flex h-full flex-col justify-end p-5">
                <div className="max-w-lg rounded-lg bg-black/35 p-4 backdrop-blur">
                  <p className="text-xs font-bold text-sky-200">
                    Representative frame package
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    시골길, 주민, 배경 공간, 전후 장면 요약, STT 발화를 하나의 장면 입력 패키지로 정렬합니다.
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-bold">AI Reasoning Evidence</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">{scene.evidence}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoBox label="Speech-Screen Relation" value={scene.relation} tone="blue" />
              <InfoBox label="Scene Function" value={scene.functionLabel} tone="violet" />
              <InfoBox label="Emotion Tags" value={scene.emotion.join(", ")} tone="green" />
              <InfoBox label="Narrative Role" value={scene.narrative.join(", ")} tone="gold" />
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-bold">Review Decision</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <button className="rounded-lg border border-white/15 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/7">
                라벨 수정
              </button>
              <button className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100 hover:bg-amber-400/15">
                검수 보류
              </button>
              <button className="rounded-lg bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300">
                최종 확정
              </button>
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel>
            <h2 className="text-xl font-bold">Scene Scores</h2>
            <div className="mt-5 space-y-5">
              <ScoreBar
                label="Context Dependency"
                value={Math.round(scene.cds * 100)}
                tone={scene.cds > 0.6 ? "rose" : "gold"}
              />
              <ScoreBar label="Inference Confidence" value={scene.confidence} tone="blue" />
              <ScoreBar label="Reuse Suitability" value={scene.suitability} tone="gold" />
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-bold">Risk Candidates</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {scene.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-rose-400/12 px-3 py-1.5 text-xs font-bold text-rose-200 ring-1 ring-rose-300/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-bold">Review Status</h2>
            <p className={`mt-4 text-2xl font-bold ${statusColors.text}`}>
              {scene.status}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              모든 판단은 검수 이력에 기록되며 리포트와 데이터 적합성 명세서에 반영됩니다.
            </p>
          </Panel>
        </aside>
      </section>
    </>
  );
}

function InfoBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "violet" | "blue" | "green" | "gold";
}) {
  const colors = toneStyles(tone);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-sm font-bold ${colors.text}`}>{value}</p>
    </div>
  );
}
