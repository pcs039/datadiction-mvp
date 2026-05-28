import { Panel } from "./components";

export default function DataDictionLoading() {
  return (
    <Panel>
      <div className="h-7 w-64 animate-pulse rounded bg-white/10" />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-lg bg-white/7" />
        <div className="h-28 animate-pulse rounded-lg bg-white/7" />
        <div className="h-28 animate-pulse rounded-lg bg-white/7" />
      </div>
    </Panel>
  );
}
