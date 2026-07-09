import { clusters } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import { getSeriesForDataset, seriesList } from "@/data/series";
import type { ClusterId } from "@/types/dataset";

export type GraphChild = {
  id: string;
  label: string;
  href: string;
  kind: "series" | "dataset";
};

/** Unique series/dataset children for a theme (cluster). Prefer series hubs. */
export function getGraphChildrenForCluster(clusterId: ClusterId): GraphChild[] {
  const seen = new Set<string>();
  const out: GraphChild[] = [];

  // Prefer series that belong to this cluster
  for (const s of seriesList) {
    if (s.cluster !== clusterId) continue;
    if (seen.has(`s:${s.slug}`)) continue;
    seen.add(`s:${s.slug}`);
    out.push({
      id: `s:${s.slug}`,
      label: s.shortTitle,
      href: `/series/${s.slug}`,
      kind: "series",
    });
  }

  // Datasets in cluster not already covered by a series
  for (const d of datasets) {
    if (d.cluster !== clusterId) continue;
    const series = getSeriesForDataset(d.slug);
    if (series) {
      // already represented as series node
      continue;
    }
    const id = `d:${d.slug}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      label: d.shortTitle,
      href: `/datasets/${d.slug}`,
      kind: "dataset",
    });
  }

  return out;
}

export function getThemeNodes() {
  return clusters.map((c) => ({
    id: c.id as ClusterId,
    label: c.shortName,
    fullLabel: c.name,
    color: c.color,
  }));
}
