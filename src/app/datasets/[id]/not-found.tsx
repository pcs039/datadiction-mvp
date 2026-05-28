import Link from "next/link";
import { Panel, SectionHeader } from "../../components";

export default function DatasetNotFound() {
  return (
    <>
      <SectionHeader
        eyebrow="Dataset Detail"
        title="Dataset을 찾을 수 없습니다"
        description="요청한 dataset id가 Supabase 또는 fallback 데이터에 없습니다."
        action={
          <Link
            href="/datasets"
            className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-sky-200"
          >
            Dataset 목록으로
          </Link>
        }
      />

      <Panel>
        <p className="text-sm leading-6 text-slate-400">
          URL의 dataset id를 확인하거나 /datasets 목록에서 다시 선택하세요.
        </p>
      </Panel>
    </>
  );
}
