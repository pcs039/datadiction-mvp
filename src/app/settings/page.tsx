import { Panel, ScoreBar, SectionHeader } from "../components";
import type { Tone } from "../data";

const labelProfiles = [
  "Documentary / 교양",
  "Public Archive / 공공 기록",
  "Education / 교육",
  "Promotion / 홍보",
];

const thresholds: [string, number, Tone][] = [
  ["Confidence threshold", 78, "blue"],
  ["Context dependency review", 60, "rose"],
  ["Risk candidate review", 55, "gold"],
];

export default function SettingsPage() {
  return (
    <>
      <SectionHeader
        eyebrow="Settings"
        title="분석 프로파일과 검수 기준"
        description="MVP에서는 분석 프로파일, 라벨 스키마, 검수 임계값, 책임 범위 문구를 설정 화면으로 제공합니다."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Panel>
          <h2 className="text-xl font-bold">Analysis Profile</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-400">기본 프로파일</span>
              <select className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
                {labelProfiles.map((profile) => (
                  <option key={profile}>{profile}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-400">출력 스키마</span>
              <select className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
                <option>SceneContext v0.1</option>
                <option>Public Archive v0.1</option>
                <option>Risk Review v0.1</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-400">책임 범위 문구</span>
              <textarea
                rows={5}
                defaultValue="DataDiction은 자동 법률 자문 서비스를 제공하지 않습니다. 시스템은 권리·윤리·맥락 위험 가능성이 있는 장면을 탐지하고 검수 우선순위를 제안하는 기술 도구입니다."
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm leading-6 text-slate-200"
              />
            </label>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold">Review Trigger</h2>
          <div className="mt-5 space-y-5">
            {thresholds.map(([label, value, tone]) => (
              <ScoreBar key={label} label={label} value={value} tone={tone} />
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {[
              "미성년자 등장 후보는 자동 HIGH",
              "외부 자료화면 권리 불명확 시 검수 대기",
              "CDS 0.6 이상이면 단독 사용 경고",
            ].map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-slate-300"
              >
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                {item}
              </label>
            ))}
          </div>
        </Panel>
      </section>

      <Panel>
        <h2 className="text-xl font-bold">Label Schema</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Speech-Screen Relation", "DIRECT_MATCH, EVIDENCE_VISUAL, EMOTIONAL_REINFORCEMENT"],
            ["Scene Function", "CORE_INTERVIEW, EXPLANATORY_INSERT, EMOTIONAL_BROLL"],
            ["Risk Candidates", "PORTRAIT_RIGHT_REVIEW, MINOR_APPEARANCE, CONTEXT_DISTORTION_RISK"],
          ].map(([title, labels]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-slate-100">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{labels}</p>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
