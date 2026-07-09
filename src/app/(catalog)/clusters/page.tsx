import Link from "next/link";
import { InContentAd } from "@/components/ads/ContentWithAds";
import { clusters } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecosystem clusters",
  description:
    "Six interacting clusters that organize India's survey, administrative, and geospatial data systems.",
};

export default function ClustersPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-white">
          How the ecosystem fits together
        </h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Large survey programs, administrative monitoring, macro series,
          governance data, mission dashboards, and geospatial layers overlap
          heavily. Use clusters to navigate, then jump into filtered catalogs.
        </p>
      </header>

      <div className="space-y-8">
        {clusters.map((cluster, index) => {
          const members = datasets.filter((d) => d.cluster === cluster.id);
          return (
            <section key={cluster.id}>
              {index === 2 && <InContentAd />}
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cluster.color }}
                      />
                      <h2 className="text-xl font-semibold text-white">
                        {cluster.name}
                      </h2>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      {cluster.description}
                    </p>
                  </div>
                  <Link
                    href={`/explore?cluster=${cluster.id}`}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-cyan-300 hover:bg-white/5"
                  >
                    Browse {members.length} datasets
                  </Link>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {members.slice(0, 12).map((d) => (
                    <li key={d.slug}>
                      <Link
                        href={`/datasets/${d.slug}`}
                        className="inline-flex rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-400/30 hover:text-white"
                      >
                        {d.shortTitle}
                      </Link>
                    </li>
                  ))}
                  {members.length > 12 && (
                    <li className="px-2 py-1 text-xs text-slate-500">
                      +{members.length - 12} more
                    </li>
                  )}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
