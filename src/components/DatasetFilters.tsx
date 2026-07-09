"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clusters } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import { ACCESS_LABELS } from "@/lib/access";
import { uniqueSorted } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { AccessType } from "@/types/dataset";

const selectClass =
  "field h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function DatasetFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const categories = useMemo(
    () => uniqueSorted(datasets.flatMap((d) => d.categories)),
    [],
  );
  const geographies = useMemo(
    () => uniqueSorted(datasets.flatMap((d) => d.geographyLevel)),
    [],
  );
  const frequencies = useMemo(
    () =>
      uniqueSorted(
        datasets.map((d) => d.updateFrequency.split(/[/,]/)[0].trim()),
      ).slice(0, 20),
    [],
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => {
        router.push(`/explore?${next.toString()}`);
      });
    },
    [params, router],
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push("/explore");
    });
  }, [router]);

  const activeCount = [
    "q",
    "source",
    "category",
    "accessType",
    "geography",
    "cluster",
    "frequency",
    "institution",
  ].filter((k) => params.get(k)).length;

  return (
    <Card
      className={cn(
        "border-border bg-card ring-1 ring-border transition-opacity duration-200",
        pending && "opacity-70",
      )}
      aria-busy={pending}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/60 pb-(--card-spacing)">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-foreground">
          Filters
        </CardTitle>
        {activeCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
            Clear {activeCount}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/50"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search title, variables, host…"
            defaultValue={params.get("q") ?? ""}
            onChange={(e) => setParam("q", e.target.value)}
            className="h-11 bg-background pl-10 text-sm md:text-sm"
            aria-label="Search datasets"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="filter-source"
              className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              Source layer
            </Label>
            <select
              id="filter-source"
              className={selectClass}
              value={params.get("source") ?? ""}
              onChange={(e) => setParam("source", e.target.value)}
            >
              <option value="">All</option>
              <option value="government">Government / national</option>
              <option value="academic">Academic / Dataverse</option>
              <option value="replication">Replication packages</option>
              <option value="github">GitHub & community</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="filter-category"
              className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              Category
            </Label>
            <select
              id="filter-category"
              className={selectClass}
              value={params.get("category") ?? ""}
              onChange={(e) => setParam("category", e.target.value)}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="filter-access"
              className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              Access type
            </Label>
            <select
              id="filter-access"
              className={selectClass}
              value={params.get("accessType") ?? ""}
              onChange={(e) => setParam("accessType", e.target.value)}
            >
              <option value="">All</option>
              {(Object.keys(ACCESS_LABELS) as AccessType[]).map((k) => (
                <option key={k} value={k}>
                  {ACCESS_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="filter-geography"
              className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              Geography
            </Label>
            <select
              id="filter-geography"
              className={selectClass}
              value={params.get("geography") ?? ""}
              onChange={(e) => setParam("geography", e.target.value)}
            >
              <option value="">All</option>
              {geographies.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="filter-cluster"
              className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              Cluster
            </Label>
            <select
              id="filter-cluster"
              className={selectClass}
              value={params.get("cluster") ?? ""}
              onChange={(e) => setParam("cluster", e.target.value)}
            >
              <option value="">All</option>
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="filter-frequency"
              className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              Update frequency
            </Label>
            <select
              id="filter-frequency"
              className={selectClass}
              value={params.get("frequency") ?? ""}
              onChange={(e) => setParam("frequency", e.target.value)}
            >
              <option value="">All</option>
              {frequencies.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label
              htmlFor="filter-institution"
              className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              Institution / host
            </Label>
            <Input
              id="filter-institution"
              className="h-10 bg-background"
              placeholder="e.g. MoSPI, NCRB, DHS"
              defaultValue={params.get("institution") ?? ""}
              onChange={(e) => setParam("institution", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
