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
    <div className="prose-invert max-w-3xl">
      <h1 className="text-3xl font-semibold text-white">About this guide</h1>
      <p className="mt-4 text-slate-400 leading-relaxed">
        The Indian Data Guide is a public-facing catalog built from independent
        research on India&apos;s statistical and administrative data ecosystem.
        The goal is not another flat link list—it is a{" "}
        <strong className="font-medium text-slate-200">
          dataset record system
        </strong>{" "}
        with comparable metadata, honest access labels, and relationship links.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-white">
        What each record includes
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
        <li>Access type badges (open, dashboard, registration, DUA, paid…)</li>
        <li>Geography and time coverage</li>
        <li>Key variables field preview</li>
        <li>
          Editorial fields: best for, limitations, and pairs well with
        </li>
        <li>Size tier and technical tags (microdata, dashboard, raster…)</li>
      </ul>

      <InContentAd />

      <h2 className="mt-10 text-xl font-semibold text-white">How to use it</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-400">
        <li>
          Start from the{" "}
          <Link href="/" className="text-cyan-300 hover:underline">
            neural ecosystem map
          </Link>{" "}
          or a cluster.
        </li>
        <li>
          Narrow in{" "}
          <Link href="/explore" className="text-cyan-300 hover:underline">
            Explore
          </Link>{" "}
          by access friction and geography before diving into a portal.
        </li>
        <li>
          On a dataset page, check limitations and follow pairs-well-with for
          triangulation (e.g. NFHS + HMIS + SRS).
        </li>
      </ol>

      <h2 className="mt-10 text-xl font-semibold text-white">Caveats</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        Government resources are often excellent in substance but inconsistent in
        packaging. Publicly viewable dashboards are not always clean downloadable
        files or fully documented APIs. This site distinguishes those regimes
        deliberately. Links point to known host portals; always verify current
        access rules on the official source.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-white">Source research</h2>
      <p className="mt-3 text-sm text-slate-400">
        Catalog content is derived from the project research report (
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-cyan-100">
          content/guide_research.md
        </code>
        ). It is not an official product of MoSPI, Census, or any ministry.
      </p>

      <p className="mt-8 text-sm text-slate-500">
        Advertising appears on catalog pages only. See{" "}
        <Link href="/privacy" className="text-cyan-300 hover:underline">
          Privacy & advertising
        </Link>
        .
      </p>
    </div>
  );
}
