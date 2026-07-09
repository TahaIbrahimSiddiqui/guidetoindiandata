import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { AccessBadge } from "@/components/AccessBadge";
import { AcademicBadgeList } from "@/components/AcademicBadge";
import { getWaveForDataset } from "@/data/series";
import type { Dataset } from "@/types/dataset";

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  const meta = getWaveForDataset(dataset.slug);
  const isAcademic = dataset.sourceKind && dataset.sourceKind !== "government";

  return (
    <Link
      href={`/datasets/${dataset.slug}`}
      className="group flex h-full flex-col rounded-xl border border-obsidian-border bg-obsidian-panel p-5 transition hover:border-obsidian-purple/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {meta && (
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-obsidian-purple-bright">
              {meta.series.shortTitle} · {meta.wave.yearLabel}
            </p>
          )}
          {isAcademic && !meta && (
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-violet-300/90">
              Academic / Dataverse
            </p>
          )}
          <p className="font-mono text-xs text-obsidian-muted">
            {dataset.shortTitle}
          </p>
          <h3 className="mt-1 text-base font-semibold text-obsidian-text group-hover:text-obsidian-purple-bright">
            {dataset.title}
          </h3>
        </div>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-obsidian-muted transition group-hover:text-obsidian-purple-bright"
          aria-hidden
        />
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-obsidian-muted">
        {dataset.bestFor}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AccessBadge accessType={dataset.accessType} />
        <AcademicBadgeList badges={dataset.academicBadges} />
        <span className="inline-flex items-center gap-1 rounded-full border border-obsidian-border px-2.5 py-0.5 text-xs text-obsidian-muted">
          <Layers className="h-3 w-3" aria-hidden />
          {dataset.sizeTier}
        </span>
      </div>
    </Link>
  );
}
