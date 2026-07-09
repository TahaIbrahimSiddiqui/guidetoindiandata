import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
import { getWaveForDataset } from "@/data/series";
import type { Dataset } from "@/types/dataset";

export function DatasetCard({ dataset }: { dataset: Dataset }) {
  const meta = getWaveForDataset(dataset.slug);
  const isAcademic = dataset.sourceKind && dataset.sourceKind !== "government";
  const vars = dataset.keyVariables.slice(0, 3);

  return (
    <Link href={`/datasets/${dataset.slug}`} className="group block h-full">
      <Card className="h-full rounded-none bg-card py-0 ring-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:bg-secondary/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardHeader className="relative gap-0 border-b border-border/60 px-6 pt-6 pb-0">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ring/0 to-transparent transition-all duration-500 group-hover:via-ring/50"
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
                {meta
                  ? `${meta.series.shortTitle} · ${meta.wave.yearLabel}`
                  : isAcademic
                    ? dataset.sourceKind === "github-community"
                      ? "GitHub / Community"
                      : "Academic / Dataverse"
                    : dataset.shortTitle}
              </p>
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
          <CardDescription className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {dataset.bestFor}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pt-4">
          {vars.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {vars.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="max-w-[10rem] truncate border-border font-normal text-muted-foreground"
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

        <CardFooter className="mt-auto flex flex-wrap items-center gap-2 border-t border-border bg-transparent px-6 py-4">
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
