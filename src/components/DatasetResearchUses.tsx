import { BookOpen, ExternalLink, Newspaper } from "lucide-react";
import { getDatasetUses } from "@/lib/datasetUses";
import type { ResolvedDatasetUse } from "@/types/researchUse";

const kindLabels = {
  "journal-article": "Journal article",
  "conference-paper": "Conference paper",
  "working-paper": "Working paper",
  report: "Report",
  thesis: "Thesis",
  blog: "Blog / explainer",
} as const;

const relationshipLabels = {
  introduces: "Introduces data",
  analyzes: "Analyzes data",
  reuses: "Reuses data",
  visualizes: "Visualizes data",
} as const;

function formatDate(value: string | null): string {
  if (!value) return "Not checked yet";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function WorkList({ items }: { items: ResolvedDatasetUse[] }) {
  return (
    <ul className="divide-y divide-obsidian-border border-y border-obsidian-border">
      {items.map((item) => {
        const metadata = [
          item.work.authors.slice(0, 3).join(", "),
          item.work.authors.length > 3 ? "et al." : "",
          item.work.publisher,
          item.work.year?.toString(),
        ].filter(Boolean);

        return (
          <li key={`${item.workId}-${item.relationship}`} className="py-4 sm:py-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">
              <span className="rounded-sm border border-obsidian-border bg-obsidian-panel px-2 py-1 text-obsidian-muted">
                {kindLabels[item.work.kind]}
              </span>
              <span className="text-[#C4A574]">
                {relationshipLabels[item.relationship]}
              </span>
            </div>
            <a
              href={item.work.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-2 inline-flex max-w-3xl items-start gap-2 text-base font-medium leading-snug text-obsidian-text transition-colors hover:text-obsidian-purple-bright sm:text-lg"
            >
              <span>{item.work.title}</span>
              <ExternalLink
                className="mt-1 h-4 w-4 shrink-0 text-obsidian-muted transition-colors group-hover:text-obsidian-purple-bright"
                aria-hidden
              />
            </a>
            {metadata.length > 0 && (
              <p className="mt-1.5 text-xs leading-relaxed text-obsidian-muted">
                {metadata.join(" · ")}
              </p>
            )}
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/90">
              {item.useSummary}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function DatasetResearchUses({ datasetSlug }: { datasetSlug: string }) {
  const uses = getDatasetUses(datasetSlug);
  const total = uses.scholarly.length + uses.web.length;

  return (
    <section id="research-uses" className="mt-12 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-obsidian-border pb-4">
        <div>
          <h2 className="section-title flex items-center gap-2.5">
            <BookOpen
              className="h-5 w-5 text-obsidian-purple-bright"
              aria-hidden
            />
            Research and articles using this data
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-obsidian-muted">
            Verified examples that analyze, reuse, introduce, or visualize this
            dataset. Search matches without evidence are not published here.
          </p>
        </div>
        {total > 0 && (
          <span className="chip tabular-nums">
            {total} verified source{total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {total === 0 ? (
        <div className="border-b border-obsidian-border py-7">
          <p className="text-sm font-medium text-obsidian-text">
            No verified uses found yet.
          </p>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-obsidian-muted">
            This does not mean the dataset has never been used. It means no source
            has passed the evidence check for this page yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8 pt-6">
          {uses.scholarly.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-obsidian-text">
                <BookOpen className="h-4 w-4 text-[#C4A574]" aria-hidden />
                Scholarly works
                <span className="font-mono text-xs font-normal text-obsidian-muted">
                  {uses.scholarly.length}
                </span>
              </h3>
              <WorkList items={uses.scholarly} />
            </div>
          )}
          {uses.web.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-obsidian-text">
                <Newspaper className="h-4 w-4 text-[#9EC9EF]" aria-hidden />
                Blogs and explainers
                <span className="font-mono text-xs font-normal text-obsidian-muted">
                  {uses.web.length}
                </span>
              </h3>
              <WorkList items={uses.web} />
            </div>
          )}
        </div>
      )}

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-obsidian-muted">
        <div className="flex gap-1.5">
          <dt>Scholarly checked:</dt>
          <dd className="text-obsidian-text">
            {formatDate(uses.scholarlyCheckedAt)}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Web checked:</dt>
          <dd className="text-obsidian-text">{formatDate(uses.webCheckedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}
