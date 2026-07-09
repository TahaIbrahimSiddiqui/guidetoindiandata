import { Suspense } from "react";
import { ExploreClient } from "@/components/ExploreClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore datasets",
  description:
    "Search and filter 70+ Indian datasets by category, access type, geography, and institution.",
};

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="h-40 animate-pulse rounded-2xl bg-slate-900/50" />
      }
    >
      <ExploreClient />
    </Suspense>
  );
}
