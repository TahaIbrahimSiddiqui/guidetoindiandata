import { Suspense } from "react";
import { DatasetCard } from "@/components/DatasetCard";
import { ExploreClient } from "@/components/ExploreClient";
import { datasets } from "@/data/datasets";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "Explore datasets",
  description: `Search and filter ${datasets.length}+ Indian datasets by category, access type, geography, and institution.`,
  path: "/explore",
});

export default function ExplorePage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <ExploreClient />
    </Suspense>
  );
}

const fallbackSlugs = [
  "nfhs-5",
  "plfs-annual-2023-24",
  "census-pca-2011",
  "udise-plus",
  "asi-2023-24",
  "srs-statistical-reports",
  "nss-microdata-catalog",
  "census-tables",
];

function CatalogFallback() {
  const records = fallbackSlugs.flatMap((slug) => {
    const dataset = datasets.find((candidate) => candidate.slug === slug);
    return dataset ? [dataset] : [];
  });

  return (
    <div aria-busy="true">
      <header className="mb-10 max-w-3xl">
        <p className="page-kicker">Catalog</p>
        <h1 className="page-title">Explore datasets</h1>
        <p className="page-lede">
          Search and compare {datasets.length} Indian surveys, administrative
          systems, research deposits, and maintained community sources. Each
          record includes access conditions, coverage, variables, best uses,
          and limitations.
        </p>
      </header>
      <p className="mb-5 text-sm text-obsidian-muted">
        Preparing the interactive filters. A representative starting shelf is
        available below.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {records.map((dataset) => (
          <DatasetCard key={dataset.slug} dataset={dataset} />
        ))}
      </div>
    </div>
  );
}
