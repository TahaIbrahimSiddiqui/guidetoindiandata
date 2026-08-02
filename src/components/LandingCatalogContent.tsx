import Link from "next/link";
import {
  ArrowUpRight,
  Database,
  GitBranch,
  GraduationCap,
  Layers3,
  Search,
  ShieldCheck,
} from "lucide-react";
import { datasets } from "@/data/datasets";
import { domainClusters, getThemesForDataset } from "@/lib/graphData";

const featuredSlugs = [
  "nfhs-5",
  "plfs-annual-2023-24",
  "census-pca-2011",
  "udise-plus",
  "asi-2023-24",
  "srs-statistical-reports",
];

const featuredDatasets = featuredSlugs.flatMap((slug) => {
  const dataset = datasets.find((candidate) => candidate.slug === slug);
  return dataset ? [dataset] : [];
});

const themeCounts = new Map(domainClusters.map((cluster) => [cluster.id, 0]));
for (const dataset of datasets) {
  for (const themeId of getThemesForDataset(dataset.slug)) {
    if (themeCounts.has(themeId)) {
      themeCounts.set(themeId, (themeCounts.get(themeId) ?? 0) + 1);
    }
  }
}

const entryPoints = [
  {
    href: "/explore",
    icon: Search,
    label: "Search the full catalog",
    detail: `${datasets.length} records with access, geography, time, variables, and limitations.`,
  },
  {
    href: "/clusters",
    icon: Layers3,
    label: "Browse research themes",
    detail: `${domainClusters.length} subject areas from labour and health to public finance and climate.`,
  },
  {
    href: "/series",
    icon: GitBranch,
    label: "Compare survey series",
    detail: "Follow changing rounds, coverage, and designs across major Indian data systems.",
  },
  {
    href: "/academic",
    icon: GraduationCap,
    label: "Find research deposits",
    detail: "Academic repositories, replication packages, and maintained community sources.",
  },
];

export function LandingCatalogContent() {
  return (
    <>
      <section className="border-t border-white/[0.08] bg-[#0a0a0a] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1400px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
            Start with the evidence
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-end">
            <h2 className="font-display max-w-xl text-2xl font-semibold text-[#F3E4C9] sm:text-3xl">
              A research catalog, not just a collection of links
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-[#D3D4C0] sm:text-base">
              Each record adds editorial guidance to the source material: what
              the data measure, where and when they apply, how access works,
              what they are best used for, and which limitations matter before
              analysis begins.
            </p>
          </div>

          <div className="mt-10 grid border-y border-white/[0.1] sm:grid-cols-2 lg:grid-cols-4">
            {entryPoints.map((entry) => {
              const Icon = entry.icon;
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="group border-b border-white/[0.08] px-5 py-6 transition-colors hover:bg-white/[0.035] sm:nth-[odd]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <span className="flex size-9 items-center justify-center border border-[#C4A574]/25 text-[#C4A574]">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="font-display mt-5 flex items-center justify-between gap-3 text-lg font-semibold text-[#F3E4C9]">
                    {entry.label}
                    <ArrowUpRight
                      className="size-4 shrink-0 text-[#C4A574] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-[#C8C9BC]">
                    {entry.detail}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-black px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
                Editor&apos;s starting shelf
              </p>
              <h2 className="font-display mt-3 text-2xl font-semibold text-[#F3E4C9] sm:text-3xl">
                Widely used Indian data systems
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#D3D4C0]">
                These records illustrate the guide&apos;s range across household
                surveys, administrative reporting, education, industry, and
                population statistics.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C4A574] transition hover:text-[#F3E4C9]"
            >
              View all datasets
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-9 grid border-t border-white/[0.1] lg:grid-cols-2">
            {featuredDatasets.map((dataset) => (
              <Link
                key={dataset.slug}
                href={`/datasets/${dataset.slug}`}
                className="group border-b border-white/[0.1] py-6 transition-colors hover:bg-white/[0.025] lg:nth-[odd]:border-r lg:nth-[odd]:pr-8 lg:nth-[even]:pl-8"
              >
                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C4A574]">
                      {dataset.shortTitle} · {dataset.timeCoverage}
                    </span>
                    <span className="font-display mt-2 block text-xl font-semibold leading-snug text-[#F3E4C9]">
                      {dataset.title}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="mt-1 size-4 shrink-0 text-[#C4A574] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <span className="mt-3 block text-sm leading-relaxed text-[#C8C9BC]">
                  {dataset.summary}
                </span>
                <span className="mt-4 block text-xs leading-relaxed text-[#D3D4C0]/75">
                  <strong className="font-medium text-[#D3D4C0]">Best for:</strong>{" "}
                  {dataset.bestFor}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-[#080808] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
              Editorial method
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold text-[#F3E4C9] sm:text-3xl">
              Source facts, normalized with research judgment
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#D3D4C0]">
              The guide does not republish or disguise other people&apos;s work.
              It points to original hosts and adds a consistent research layer
              so datasets can be compared before a user commits time to access
              requests, documentation, or cleaning.
            </p>
            <Link
              href="/methodology"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C4A574] transition hover:text-[#F3E4C9]"
            >
              Read the methodology
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <ol className="grid border-t border-white/[0.1] sm:grid-cols-3">
            {[
              {
                icon: Database,
                number: "01",
                title: "Select",
                text: "Prioritize sources with clear research use, identifiable stewardship, and enough documentation to describe responsibly.",
              },
              {
                icon: Layers3,
                number: "02",
                title: "Normalize",
                text: "Record access, geography, period, formats, variables, use cases, and source type in a comparable structure.",
              },
              {
                icon: ShieldCheck,
                number: "03",
                title: "Qualify",
                text: "State limitations and access friction plainly, retain source attribution, and direct corrections to the maintainer.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.number}
                  className="border-b border-white/[0.1] px-5 py-6 sm:border-r sm:last:border-r-0"
                >
                  <span className="flex items-center justify-between text-[#C4A574]">
                    <Icon className="size-4" aria-hidden />
                    <span className="font-mono text-[10px]">{step.number}</span>
                  </span>
                  <span className="font-display mt-5 block text-lg font-semibold text-[#F3E4C9]">
                    {step.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-[#C8C9BC]">
                    {step.text}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-black px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
                Topic directory
              </p>
              <h2 className="font-display mt-3 text-2xl font-semibold text-[#F3E4C9]">
                Browse all {domainClusters.length} research themes
              </h2>
            </div>
            <Link
              href="/clusters"
              className="inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C4A574] transition hover:text-[#F3E4C9]"
            >
              Open theme guide
            </Link>
          </div>
          <div className="mt-8 grid border-t border-white/[0.1] sm:grid-cols-2 lg:grid-cols-4">
            {domainClusters.map((cluster) => {
              const count = themeCounts.get(cluster.id) ?? 0;
              return (
                <Link
                  key={cluster.id}
                  href={`/explore?cluster=${cluster.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 border-b border-white/[0.08] px-3 text-sm text-[#D3D4C0] transition hover:bg-white/[0.03] hover:text-[#F3E4C9] sm:nth-[odd]:border-r lg:border-r lg:nth-[4n]:border-r-0"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="size-1.5 shrink-0 rotate-45"
                      style={{ backgroundColor: cluster.color }}
                      aria-hidden
                    />
                    <span>{cluster.name}</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#C4A574]">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
