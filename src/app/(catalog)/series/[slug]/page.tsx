import Link from "next/link";
import { notFound } from "next/navigation";
import { SeriesTimeline } from "@/components/SeriesTimeline";
import { FAMILY_LABELS, getSeriesBySlug, seriesList } from "@/data/series";
import {
  breadcrumbJsonLd,
  serializeJsonLd,
  seriesJsonLd,
} from "@/lib/seo/jsonLd";
import { buildPageMetadata, clampDescription } from "@/lib/seo/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return seriesList.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSeriesBySlug(slug);
  if (!s) return { title: "Series" };
  return buildPageMetadata({
    title: `${s.shortTitle} series India`,
    description: clampDescription(s.description),
    path: `/series/${s.slug}`,
  });
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  const years = [...series.waves]
    .sort((a, b) => a.yearStart - b.yearStart)
    .map((w) => w.yearLabel);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(seriesJsonLd(series)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            breadcrumbJsonLd([
              { name: "Map", path: "/map" },
              { name: "Series", path: "/series" },
              { name: series.shortTitle, path: `/series/${series.slug}` },
            ]),
          ),
        }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center gap-2 text-sm text-obsidian-muted"
      >
        <Link
          href="/map"
          className="transition-colors hover:text-obsidian-purple-bright"
        >
          Map
        </Link>
        <span aria-hidden className="text-obsidian-muted/50">
          /
        </span>
        <span className="text-obsidian-text">{series.shortTitle}</span>
      </nav>
      <div className="mb-6">
        <Link
          href="/map"
          className="inline-flex min-h-11 items-center text-xs font-medium uppercase tracking-[0.14em] text-[#C4A574] transition hover:text-[#F3E4C9]"
        >
          ← Back to solar map
        </Link>
      </div>

      <header className="border-b border-obsidian-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-obsidian-purple-bright">
          {FAMILY_LABELS[series.family]}
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-obsidian-text sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {series.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-obsidian-muted">
          {series.description}
        </p>
        <p className="mt-4 text-sm text-obsidian-muted">
          <span className="text-obsidian-text">Host:</span> {series.host}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {years.map((y) => (
            <span key={y} className="chip-accent font-mono">
              {y}
            </span>
          ))}
        </div>
        {series.pairsWithSeries && series.pairsWithSeries.length > 0 && (
          <p className="mt-5 text-sm text-obsidian-muted">
            Related series:{" "}
            {series.pairsWithSeries.map((ps, i) => (
              <span key={ps}>
                {i > 0 && ", "}
                <Link
                  href={`/series/${ps}`}
                  className="text-obsidian-purple-bright link-underline"
                >
                  {getSeriesBySlug(ps)?.shortTitle ?? ps}
                </Link>
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="mt-10">
        <SeriesTimeline series={series} />
      </div>
    </article>
  );
}
