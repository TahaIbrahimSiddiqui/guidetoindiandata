import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
      className="group flex h-full flex-col border border-obsidian-border bg-obsidian-panel p-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#F3E4C9]/35 hover:bg-[#0f3558]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#C4A574]">
            {meta
              ? `${meta.series.shortTitle} · ${meta.wave.yearLabel}`
              : isAcademic
                ? dataset.sourceKind === "github-community"
                  ? "GitHub / Community"
                  : "Academic / Dataverse"
                : dataset.shortTitle}
          </p>
          <h3 className="font-display mt-3 text-xl font-semibold leading-tight tracking-tight text-[#F3E4C9] transition-colors group-hover:text-white">
            {dataset.title}
          </h3>
        </div>
        <ArrowUpRight
          className="mt-1 h-4 w-4 shrink-0 text-[#D3D4C0]/50 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#F3E4C9]"
          aria-hidden
        />
      </div>

      <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-[#D3D4C0]/90">
        {dataset.bestFor}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-obsidian-border pt-4">
        <AccessBadge accessType={dataset.accessType} />
        <AcademicBadgeList badges={dataset.academicBadges} />
        <span className="text-[10px] uppercase tracking-[0.12em] text-[#D3D4C0]/60">
          {dataset.sizeTier}
        </span>
      </div>
    </Link>
  );
}
