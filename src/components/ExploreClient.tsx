"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DatasetCard } from "@/components/DatasetCard";
import { DatasetFilters } from "@/components/DatasetFilters";
import { InContentAd } from "@/components/ads/ContentWithAds";
import { datasets } from "@/data/datasets";
import {
  filterDatasets,
  type DatasetFilters as FilterState,
} from "@/lib/search";
import type { AccessType } from "@/types/dataset";

export function ExploreClient() {
  const params = useSearchParams();

  const filters = useMemo((): FilterState => {
    const access = params.get("accessType");
    return {
      q: params.get("q") ?? undefined,
      category: params.get("category") ?? undefined,
      accessType: access ? (access as AccessType) : "",
      geography: params.get("geography") ?? undefined,
      frequency: params.get("frequency") ?? undefined,
      institution: params.get("institution") ?? undefined,
      cluster: params.get("cluster") ?? undefined,
      flag: params.get("flag") ?? undefined,
      source: params.get("source") ?? undefined,
    };
  }, [params]);

  const results = useMemo(
    () => filterDatasets(datasets, filters),
    [filters]
  );

  return (
    <div>
      <header className="mb-10 max-w-3xl">
        <p className="page-kicker">Catalog</p>
        <h1 className="page-title">Explore</h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#D3D4C0]">
          Filter by access friction, geography, and source layer—not just topic
          labels.
        </p>
      </header>

      <DatasetFilters />

      <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D3D4C0]/70">
        Showing{" "}
        <span className="text-[#F3E4C9]">{results.length}</span> of{" "}
        {datasets.length} datasets
      </p>

      <div className="mt-6 grid gap-px bg-obsidian-border sm:grid-cols-2">
        {results.map((d, i) => (
          <div key={d.slug} className="contents">
            <DatasetCard dataset={d} />
            {(i + 1) % 6 === 0 && i < results.length - 1 ? (
              <div className="sm:col-span-2">
                <InContentAd />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900/40 p-10 text-center">
          <p className="text-white">No datasets match these filters.</p>
          <p className="mt-2 text-sm text-slate-400">
            Try clearing search or broadening access type / category.
          </p>
        </div>
      )}
    </div>
  );
}
