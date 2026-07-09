import Link from "next/link";
import { InContentAd } from "@/components/ads/ContentWithAds";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "How the Indian Data Guide is structured, what the badges mean, and how to use related datasets.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-10">
        <p className="page-kicker">Guide</p>
        <h1 className="page-title">About this guide</h1>
        <p className="page-lede">
          The Indian Data Guide is a public-facing catalog built from independent
          research on India&apos;s statistical and administrative data ecosystem.
          The goal is not another flat link list—it is a{" "}
          <strong className="font-medium text-foreground">
            dataset record system
          </strong>{" "}
          with comparable metadata, honest access labels, usage guides, and
          live-sourced variable tables.
        </p>
      </header>

      <section className="surface p-6 sm:p-8">
        <h2 className="section-title">What each record includes</h2>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#D3D4C0]/95">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C4A574]" />
            Access type badges (open, dashboard, registration, DUA, paid…)
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C4A574]" />
            Geography and time coverage
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C4A574]" />
            Guides for using the data (official portals, user guides, codebooks,
            tutorials)
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C4A574]" />
            Variable lists scraped from public documentation
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C4A574]" />
            Editorial fields: best for, limitations, and pairs well with
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C4A574]" />
            Size tier and technical tags (microdata, dashboard, raster…)
          </li>
        </ul>
      </section>

      <InContentAd />

      <section className="mt-10">
        <h2 className="section-title">How to use it</h2>
        <ol className="mt-5 space-y-4">
          {[
            <>
              Start from the{" "}
              <Link href="/" className="text-[#C4A574] link-underline">
                neural ecosystem map
              </Link>{" "}
              or a theme.
            </>,
            <>
              Narrow in{" "}
              <Link href="/explore" className="text-[#C4A574] link-underline">
                Explore
              </Link>{" "}
              by access friction and geography before diving into a portal.
            </>,
            <>
              On a dataset page, open the usage guides and variable table, then
              check limitations and pairs-well-with for triangulation (e.g. NFHS
              + HMIS + SRS).
            </>,
          ].map((item, i) => (
            <li key={i} className="flex gap-4 text-sm leading-relaxed text-[#D3D4C0]">
              <span className="font-mono text-xs text-[#C4A574]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="surface mt-10 p-6 sm:p-8">
        <h2 className="section-title">Caveats</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#D3D4C0]/95">
          Government resources are often excellent in substance but inconsistent
          in packaging. Publicly viewable dashboards are not always clean
          downloadable files or fully documented APIs. This site distinguishes
          those regimes deliberately. Links point to known host portals; always
          verify current access rules on the official source.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="section-title">Source research</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#D3D4C0]/95">
          Catalog content is derived from the project research report (
          <code className="rounded-md border border-obsidian-border bg-obsidian-panel px-1.5 py-0.5 font-mono text-xs text-[#C4A574]">
            content/guide_research.md
          </code>
          ). It is not an official product of MoSPI, Census, or any ministry.
        </p>
      </section>

      <p className="mt-10 text-sm text-[#D3D4C0]/55">
        Advertising appears on catalog pages only. See{" "}
        <Link href="/privacy" className="text-[#C4A574] link-underline">
          Privacy & advertising
        </Link>
        .
      </p>
    </div>
  );
}
