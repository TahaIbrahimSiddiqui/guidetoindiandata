import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { AccessBadge } from "@/components/AccessBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDatasetBySlug } from "@/data/datasets";
import type { DataSeries } from "@/types/dataset";

export function SeriesTimeline({ series }: { series: DataSeries }) {
  const waves = [...series.waves].sort((a, b) => a.yearStart - b.yearStart);

  return (
    <div className="space-y-12">
      {series.designRevisions.length > 0 && (
        <Card className="border-border bg-card ring-1 ring-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-accent-foreground uppercase">
              <GitBranch className="size-4" aria-hidden />
              When the design was revised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {series.designRevisions.map((rev) => (
                <li
                  key={rev.yearLabel}
                  className="border-l-2 border-primary pl-4"
                >
                  <p className="font-mono text-xs text-accent-foreground">
                    {rev.yearLabel}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {rev.summary}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="section-title">Years available in this catalog</h2>
        <p className="mt-1.5 text-sm text-obsidian-muted">
          Each year opens the wave/edition record (access, variables,
          limitations).
        </p>

        <ol className="relative ml-3 mt-8 space-y-0 border-l border-obsidian-border">
          {waves.map((wave) => {
            const ds = getDatasetBySlug(wave.datasetSlug);
            const yearKey = wave.yearLabel.split("(")[0].trim();
            const marksRevision = series.designRevisions.some(
              (r) =>
                r.yearLabel.includes(yearKey) ||
                (yearKey.length > 3 &&
                  r.yearLabel.includes(yearKey.slice(0, 7))),
            );

            return (
              <li
                key={wave.datasetSlug}
                className="relative pb-8 pl-8 last:pb-0"
              >
                <span
                  className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                    wave.isLatest
                      ? "bg-obsidian-purple-bright shadow-[0_0_12px_rgba(196,165,116,0.55)]"
                      : "bg-obsidian-muted/70"
                  }`}
                  aria-hidden
                />
                <div className="rounded-xl border border-obsidian-border bg-obsidian-panel/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C4A574]/40 hover:bg-[#1a1a1a]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-semibold text-obsidian-purple-bright">
                        {wave.yearLabel}
                        {wave.isLatest && (
                          <span className="ml-2 rounded-md bg-obsidian-purple/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-obsidian-purple-bright">
                            Latest
                          </span>
                        )}
                        {marksRevision && (
                          <span className="ml-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
                            Design shift
                          </span>
                        )}
                      </p>
                      <h3 className="mt-1.5 text-base font-medium text-obsidian-text">
                        {ds?.title ?? wave.datasetSlug}
                      </h3>
                      {(wave.designNote || ds?.bestFor) && (
                        <p className="mt-2 text-sm leading-relaxed text-obsidian-muted">
                          {wave.designNote ?? ds?.bestFor}
                        </p>
                      )}
                      {ds && (
                        <div className="mt-3">
                          <AccessBadge accessType={ds.accessType} />
                        </div>
                      )}
                    </div>
                    <Button asChild size="sm" className="h-10 shrink-0">
                      <Link href={`/datasets/${wave.datasetSlug}`}>
                        Open year
                        <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
