import { datasets } from "@/data/datasets";
import { domainClusters } from "@/lib/graphData";

export type CatalogStats = {
  datasetCount: number;
  thematicAreaCount: number;
  providerCount: number;
  /** e.g. "July 2026" — build-time stamp for static export */
  lastUpdatedLabel: string;
};

/**
 * Credibility indicators derived from the live catalogue index.
 * Counts are never hard-coded; recompute when the index changes.
 */
export function getCatalogStats(): CatalogStats {
  const hosts = new Set<string>();
  for (const d of datasets) {
    const host = (d.host || d.institution || "").trim();
    if (host) hosts.add(host);
  }

  const lastUpdatedLabel = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    datasetCount: datasets.length,
    thematicAreaCount: domainClusters.length,
    providerCount: hosts.size,
    lastUpdatedLabel,
  };
}
