import Link from "next/link";
import { ArrowRight, BookOpen, GitBranch, Network } from "lucide-react";
import { ObsidianGraphHero } from "@/components/ObsidianGraphHero";
import {
  FAMILY_LABELS,
  getPinnedSeries,
  seriesList,
} from "@/data/series";
import { datasets } from "@/data/datasets";
import { clusters } from "@/data/clusters";

export default function LandingPage() {
  const pinned = getPinnedSeries();
  const nssCount = seriesList.filter((s) => s.family === "nss").length;

  return (
    <div className="bg-vault">
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-obsidian-purple-bright">
            Vault · Indian data sources
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-obsidian-text sm:text-5xl">
            Indian Data{" "}
            <span className="text-obsidian-purple-bright">Guide</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-obsidian-muted sm:text-lg">
            An Obsidian-style map of surveys and portals. Open a{" "}
            <strong className="font-medium text-obsidian-text">series</strong>{" "}
            (NFHS, NSS PLFS, HCES…) to see every year available—and when the
            design was revised.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/series"
              className="inline-flex items-center gap-2 rounded-lg bg-obsidian-purple px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-obsidian-purple-bright hover:text-obsidian-bg"
            >
              Browse series
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/series/nfhs"
              className="inline-flex items-center gap-2 rounded-lg border border-obsidian-border bg-obsidian-panel px-5 py-2.5 text-sm text-obsidian-text transition hover:border-obsidian-purple/50"
            >
              Open [[NFHS]]
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-sm text-obsidian-muted hover:text-obsidian-text"
            >
              All waves
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <ObsidianGraphHero />
        </div>
      </section>

      <section className="border-y border-obsidian-border bg-obsidian-panel/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { label: "Series hubs", value: String(seriesList.length) },
            { label: "NSS products", value: String(nssCount) },
            { label: "Wave records", value: String(datasets.length) },
            { label: "Clusters", value: String(clusters.length) },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-semibold text-obsidian-text">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-obsidian-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-obsidian-purple-bright" />
          <h2 className="text-xl font-semibold text-obsidian-text">
            Pinned notes
          </h2>
        </div>
        <p className="mt-2 text-sm text-obsidian-muted">
          Start here—each note is a multi-year series with a year timeline.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {pinned.map((s) => (
            <Link
              key={s.slug}
              href={`/series/${s.slug}`}
              className="note-card group p-5 transition hover:border-obsidian-purple/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-obsidian-purple-bright">
                  {FAMILY_LABELS[s.family]}
                </span>
                <span className="font-mono text-xs text-obsidian-muted">
                  {s.waves.length} yrs
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-obsidian-text group-hover:text-obsidian-purple-bright">
                [[{s.shortTitle}]]
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-obsidian-muted">
                {s.description}
              </p>
              <p className="mt-3 font-mono text-[11px] text-obsidian-muted">
                {s.waves.map((w) => w.yearLabel).join(" → ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="note-card p-6">
            <div className="flex items-center gap-2 text-obsidian-purple-bright">
              <Network className="h-4 w-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                How to use
              </h2>
            </div>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-obsidian-muted">
              <li>
                Open a series (e.g.{" "}
                <Link
                  href="/series/nfhs"
                  className="text-obsidian-purple-bright hover:underline"
                >
                  NFHS
                </Link>
                ) for every year available.
              </li>
              <li>
                Read{" "}
                <strong className="text-obsidian-text">design revised</strong>{" "}
                notes when methodology or geography changed.
              </li>
              <li>Open a year to get access badges, variables, and limitations.</li>
            </ol>
          </div>
          <div className="note-card p-6">
            <div className="flex items-center gap-2 text-obsidian-purple-bright">
              <GitBranch className="h-4 w-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                NSS products
              </h2>
            </div>
            <p className="mt-3 text-sm text-obsidian-muted">
              Each NSO/NSS survey has its own page with years—not one flat list:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {seriesList
                .filter((s) => s.family === "nss")
                .map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/series/${s.slug}`}
                      className="inline-flex rounded-md border border-obsidian-border px-2.5 py-1 font-mono text-xs text-obsidian-purple-bright hover:border-obsidian-purple"
                    >
                      {s.shortTitle}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
