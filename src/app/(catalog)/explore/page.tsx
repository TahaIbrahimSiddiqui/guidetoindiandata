import { Suspense } from "react";
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
    <Suspense
      fallback={
        <div className="space-y-6" aria-hidden>
          <div className="skeleton h-28 w-full max-w-xl" />
          <div className="skeleton h-48 w-full" />
          <div className="grid gap-px bg-obsidian-border sm:grid-cols-2">
            <div className="skeleton h-52" />
            <div className="skeleton h-52" />
          </div>
        </div>
      }
    >
      <ExploreClient />
    </Suspense>
  );
}
