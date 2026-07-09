import Link from "next/link";
import { notFound } from "next/navigation";
import { SeriesTimeline } from "@/components/SeriesTimeline";
import { FAMILY_LABELS, getSeriesBySlug, seriesList } from "@/data/series";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return seriesList.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSeriesBySlug(slug);
  if (!s) return { title: "Series" };
  return {
    title: s.shortTitle,
    description: s.description,
  };
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
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-obsidian-muted">
        <Link href="/series" className="hover:text-obsidian-purple-bright">
          Series
        </Link>
        <span aria-hidden>/</span>
        <span className="text-obsidian-text">{series.shortTitle}</span>
      </div>

      <header className="border-b border-obsidian-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-obsidian-purple-bright">
          {FAMILY_LABELS[series.family]}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-obsidian-text sm:text-4xl">
          {series.title}
        </h1>
        <p className="mt-3 max-w-3xl text-obsidian-muted leading-relaxed">
          {series.description}
        </p>
        <p className="mt-4 text-sm text-obsidian-muted">
          <span className="text-obsidian-text">Host:</span> {series.host}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {years.map((y) => (
            <span
              key={y}
              className="rounded-md border border-obsidian-border bg-obsidian-panel px-2.5 py-1 font-mono text-xs text-obsidian-purple-bright"
            >
              {y}
            </span>
          ))}
        </div>
        {series.pairsWithSeries && series.pairsWithSeries.length > 0 && (
          <p className="mt-4 text-sm text-obsidian-muted">
            Related series:{" "}
            {series.pairsWithSeries.map((ps, i) => (
              <span key={ps}>
                {i > 0 && ", "}
                <Link
                  href={`/series/${ps}`}
                  className="text-obsidian-purple-bright hover:underline"
                >
                  [[{getSeriesBySlug(ps)?.shortTitle ?? ps}]]
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
