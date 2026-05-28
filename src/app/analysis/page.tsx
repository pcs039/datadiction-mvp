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
import {
  getDataDictionScenesResult,
  getDataDictionUploadedVideosResult,
  type DataSourceStatus,
  type UploadedVideoQueueItem,
} from "../queries";
import { VideoUploadForm } from "./video-upload-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function UploadedVideosQueue({
  status,
  videos,
}: {
  status: DataSourceStatus;
  videos: UploadedVideoQueueItem[];
}) {
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Uploaded Videos / Not processed queue</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            최근 datadiction_videos와 datadiction_datasets에 등록된 업로드 항목입니다.
            scenes_count가 0이면 아직 자동 장면 분석 전 상태로 표시합니다.
          </p>
        </div>
        <DataSourceBadge status={status} />
      </div>

      <div className="mt-5 grid gap-3">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video.datasetCode + video.fileName}
              className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 lg:grid-cols-[1.15fr_1fr_auto]"
            >
              <div>
                <p className="text-sm font-bold text-sky-200">{video.datasetCode}</p>
                <h3 className="mt-1 font-bold text-slate-100">{video.datasetName}</h3>
                <p className="mt-1 text-sm text-slate-500">{video.fileName}</p>
              </div>
              <div className="text-sm leading-6 text-slate-400">
                <p>Source type: {video.sourceType}</p>
                <p>Status: {video.datasetStatus}</p>
                <p>Storage path: {video.hasStoragePath ? "recorded" : "missing"}</p>
              </div>
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <span className="rounded-full bg-amber-400/12 px-3 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-300/25">
                  {video.scenesCount === 0
                    ? "자동 장면 분석 전 상태"
                    : video.scenesCount + " scenes"}
                </span>
                <span className="text-xs font-semibold text-slate-500">{video.uploadedAt}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-500">
            최근 업로드된 영상이 없습니다.
          </p>
        )}
      </div>
    </Panel>
  );
}

export default async function AnalysisPage() {
  const [scenesResult, uploadedVideosResult] = await Promise.all([
    getDataDictionScenesResult(),
    getDataDictionUploadedVideosResult(),
  ]);
  const { data: sceneList, status: dataStatus } = scenesResult;
  const { data: uploadedVideos, status: uploadedVideosStatus } = uploadedVideosResult;
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

      <UploadedVideosQueue status={uploadedVideosStatus} videos={uploadedVideos} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel>
          <h2 className="text-xl font-bold">Scene Package Preview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            이 영역은 datadiction_scene_overview 기반 장면 패키지를 표시합니다. 업로드 직후
            dataset/video만 등록된 파일은 장면 분할 전 상태이므로 아래 preview에는 나타나지
            않습니다.
          </p>
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
