import Link from "next/link";
import { InContentAd } from "@/components/ads/ContentWithAds";
import {
  FAMILY_LABELS,
  seriesByFamily,
  seriesList,
} from "@/data/series";
import type { DataSeries } from "@/types/dataset";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Series",
  description:
    "Multi-year data series: NFHS waves, NSS/NSO surveys (PLFS, HCES, …), DLHS, and more—browse by year of availability.",
};

const familyOrder: DataSeries["family"][] = ["nfhs", "nss", "dlhs", "other"];

export default function SeriesIndexPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-obsidian-text">Series</h1>
        <p className="mt-2 max-w-2xl text-obsidian-muted">
          Survey families with multiple years. Open a series for the timeline of
          available years and design revisions—e.g. one NFHS page, separate pages
          for each NSS product.
        </p>
      </header>

      {familyOrder.map((family, fi) => {
        const items = seriesByFamily(family);
        if (!items.length) return null;
        return (
          <section key={family} className="mb-10">
            {fi === 1 && <InContentAd />}
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-obsidian-purple-bright">
              {FAMILY_LABELS[family]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((s) => (
                <Link
                  key={s.slug}
                  href={`/series/${s.slug}`}
                  className="note-card block p-4 transition hover:border-obsidian-purple/50"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-obsidian-text">
                      {s.shortTitle}
                    </h3>
                    <span className="font-mono text-xs text-obsidian-muted">
                      {s.waves.length} year
                      {s.waves.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-obsidian-muted line-clamp-2">
                    {s.title}
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-obsidian-purple-bright">
                    {s.waves
                      .map((w) => w.yearLabel)
                      .slice(0, 4)
                      .join(" · ")}
                    {s.waves.length > 4 ? " · …" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <p className="text-sm text-obsidian-muted">
        {seriesList.length} series hubs · wave detail still lives under Datasets
      </p>
    </div>
  );
}
