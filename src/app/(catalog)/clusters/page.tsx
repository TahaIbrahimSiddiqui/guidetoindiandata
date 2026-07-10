import Link from "next/link";
import { InContentAd } from "@/components/ads/ContentWithAds";
import { clusters, normalizeClusterId } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Themes",
  description:
    "Domain themes that organize India's survey, administrative, academic, and community data systems.",
};

export default function ClustersPage() {
  return (
    <div>
      <header className="mb-12 max-w-3xl">
        <p className="page-kicker">Taxonomy</p>
        <h1 className="page-title">Themes</h1>
        <p className="page-lede">
          Twenty-two domain lenses—from population to GitHub community data.
          Open a theme to browse related catalog records.
        </p>
      </header>

      <div className="grid-hairline sm:grid-cols-2">
        {clusters.map((cluster, index) => {
          const members = datasets.filter(
            (d) => normalizeClusterId(d.cluster) === cluster.id,
          );
          return (
            <section
              key={cluster.id}
              className="group bg-obsidian-panel p-6 transition-colors duration-300 hover:bg-[#1a1a1a] sm:p-8"
            >
              {index === 3 && (
                <div className="mb-6 sm:col-span-2">
                  <InContentAd />
                </div>
              )}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rotate-45 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: cluster.color }}
                      aria-hidden
                    />
                    <h2 className="font-display text-xl font-semibold tracking-tight text-[#F3E4C9]">
                      {cluster.name}
                    </h2>
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-[#D3D4C0]">
                    {cluster.description}
                  </p>
                </div>
                <Link
                  href={`/explore?cluster=${cluster.id}`}
                  className="inline-flex min-h-9 items-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C4A574] link-underline"
                >
                  Browse {members.length} →
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
