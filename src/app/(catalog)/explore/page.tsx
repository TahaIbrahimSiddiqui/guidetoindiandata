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
