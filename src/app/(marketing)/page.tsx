import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Filter,
  Network,
  ShieldAlert,
} from "lucide-react";
import { NeuralNetworkHero } from "@/components/NeuralNetworkHero";
import { DatasetCard } from "@/components/DatasetCard";
import { AccessBadge } from "@/components/AccessBadge";
import { clusters } from "@/data/clusters";
import { datasets, getFeaturedDatasets } from "@/data/datasets";
import type { AccessType } from "@/types/dataset";

const accessTypes: AccessType[] = [
  "open-download",
  "public-dashboard",
  "registration",
  "data-use-agreement",
  "request-only",
  "paid-subscription",
];

export default function LandingPage() {
  const featured = getFeaturedDatasets().slice(0, 6);
  const categoryCount = new Set(datasets.flatMap((d) => d.categories)).size;

  return (
    <div className="bg-data-grid">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-300/90">
            National data discovery
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Indian Data{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Guide
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            India&apos;s data ecosystem is rich but fragmented across surveys,
            dashboards, and subscription products. This guide treats datasets as
            discoverable records—with access friction, geography, and related
            sources made explicit.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Explore datasets
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/clusters"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10"
            >
              How the ecosystem fits
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <NeuralNetworkHero />
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950/80">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { label: "Datasets catalogued", value: String(datasets.length) },
            { label: "Broad categories", value: `${categoryCount}+` },
            { label: "Ecosystem clusters", value: String(clusters.length) },
            { label: "Access regimes", value: String(accessTypes.length) },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Six data clusters</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              A practical map of how health, education, labor, agriculture,
              governance, and climate/infra systems interact.
            </p>
          </div>
          <Link
            href="/clusters"
            className="hidden text-sm text-cyan-300 hover:text-cyan-200 sm:inline"
          >
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clusters.map((c) => (
            <Link
              key={c.id}
              href={`/explore?cluster=${c.id}`}
              className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-white/20"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: c.color }}
                  aria-hidden
                />
                <h3 className="font-semibold text-white">{c.name}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-emerald-400" aria-hidden />
          <h2 className="text-2xl font-semibold text-white">
            Good starting datasets
          </h2>
        </div>
        <p className="mt-2 max-w-2xl text-slate-400">
          High-leverage sources for newcomers—flagged for common research and
          policy questions.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <DatasetCard key={d.slug} dataset={d} />
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-cyan-300">
                <Filter className="h-5 w-5" aria-hidden />
                <h2 className="text-2xl font-semibold text-white">
                  Metadata that actually helps
                </h2>
              </div>
              <p className="mt-3 text-slate-400">
                Filter by category, geography, access type, format, and update
                frequency. Each record includes &quot;best for,&quot; limitations,
                and pairs-well-with links.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <Network className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  Related datasets surface survey + administrative combinations
                </li>
                <li className="flex gap-2">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  Access friction is shown honestly—open vs registration vs paid
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
              <p className="text-sm font-medium text-white">Access badges</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {accessTypes.map((t) => (
                  <AccessBadge key={t} accessType={t} />
                ))}
              </div>
              <Link
                href="/explore"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200"
              >
                Open the catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
