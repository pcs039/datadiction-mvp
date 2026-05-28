import {
  AlertRow,
  Panel,
  SceneTable,
  ScoreBar,
  SectionHeader,
  riskClass,
} from "../components";
import { alerts, type Tone } from "../data";
import { getDataDictionScenes } from "../queries";

const riskGroups: [string, number, Tone][] = [
  ["Portrait Rights", 74, "rose"],
  ["Context Distortion", 68, "gold"],
  ["Speech Isolation", 44, "blue"],
  ["Copyright Review", 29, "violet"],
];

export default async function DiagnosticsPage() {
  const sceneList = await getDataDictionScenes();
  const highRiskScenes = sceneList.filter((scene) => scene.risk === "HIGH");

  return (
    <>
      <SectionHeader
        eyebrow="Diagnostics"
        title="권리·윤리·맥락 위험 진단"
        description="DataDiction은 법률 판단을 확정하지 않고, 검수 우선순위와 위험 후보를 제안하는 방식으로 책임 범위를 분리합니다."
      />

      <section className="grid gap-4 md:grid-cols-4">
        {riskGroups.map(([label, value, tone]) => (
          <Panel key={label}>
            <p className="text-sm font-bold text-slate-400">{label}</p>
            <p className="mt-5 text-4xl font-bold">{value}%</p>
            <div className="mt-5">
              <ScoreBar label="risk signal" value={value} tone={tone} />
            </div>
          </Panel>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">High Priority Review Queue</h2>
              <p className="mt-2 text-sm text-slate-500">
                자동 확정하지 않고 검수자 확인을 요구하는 장면입니다.
              </p>
            </div>
            <span className="rounded-full bg-rose-400/12 px-3 py-1 text-xs font-bold text-rose-200 ring-1 ring-rose-300/30">
              {highRiskScenes.length} high risk
            </span>
          </div>
          <SceneTable scenes={sceneList} />
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="text-xl font-bold">Recent Context Alerts</h2>
            <div className="mt-5 space-y-4">
              {alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-bold">Risk Candidate Labels</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "PORTRAIT_RIGHT_REVIEW",
                "MINOR_APPEARANCE",
                "ELDERLY_OR_DECEASED_REVIEW",
                "SENSITIVE_INFO",
                "COPYRIGHT_REVIEW",
                "CONTEXT_DISTORTION_RISK",
                "SPEECH_ISOLATION_RISK",
              ].map((tag, index) => (
                <span
                  key={tag}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
                    index < 3
                      ? riskClass("HIGH")
                      : "bg-white/8 text-slate-300 ring-white/10"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-500">
              후보 태그는 검수 우선순위 산정을 위한 신호이며, 최종 사용 여부는 고객 기관 또는 법률 전문가가 확정합니다.
            </p>
          </Panel>
        </div>
      </section>
    </>
  );
}
