import Link from "next/link";
import type { ReactNode } from "react";
import type { DataSourceStatus } from "./queries";
import {
  alerts,
  barMetrics,
  distribution,
  scenes as fallbackScenes,
  sourceTypes,
  workflowStages,
  type Alert,
  type Dataset,
  type Distribution,
  type Metric,
  type Scene,
  type Tone,
} from "./data";

export function toneStyles(tone: Tone) {
  if (tone === "violet") {
    return {
      text: "text-violet-300",
      brightText: "text-violet-200",
      soft: "bg-violet-400/12 text-violet-200 ring-violet-300/30",
      border: "border-violet-300/25",
      bar: "from-violet-400 to-fuchsia-400",
      dot: "bg-violet-400",
    };
  }

  if (tone === "blue") {
    return {
      text: "text-sky-300",
      brightText: "text-sky-200",
      soft: "bg-sky-400/12 text-sky-200 ring-sky-300/30",
      border: "border-sky-300/25",
      bar: "from-sky-400 to-blue-500",
      dot: "bg-sky-400",
    };
  }

  if (tone === "green") {
    return {
      text: "text-emerald-300",
      brightText: "text-emerald-200",
      soft: "bg-emerald-400/12 text-emerald-200 ring-emerald-300/30",
      border: "border-emerald-300/25",
      bar: "from-emerald-400 to-teal-400",
      dot: "bg-emerald-400",
    };
  }

  if (tone === "gold") {
    return {
      text: "text-amber-300",
      brightText: "text-amber-200",
      soft: "bg-amber-400/12 text-amber-200 ring-amber-300/30",
      border: "border-amber-300/25",
      bar: "from-amber-300 to-yellow-500",
      dot: "bg-amber-300",
    };
  }

  if (tone === "rose") {
    return {
      text: "text-rose-300",
      brightText: "text-rose-200",
      soft: "bg-rose-400/12 text-rose-200 ring-rose-300/30",
      border: "border-rose-300/25",
      bar: "from-rose-400 to-pink-500",
      dot: "bg-rose-400",
    };
  }

  return {
    text: "text-slate-300",
    brightText: "text-slate-100",
    soft: "bg-slate-400/12 text-slate-200 ring-slate-300/20",
    border: "border-white/10",
    bar: "from-slate-400 to-slate-600",
    dot: "bg-slate-400",
  };
}

export function riskClass(risk: Scene["risk"]) {
  if (risk === "HIGH") return "bg-rose-400/15 text-rose-200 ring-rose-300/30";
  if (risk === "MEDIUM") return "bg-amber-400/15 text-amber-200 ring-amber-300/30";
  return "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30";
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/12 bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,41,59,0.72)_48%,rgba(88,28,135,0.18))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-sm font-bold text-sky-300">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function DataSourceBadge({ status }: { status: DataSourceStatus }) {
  const isLive = status.source === "supabase";
  const className = [
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1",
    isLive
      ? "bg-emerald-400/12 text-emerald-200 ring-emerald-300/30"
      : "bg-amber-400/12 text-amber-200 ring-amber-300/30",
  ].join(" ");
  const dotClassName = [
    "h-2 w-2 rounded-full",
    isLive ? "bg-emerald-300" : "bg-amber-300",
  ].join(" ");

  return (
    <span className={className} title={status.reason}>
      <span className={dotClassName} />
      {status.label}
    </span>
  );
}

export function DataSourceNotice({ status }: { status: DataSourceStatus }) {
  if (status.source === "supabase") return null;

  return (
    <div className="rounded-xl border border-amber-300/20 bg-amber-300/8 p-4 text-sm text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex flex-wrap items-center gap-3">
        <DataSourceBadge status={status} />
        <p className="font-bold">현재 화면은 내장 데모 데이터를 표시하고 있습니다.</p>
      </div>
      <p className="mt-2 leading-6 text-amber-100/75">{status.reason}</p>
    </div>
  );
}

export function MetricCard({ metric }: { metric: Metric }) {
  const tone = toneStyles(metric.tone);

  return (
    <section
      className={`rounded-xl border ${tone.border} bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.76)_55%,rgba(109,40,217,0.2))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]`}
    >
      <p className="text-sm font-semibold text-slate-300">{metric.label}</p>
      <div className="mt-7 flex flex-wrap items-end gap-3">
        <p className={`text-4xl font-bold tracking-tight ${tone.brightText}`}>
          {metric.value}
        </p>
        <span className={`pb-1 text-sm font-bold ${tone.text}`}>
          {metric.delta}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{metric.caption}</p>
    </section>
  );
}

export function Legend({ tone, label }: { tone: Tone; label: string }) {
  const styles = toneStyles(tone);

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}

export function LineChart() {
  return (
    <div className="mt-8 overflow-hidden rounded-lg">
      <svg
        viewBox="0 0 940 250"
        className="h-[250px] w-full"
        role="img"
        aria-label="Context audit line chart"
      >
        <defs>
          <linearGradient id="violetLine" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="blueLine" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.03" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[40, 90, 140, 190, 240].map((y) => (
          <line
            key={y}
            x1="30"
            x2="920"
            y1={y}
            y2={y}
            stroke="rgba(148,163,184,0.16)"
          />
        ))}

        <path
          d="M30 118 C80 88 110 86 145 130 C180 174 210 82 250 120 C290 158 320 36 365 78 C410 120 438 68 480 102 C525 140 555 98 598 62 C650 15 688 42 724 92 C762 146 800 42 842 68 C878 95 886 118 920 84 L920 240 L30 240 Z"
          fill="url(#violetLine)"
        />
        <path
          d="M30 118 C80 88 110 86 145 130 C180 174 210 82 250 120 C290 158 320 36 365 78 C410 120 438 68 480 102 C525 140 555 98 598 62 C650 15 688 42 724 92 C762 146 800 42 842 68 C878 95 886 118 920 84"
          fill="none"
          filter="url(#glow)"
          stroke="#c084fc"
          strokeLinecap="round"
          strokeWidth="4"
        />

        <path
          d="M30 210 C70 110 98 116 128 164 C160 212 195 114 232 150 C270 178 312 108 360 130 C402 154 435 188 490 142 C535 98 570 102 606 84 C650 56 686 122 724 152 C762 178 796 84 835 122 C870 154 900 174 920 136 L920 240 L30 240 Z"
          fill="url(#blueLine)"
        />
        <path
          d="M30 210 C70 110 98 116 128 164 C160 212 195 114 232 150 C270 178 312 108 360 130 C402 154 435 188 490 142 C535 98 570 102 606 84 C650 56 686 122 724 152 C762 178 796 84 835 122 C870 154 900 174 920 136"
          fill="none"
          filter="url(#glow)"
          stroke="#60a5fa"
          strokeLinecap="round"
          strokeWidth="4"
        />

        <line
          x1="598"
          x2="598"
          y1="34"
          y2="230"
          stroke="rgba(226,232,240,0.28)"
          strokeDasharray="4 5"
        />
        <circle cx="598" cy="62" fill="#111827" r="8" stroke="#c084fc" strokeWidth="4" />
        <circle cx="598" cy="84" fill="#111827" r="8" stroke="#60a5fa" strokeWidth="4" />
        <foreignObject x="620" y="44" width="210" height="94">
          <div className="rounded-lg border border-white/10 bg-slate-950/88 p-3 text-xs text-slate-300 shadow-xl">
            <p className="font-bold text-slate-100">May 27, 2026</p>
            <p className="mt-1 text-violet-300">Context Accuracy: 72.4%</p>
            <p className="mt-1 text-sky-300">Video Integrity: 88.1%</p>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

export function BarChart() {
  const max = 24;

  return (
    <div className="mt-8">
      <div className="relative h-[220px] border-b border-white/10">
        {[0, 1, 2, 3].map((line) => (
          <div
            key={line}
            className="absolute left-0 right-0 border-t border-white/10"
            style={{ bottom: `${line * 54}px` }}
          />
        ))}

        <div className="absolute inset-x-0 bottom-0 grid h-full grid-cols-4 items-end gap-7 px-5">
          {barMetrics.map((item) => {
            const styles = toneStyles(item.tone);

            return (
              <div key={item.label} className="min-w-0 text-center">
                <p className="mb-2 text-lg font-bold text-slate-100">
                  {item.value}%
                </p>
                <div
                  className={`mx-auto w-full max-w-[150px] rounded-t-lg border border-white/15 bg-gradient-to-b ${styles.bar} shadow-[0_0_24px_rgba(168,85,247,0.22)]`}
                  style={{ height: `${(item.value / max) * 170}px` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-7 px-5 text-center">
        {barMetrics.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-300">
              {item.label}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-600">
              {item.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertRow({ alert }: { alert: Alert }) {
  const tone = toneStyles(alert.tone);

  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      <div
        className={`mt-1 h-4 w-4 rounded-full ring-4 ring-offset-0 ${tone.dot} ring-white/8`}
      />
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-bold ${tone.text}`}>{alert.id}</p>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${tone.soft}`}>
            flag
          </span>
        </div>
        <p className="mt-1 font-bold text-slate-200">{alert.title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{alert.detail}</p>
      </div>
    </div>
  );
}

export function DistributionBar({ item }: { item: Distribution }) {
  const tone = toneStyles(item.tone);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-300">{item.label}</span>
        <span className="font-bold text-slate-200">{item.value}%</span>
      </div>
      <div className="h-3 rounded-full bg-slate-700/60">
        <div
          className={`h-3 rounded-full bg-gradient-to-r ${tone.bar} shadow-[0_0_18px_rgba(96,165,250,0.28)]`}
          style={{ width: `${item.value}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const styles = toneStyles(tone);

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-semibold text-slate-400">{label}</span>
        <span className={`font-bold ${styles.text}`}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${styles.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function SceneTable({
  compact = false,
  scenes = fallbackScenes,
}: {
  compact?: boolean;
  scenes?: Scene[];
}) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr className="border-b border-white/10">
            <th className="py-3 pr-4 font-bold">Scene</th>
            <th className="px-4 py-3 font-bold">Function</th>
            <th className="px-4 py-3 font-bold">Relation</th>
            <th className="px-4 py-3 font-bold">CDS</th>
            <th className="px-4 py-3 font-bold">Risk</th>
            <th className="py-3 pl-4 font-bold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8">
          {scenes.map((scene) => (
            <tr key={scene.id} className="hover:bg-white/5">
              <td className="py-4 pr-4">
                <Link
                  href={`/scenes/${scene.id}`}
                  className="font-bold text-slate-100 hover:text-sky-300"
                >
                  {scene.id}
                </Link>
                <p className="mt-1 text-xs text-slate-500">{scene.time}</p>
              </td>
              <td className="px-4 py-4 font-semibold text-slate-300">
                {scene.functionLabel}
              </td>
              <td className="px-4 py-4 font-semibold text-sky-300">
                {scene.relation}
              </td>
              <td className="px-4 py-4 font-bold text-slate-100">
                {scene.cds.toFixed(2)}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${riskClass(
                    scene.risk,
                  )}`}
                >
                  {scene.risk}
                </span>
              </td>
              <td className="py-4 pl-4">
                <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-slate-300 ring-1 ring-white/10">
                  {compact ? scene.status.slice(0, 10) : scene.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DatasetTable({ datasets }: { datasets: Dataset[] }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr className="border-b border-white/10">
            <th className="py-3 pr-4 font-bold">Dataset</th>
            <th className="px-4 py-3 font-bold">Owner</th>
            <th className="px-4 py-3 font-bold">Type</th>
            <th className="px-4 py-3 font-bold">Videos</th>
            <th className="px-4 py-3 font-bold">Scenes</th>
            <th className="px-4 py-3 font-bold">Review</th>
            <th className="py-3 pl-4 font-bold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8">
          {datasets.map((dataset) => (
            <tr key={dataset.id} className="hover:bg-white/5">
              <td className="py-4 pr-4">
                <p className="font-bold text-slate-100">{dataset.name}</p>
                <p className="mt-1 text-xs text-slate-500">{dataset.id}</p>
              </td>
              <td className="px-4 py-4 text-slate-300">{dataset.owner}</td>
              <td className="px-4 py-4 text-slate-300">{dataset.sourceType}</td>
              <td className="px-4 py-4 font-bold">{dataset.videos}</td>
              <td className="px-4 py-4 font-bold">{dataset.scenes}</td>
              <td className="px-4 py-4">
                <ScoreBar
                  label="reviewed"
                  value={dataset.reviewRate}
                  tone={dataset.reviewRate > 70 ? "green" : "gold"}
                />
              </td>
              <td className="py-4 pl-4">
                <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-slate-300 ring-1 ring-white/10">
                  {dataset.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardSidePanels() {
  return (
    <aside className="space-y-6">
      <Panel>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Context Alerts</h2>
          <span className="text-2xl leading-none text-slate-500">...</span>
        </div>

        <div className="mt-5 space-y-4">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      </Panel>

      <Panel>
        <h2 className="text-xl font-bold">Dataset Distribution</h2>
        <div className="mt-6 space-y-5">
          {distribution.map((item) => (
            <DistributionBar key={item.label} item={item} />
          ))}
        </div>

        <div className="mt-7 space-y-3 border-t border-white/10 pt-5">
          <div className="flex justify-between text-sm font-bold text-slate-300">
            <span>Source Types</span>
            <span>Share</span>
          </div>
          {sourceTypes.map(([label, value], index) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-400">
                <span
                  className={`h-2 w-2 rounded-full ${
                    index === 0
                      ? "bg-violet-400"
                      : index === 1
                        ? "bg-sky-400"
                        : "bg-slate-600"
                  }`}
                />
                {label}
              </span>
              <span className="font-semibold text-slate-300">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <span className="text-sm font-bold text-slate-400">Total Scenes</span>
          <span className="text-xl font-bold">1,462</span>
        </div>
      </Panel>
    </aside>
  );
}

export function WorkflowList() {
  return (
    <div className="mt-5 space-y-4">
      {workflowStages.map(([name, detail, progress, tone], index) => {
        const colors = toneStyles(tone);
        return (
          <div
            key={name}
            className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-4 sm:grid-cols-[42px_minmax(0,1fr)_64px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/8 text-sm font-bold">
              {index + 1}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-100">{name}</p>
              <p className="mt-1 text-sm text-slate-500">{detail}</p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${colors.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="self-center text-right text-sm font-bold text-slate-300">
              {progress}%
            </p>
          </div>
        );
      })}
    </div>
  );
}
