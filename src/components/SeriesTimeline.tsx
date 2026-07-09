import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import type { DataSeries } from "@/types/dataset";
import { getDatasetBySlug } from "@/data/datasets";
import { AccessBadge } from "@/components/AccessBadge";

export function SeriesTimeline({ series }: { series: DataSeries }) {
  const waves = [...series.waves].sort((a, b) => a.yearStart - b.yearStart);

  return (
    <div className="space-y-10">
      {series.designRevisions.length > 0 && (
        <section className="rounded-xl border border-obsidian-border bg-obsidian-panel p-5">
          <div className="flex items-center gap-2 text-obsidian-purple-bright">
            <GitBranch className="h-4 w-4" aria-hidden />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              When the design was revised
            </h2>
          </div>
          <ul className="mt-4 space-y-3">
            {series.designRevisions.map((rev) => (
              <li
                key={rev.yearLabel}
                className="border-l-2 border-obsidian-purple pl-4"
              >
                <p className="font-mono text-xs text-obsidian-purple-bright">
                  {rev.yearLabel}
                </p>
                <p className="mt-1 text-sm text-obsidian-muted">{rev.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-obsidian-text">
          Years available in this catalog
        </h2>
        <p className="mt-1 text-sm text-obsidian-muted">
          Each year opens the wave/edition record (access, variables, limitations).
        </p>

        <ol className="relative mt-8 space-y-0 border-l border-obsidian-border ml-3">
          {waves.map((wave) => {
            const ds = getDatasetBySlug(wave.datasetSlug);
            const yearKey = wave.yearLabel.split("(")[0].trim();
            const marksRevision = series.designRevisions.some(
              (r) =>
                r.yearLabel.includes(yearKey) ||
                (yearKey.length > 3 && r.yearLabel.includes(yearKey.slice(0, 7)))
            );

            return (
              <li key={wave.datasetSlug} className="relative pb-8 pl-8 last:pb-0">
                <span
                  className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                    wave.isLatest
                      ? "bg-obsidian-purple-bright shadow-[0_0_12px_rgba(167,139,250,0.8)]"
                      : "bg-obsidian-muted"
                  }`}
                  aria-hidden
                />
                <div className="rounded-xl border border-obsidian-border bg-obsidian-panel/80 p-4 transition hover:border-obsidian-purple/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
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
                      <h3 className="mt-1 text-base font-medium text-obsidian-text">
                        {ds?.title ?? wave.datasetSlug}
                      </h3>
                      {(wave.designNote || ds?.bestFor) && (
                        <p className="mt-2 text-sm text-obsidian-muted">
                          {wave.designNote ?? ds?.bestFor}
                        </p>
                      )}
                      {ds && (
                        <div className="mt-3">
                          <AccessBadge accessType={ds.accessType} />
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/datasets/${wave.datasetSlug}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-obsidian-purple px-3 py-2 text-sm font-medium text-white transition hover:bg-obsidian-purple-bright hover:text-obsidian-bg"
                    >
                      Open year
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
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
