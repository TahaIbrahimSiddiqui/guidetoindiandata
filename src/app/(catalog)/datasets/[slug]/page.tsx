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
import { RelatedDatasets } from "@/components/RelatedDatasets";
import { InContentAd } from "@/components/ads/ContentWithAds";
import { getCluster } from "@/data/clusters";
import { datasets, getDatasetBySlug } from "@/data/datasets";
import { getWaveForDataset } from "@/data/series";
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
            Part of [[{seriesMeta.series.shortTitle}]] · {seriesMeta.wave.yearLabel}
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
        <h2 className="text-lg font-semibold text-white">
          Key variables / field preview
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {dataset.keyVariables.map((v) => (
            <li
              key={v}
              className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 font-mono text-xs text-cyan-100/90"
            >
              {v}
            </li>
          ))}
        </ul>
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

      <div className="mt-8 flex flex-wrap gap-3">
        {dataset.accessUrl && (
          <a
            href={dataset.accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Open access portal
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {dataset.docsUrl && (
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
