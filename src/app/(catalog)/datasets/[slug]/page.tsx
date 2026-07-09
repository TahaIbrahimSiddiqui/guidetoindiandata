import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { AccessBadge } from "@/components/AccessBadge";
import { AcademicBadgeList } from "@/components/AcademicBadge";
import { RelatedDatasets } from "@/components/RelatedDatasets";
import { InContentAd } from "@/components/ads/ContentWithAds";
import { getCluster } from "@/data/clusters";
import { datasets, getDatasetBySlug } from "@/data/datasets";
import { getWaveForDataset } from "@/data/series";
import { resolveVariables } from "@/lib/variables";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return datasets.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = getDatasetBySlug(slug);
  if (!d) return { title: "Dataset" };
  return {
    title: d.shortTitle,
    description: d.bestFor,
  };
}

export default async function DatasetPage({ params }: Props) {
  const { slug } = await params;
  const dataset = getDatasetBySlug(slug);
  if (!dataset) notFound();

  const cluster = getCluster(dataset.cluster);
  const seriesMeta = getWaveForDataset(dataset.slug);
  const variableInfo = resolveVariables(dataset);

  return (
    <article>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-obsidian-muted">
        <Link href="/explore" className="hover:text-obsidian-purple-bright">
          Explore
        </Link>
        <span aria-hidden>/</span>
        {seriesMeta ? (
          <>
            <Link
              href={`/series/${seriesMeta.series.slug}`}
              className="hover:text-obsidian-purple-bright"
            >
              {seriesMeta.series.shortTitle}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-mono text-obsidian-purple-bright">
              {seriesMeta.wave.yearLabel}
            </span>
          </>
        ) : (
          cluster && (
            <>
              <Link
                href={`/explore?cluster=${cluster.id}`}
                className="hover:text-obsidian-purple-bright"
              >
                {cluster.shortName}
              </Link>
              <span aria-hidden>/</span>
              <span className="text-obsidian-text">{dataset.shortTitle}</span>
            </>
          )
        )}
      </div>

      <header className="border-b border-obsidian-border pb-8">
        {seriesMeta && (
          <Link
            href={`/series/${seriesMeta.series.slug}`}
            className="mb-3 inline-flex rounded-md border border-obsidian-purple/30 bg-obsidian-purple/10 px-2.5 py-1 font-mono text-xs text-obsidian-purple-bright hover:border-obsidian-purple"
          >
            Part of {seriesMeta.series.shortTitle} · {seriesMeta.wave.yearLabel}
          </Link>
        )}
        <p className="font-mono text-xs uppercase tracking-wider text-obsidian-muted">
          {dataset.abbreviations.join(" · ")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-obsidian-text sm:text-4xl">
          {dataset.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <AccessBadge accessType={dataset.accessType} />
          <AcademicBadgeList badges={dataset.academicBadges} />
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-300">
            {dataset.sizeTier}
          </span>
          {dataset.flags?.includes("good-starting") && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">
              Good starting dataset
            </span>
          )}
          {dataset.flags?.includes("best-district") && (
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300">
              Strong district source
            </span>
          )}
        </div>
        {(dataset.authors || dataset.publicationYear) && (
          <p className="mt-3 text-sm text-obsidian-muted">
            {dataset.authors}
            {dataset.authors && dataset.publicationYear ? " · " : ""}
            {dataset.publicationYear}
            {dataset.repository ? ` · ${dataset.repository}` : ""}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {dataset.categories.map((c) => (
            <Link
              key={c}
              href={`/explore?category=${encodeURIComponent(c)}`}
              className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              {c}
            </Link>
          ))}
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Meta
          icon={<Building2 className="h-4 w-4" />}
          label="Host / institution"
          value={`${dataset.host} · ${dataset.institution}`}
        />
        <Meta
          icon={<MapPin className="h-4 w-4" />}
          label="Geography"
          value={dataset.geographyLevel.join(", ")}
        />
        <Meta
          icon={<Calendar className="h-4 w-4" />}
          label="Time coverage"
          value={dataset.timeCoverage}
        />
        <Meta
          icon={<RefreshCw className="h-4 w-4" />}
          label="Update frequency"
          value={dataset.updateFrequency}
        />
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            What this is best for
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            {dataset.bestFor}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
            Main limitations
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            {dataset.limitations}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-obsidian-text">
              Variables
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-obsidian-muted">
              {variableInfo.source}. Verify the full dictionary on the official
              site.
            </p>
          </div>
          {variableInfo.url && (
            <a
              href={variableInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian-border px-3 py-1.5 text-xs text-obsidian-purple-bright hover:border-obsidian-purple"
            >
              Open official docs
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-obsidian-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-obsidian-panel text-xs uppercase tracking-wide text-obsidian-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Name / code</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">
                  Group
                </th>
              </tr>
            </thead>
            <tbody>
              {variableInfo.entries.map((v) => (
                <tr
                  key={`${v.name}-${v.label}`}
                  className="border-t border-obsidian-border/80"
                >
                  <td className="px-3 py-2 font-mono text-xs text-obsidian-purple-bright">
                    {v.name}
                  </td>
                  <td className="px-3 py-2 text-obsidian-text">{v.label}</td>
                  <td className="hidden px-3 py-2 text-obsidian-muted sm:table-cell">
                    {v.group ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InContentAd />

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Formats</h2>
          <p className="mt-1 text-sm text-slate-400">
            {dataset.formats.join(" · ")}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Technical tags</h2>
          <p className="mt-1 text-sm text-slate-400">
            {dataset.technicalTags.join(" · ")}
          </p>
        </div>
        <div className="sm:col-span-2">
          <h2 className="text-sm font-semibold text-white">Example uses</h2>
          <p className="mt-1 text-sm text-slate-400">{dataset.exampleUses}</p>
        </div>
      </section>

      {(dataset.dataDoi || dataset.paperDoi || dataset.recommendedCitation) && (
        <section className="mt-8 rounded-xl border border-obsidian-border bg-obsidian-panel/60 p-5">
          <h2 className="text-sm font-semibold text-obsidian-text">
            Academic identifiers
          </h2>
          <div className="mt-3 space-y-2 text-sm text-obsidian-muted">
            {dataset.dataDoi && (
              <p>
                <span className="text-obsidian-text">Data DOI:</span>{" "}
                <a
                  href={`https://doi.org/${dataset.dataDoi}`}
                  className="font-mono text-obsidian-purple-bright hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dataset.dataDoi}
                </a>
              </p>
            )}
            {dataset.paperDoi && (
              <p>
                <span className="text-obsidian-text">Paper DOI:</span>{" "}
                <a
                  href={`https://doi.org/${dataset.paperDoi}`}
                  className="font-mono text-obsidian-purple-bright hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dataset.paperDoi}
                </a>
              </p>
            )}
            {dataset.recommendedCitation && (
              <p className="border-t border-obsidian-border pt-2 text-xs leading-relaxed">
                {dataset.recommendedCitation}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {dataset.accessUrl && (
          <a
            href={dataset.accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-obsidian-purple px-4 py-2.5 text-sm font-semibold text-white hover:bg-obsidian-purple-bright hover:text-obsidian-bg"
          >
            {dataset.dataDoi ? "Open data DOI" : "Open access portal"}
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {dataset.paperDoi && (
          <a
            href={`https://doi.org/${dataset.paperDoi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-obsidian-border px-4 py-2.5 text-sm text-obsidian-text hover:border-obsidian-purple/50"
          >
            Open paper
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {dataset.docsUrl && !dataset.paperDoi && (
          <a
            href={dataset.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white hover:bg-white/5"
          >
            Documentation
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {!dataset.accessUrl && (
          <p className="text-sm text-slate-500">
            Access via {dataset.host} — search the official portal for current
            download or request paths.
          </p>
        )}
      </div>

      <RelatedDatasets dataset={dataset} />
    </article>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  );
}
