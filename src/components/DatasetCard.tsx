import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { AccessBadge } from "@/components/AccessBadge";
import type { Dataset } from "@/types/dataset";

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <Link
      href={`/datasets/${dataset.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-cyan-400/30 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-cyan-300/80">
            {dataset.shortTitle}
          </p>
          <h3 className="mt-1 text-base font-semibold text-white group-hover:text-cyan-50">
            {dataset.title}
          </h3>
        </div>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-cyan-300"
          aria-hidden
        />
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-400">
        {dataset.bestFor}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AccessBadge accessType={dataset.accessType} />
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-300">
          <Layers className="h-3 w-3" aria-hidden />
          {dataset.sizeTier}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {dataset.categories.slice(0, 3).map((cat) => (
          <span
            key={cat}
            className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400"
          >
            {cat}
          </span>
        ))}
      </div>
    </Link>
  );
}
