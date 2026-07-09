"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
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
    [filters],
  );

  return (
    <div>
      <header className="mb-10 max-w-3xl">
        <p className="page-kicker">Catalog</p>
        <h1 className="page-title">Explore</h1>
        <p className="page-lede">
          Filter by access friction, geography, and source layer—not just topic
          labels. Every record includes guides and a variable table.
        </p>
      </header>

      <DatasetFilters />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Showing{" "}
          <span className="tabular-nums text-foreground">{results.length}</span>{" "}
          of <span className="tabular-nums">{datasets.length}</span> datasets
        </p>
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
            <CardDescription className="mx-auto max-w-md">
              Try clearing search or broadening access type, category, or source
              layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/explore">Reset filters</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
