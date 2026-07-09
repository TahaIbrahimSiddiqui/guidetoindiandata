"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX, Sparkles } from "lucide-react";
import { DatasetCard } from "@/components/DatasetCard";
import { DatasetFilters } from "@/components/DatasetFilters";
import { InContentAd } from "@/components/ads/ContentWithAds";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clusters } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import {
  filterDatasets,
  type DatasetFilters as FilterState,
} from "@/lib/search";
import type { AccessType } from "@/types/dataset";

const QUICK_THEMES = clusters.slice(0, 8);

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
    [filters],
  );

  return (
    <div>
      <header className="mb-8 max-w-3xl sm:mb-10">
        <p className="page-kicker">Catalog</p>
        <h1 className="page-title">Explore datasets</h1>
        <p className="page-lede">
          Documentation-style discovery: search first, filter by access friction
          and geography, then open guides and variable tables on each record.
        </p>
      </header>

      {/* Popular themes — documentation landing pattern */}
      <section className="mb-8" aria-labelledby="popular-themes">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles
            className="size-3.5 text-accent-foreground"
            aria-hidden
          />
          <h2
            id="popular-themes"
            className="text-[11px] font-semibold tracking-[0.16em] text-accent-foreground uppercase"
          >
            Popular themes
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_THEMES.map((c) => (
            <Link
              key={c.id}
              href={`/explore?cluster=${c.id}`}
              className="quick-chip"
            >
              <span
                className="size-2 shrink-0 rotate-45"
                style={{ backgroundColor: c.color }}
                aria-hidden
              />
              {c.shortName}
            </Link>
          ))}
          <Link href="/clusters" className="quick-chip text-muted-foreground">
            All themes →
          </Link>
        </div>
      </section>

      <DatasetFilters />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <p
          className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
          aria-live="polite"
        >
          Showing{" "}
          <span className="tabular-nums text-foreground">{results.length}</span>{" "}
          of <span className="tabular-nums">{datasets.length}</span> datasets
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/explore?source=government" className="quick-chip !min-h-9 text-xs">
            Government
          </Link>
          <Link href="/explore?source=academic" className="quick-chip !min-h-9 text-xs">
            Academic
          </Link>
          <Link href="/explore?source=github" className="quick-chip !min-h-9 text-xs">
            GitHub
          </Link>
        </div>
      </div>

      <div className="mt-5 grid-hairline sm:grid-cols-2">
        {results.map((d, i) => (
          <div key={d.slug} className="contents">
            <DatasetCard dataset={d} />
            {(i + 1) % 6 === 0 && i < results.length - 1 ? (
              <div className="bg-background sm:col-span-2">
                <InContentAd />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <Card className="mt-8 border-border bg-card text-center ring-1 ring-border">
          <CardHeader className="items-center">
            <SearchX
              className="size-8 text-accent-foreground/70"
              aria-hidden
            />
            <CardTitle className="font-display text-xl text-foreground">
              No datasets match these filters
            </CardTitle>
            <CardDescription className="mx-auto max-w-md text-base">
              Try clearing search or broadening access type, category, or source
              layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="lg">
              <Link href="/explore">Reset filters</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
