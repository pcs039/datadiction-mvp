import Link from "next/link";
import {
  DataSourceBadge,
  DataSourceNotice,
  Panel,
  SceneTable,
  ScoreBar,
  SectionHeader,
  WorkflowList,
  toneStyles,
} from "../components";
import type { Tone } from "../data";
import { getDataDictionScenesResult } from "../queries";
import { VideoUploadForm } from "./video-upload-form";

export default async function AnalysisPage() {
  const { data: sceneList, status: dataStatus } =
    await getDataDictionScenesResult();
  const selectedScene = sceneList[0];
  const inferenceFields: { label: string; value: string; tone: Tone }[] = [
    ["Relation", selectedScene.relation, "blue"],
    ["Function", selectedScene.functionLabel, "violet"],
    ["Emotion", selectedScene.emotion.join(", "), "green"],
  ].map(([label, value, tone]) => ({ label, value, tone: tone as Tone }));

  return (
    <>
      <SectionHeader
        eyebrow="Analysis Workspace"
        title="영상 입력부터 HITL 검수까지"
        description="MVP에서는 영상 업로드, 전처리 상태, 장면 패키지, AI 추론 결과, 검수 큐까지 하나의 작업 흐름으로 연결합니다."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceBadge status={dataStatus} />
            <button className="rounded-lg bg-violet-400 px-4 py-2 text-sm font-bold text-white shadow-[0_0_24px_rgba(168,85,247,0.28)]">
              Run SceneContext Inference
            </button>
          </div>
        }
      />

      <DataSourceNotice status={dataStatus} />

      <section className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <Panel>
          <h2 className="text-xl font-bold">Video Ingestion</h2>
          <VideoUploadForm />
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold">Processing Pipeline</h2>
          <p className="mt-2 text-sm text-slate-500">
            각 단계는 MVP에서 실제 상태 카드로 표시되며, 향후 API 작업 큐와 연결할 수 있습니다.
          </p>
          <WorkflowList />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel>
          <h2 className="text-xl font-bold">Scene Package Preview</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["Representative Frames", "시골길, 주택, 논밭, 고령 주민"],
              ["STT Utterance", "마을 공동체의 오래된 기억과 상호부조 설명"],
              ["Context Window", "이전: 마을 전경 / 다음: 주민 인터뷰"],
              ["Source Metadata", "지역 기록 영상, 공공기관 아카이브"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <SceneTable compact scenes={sceneList} />
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold">Selected Inference</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {selectedScene.summary}
          </p>

          <div className="mt-5 space-y-4">
            {inferenceFields.map(({ label, value, tone }) => {
              const colors = toneStyles(tone);
              return (
                <div key={label} className="border-b border-white/10 pb-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {label}
                  </p>
                  <p className={`mt-1 text-sm font-bold ${colors.text}`}>
                    {value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            <ScoreBar label="Context Dependency" value={72} tone="rose" />
            <ScoreBar label="Inference Confidence" value={82} tone="blue" />
            <ScoreBar label="Reuse Suitability" value={61} tone="gold" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button className="rounded-lg border border-white/15 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/7">
              라벨 수정
            </button>
            <Link
              href={`/scenes/${selectedScene.id}`}
              className="rounded-lg bg-sky-300 px-3 py-2 text-center text-sm font-bold text-slate-950 hover:bg-sky-200"
            >
              상세 검수
            </Link>
          </div>
        </Panel>
      </section>
    </>
  );
}
