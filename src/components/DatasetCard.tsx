import Link from "next/link";
import { ArrowUpRight, Building2, CalendarDays, MapPin } from "lucide-react";
import { AccessBadge } from "@/components/AccessBadge";
import { AcademicBadgeList } from "@/components/AcademicBadge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCluster } from "@/data/clusters";
import { getWaveForDataset } from "@/data/series";
import type { Dataset } from "@/types/dataset";

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  const meta = getWaveForDataset(dataset.slug);
  const isAcademic = dataset.sourceKind && dataset.sourceKind !== "government";
  const vars = dataset.keyVariables.slice(0, 3);
  const cluster = getCluster(dataset.cluster);
  const geography = dataset.geographyLevel.slice(0, 2).join(", ");

  return (
    <Link
      href={`/datasets/${dataset.slug}`}
      className="group pressable block h-full"
    >
      <Card className="h-full overflow-hidden rounded-md border-border bg-card/88 py-0 ring-1 ring-border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:border-ring/45 group-hover:bg-secondary/35 group-hover:shadow-[0_16px_44px_rgba(0,0,0,0.22)] group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardHeader className="relative gap-0 border-b border-border/60 px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ring/0 to-transparent transition-all duration-500 group-hover:via-ring/50"
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
                  {meta
                    ? `${meta.series.shortTitle} · ${meta.wave.yearLabel}`
                    : isAcademic
                      ? dataset.sourceKind === "github-community"
                        ? "GitHub / Community"
                        : "Academic / Dataverse"
                      : dataset.shortTitle}
                </p>
                {cluster && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                      aria-hidden
                    />
                    {cluster.shortName}
                  </span>
                )}
              </div>
              <CardTitle className="font-display mt-3 text-xl font-semibold leading-tight tracking-tight text-card-foreground transition-colors duration-300 group-hover:text-white">
                {dataset.title}
              </CardTitle>
            </div>
            <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground/50 transition-all duration-300 group-hover:border-ring/40 group-hover:text-foreground">
              <ArrowUpRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </span>
          </div>
          <CardDescription className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {dataset.summary}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-5 pt-4 sm:px-6">
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0 text-accent-foreground/75" />
              <span className="truncate">{dataset.institution}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-accent-foreground/75" />
              <span className="truncate">{geography}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0 text-accent-foreground/75" />
              <span className="truncate">{dataset.timeCoverage}</span>
            </span>
          </div>

          {vars.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {vars.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="max-w-[10rem] truncate border-border bg-background/35 font-normal text-muted-foreground"
                >
                  {v}
                </Badge>
              ))}
              {dataset.keyVariables.length > 3 && (
                <Badge
                  variant="outline"
                  className="border-border font-normal text-muted-foreground/60"
                >
                  +{dataset.keyVariables.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="mt-auto flex flex-wrap items-center gap-2 border-t border-border bg-background/16 px-5 py-4 sm:px-6">
          <AccessBadge accessType={dataset.accessType} />
          <AcademicBadgeList badges={dataset.academicBadges} />
          <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-muted-foreground/55">
            {dataset.sizeTier}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
