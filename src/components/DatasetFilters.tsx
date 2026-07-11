"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { domainClusters } from "@/lib/graphData";
import { datasets } from "@/data/datasets";
import { ACCESS_LABELS } from "@/lib/access";
import { uniqueSorted } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { AccessType } from "@/types/dataset";

const selectClass =
  "h-11 w-full min-w-0 appearance-none rounded-md border border-input bg-background/80 px-3 py-2 text-base text-foreground outline-none transition-colors hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

export function DatasetFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const institutionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (institutionTimer.current) clearTimeout(institutionTimer.current);
    };
  }, []);

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

  const setParamDebounced = useCallback(
    (
      key: string,
      value: string,
      timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
      ms = 280,
    ) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setParam(key, value), ms);
    },
    [setParam],
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

  const filterFields = (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
          {domainClusters.map((c) => (
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
          className="h-11 bg-background text-base md:text-sm"
          placeholder="e.g. MoSPI, NCRB, DHS"
          defaultValue={params.get("institution") ?? ""}
          onChange={(e) =>
            setParamDebounced("institution", e.target.value, institutionTimer)
          }
        />
      </div>
    </div>
  );

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-md border-border bg-card/85 ring-1 ring-border transition-opacity duration-200",
        pending && "opacity-70",
      )}
      aria-busy={pending}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/60 text-accent-foreground">
            <SlidersHorizontal className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-foreground">
              Filters
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Begin with search, then narrow the catalog without losing context.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {activeCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="min-h-11 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
              Clear {activeCount}
            </Button>
          )}
          {/* Mobile: advanced filters in a sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11 md:hidden"
              >
                <SlidersHorizontal className="size-3.5" aria-hidden />
                More filters
                {activeCount > 0 ? ` (${activeCount})` : ""}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85dvh] overflow-y-auto rounded-t-2xl"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-left">
                  Narrow results
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {filterFields}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground/55"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search title, variables, host…"
            defaultValue={params.get("q") ?? ""}
            onChange={(e) =>
              setParamDebounced("q", e.target.value, searchTimer)
            }
            className="h-14 rounded-md bg-background/85 pl-12 text-base md:text-base"
            aria-label="Search datasets"
          />
        </div>

        {/* Desktop / tablet: full filter grid inline */}
        <div className="hidden md:block">{filterFields}</div>
      </CardContent>
    </Card>
  );
}
