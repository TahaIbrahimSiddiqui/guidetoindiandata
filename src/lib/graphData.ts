import { clusters, normalizeClusterId } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import {
  DATASET_THEME_OVERRIDES,
  SERIES_THEME_OVERRIDES,
  themesFromCategoryList,
} from "@/data/themeLinks";
import { getSeriesForDataset, seriesList } from "@/data/series";
import type { ClusterId } from "@/types/dataset";

export type GraphNodeKind = "theme" | "source";

export type GraphNodeDef = {
  id: string;
  label: string;
  kind: GraphNodeKind;
  href?: string;
  themeId?: ClusterId;
  themeIds: ClusterId[];
  color: string;
};

export type GraphEdgeDef = {
  a: string;
  b: string;
  kind: "theme-source" | "source-source" | "theme-ring";
};

function uniqThemes(ids: ClusterId[]): ClusterId[] {
  return Array.from(new Set(ids.map(normalizeClusterId)));
}

export function getThemesForSeries(seriesSlug: string): ClusterId[] {
  const series = seriesList.find((s) => s.slug === seriesSlug);
  if (!series) return [];
  const fromOverride = SERIES_THEME_OVERRIDES[seriesSlug] ?? [];
  const fromWaves = series.waves.flatMap((w) => {
    const d = datasets.find((x) => x.slug === w.datasetSlug);
    return d ? themesFromCategoryList(d.categories) : [];
  });
  return uniqThemes([
    ...fromOverride,
    normalizeClusterId(series.cluster),
    ...fromWaves,
  ]);
}

export function getThemesForDataset(datasetSlug: string): ClusterId[] {
  const d = datasets.find((x) => x.slug === datasetSlug);
  if (!d) return [];
  const series = getSeriesForDataset(datasetSlug);
  if (series) return getThemesForSeries(series.slug);
  const fromOverride = DATASET_THEME_OVERRIDES[datasetSlug] ?? [];
  const extra: ClusterId[] = [];
  if (d.sourceKind === "github-community") extra.push("github-community");
  if (d.sourceKind === "replication") extra.push("research-replication");
  if (
    d.sourceKind === "academic-reference" ||
    d.sourceKind === "academic-survey" ||
    d.sourceKind === "academic-project"
  ) {
    extra.push("data-catalogs");
  }
  return uniqThemes([
    ...fromOverride,
    normalizeClusterId(d.cluster),
    ...themesFromCategoryList(d.categories),
    ...extra,
  ]);
}

/** Full interlinked graph: all themes + all sources. */
export function buildInterlinkedGraph(): {
  nodes: GraphNodeDef[];
  edges: GraphEdgeDef[];
} {
  const nodes: GraphNodeDef[] = [];
  const edges: GraphEdgeDef[] = [];
  const nodeIds = new Set<string>();

  clusters.forEach((c) => {
    const id = `t:${c.id}`;
    nodeIds.add(id);
    nodes.push({
      id,
      label: c.shortName,
      kind: "theme",
      themeId: c.id,
      themeIds: [c.id],
      color: c.color,
    });
  });

  // Theme ring only for weak visual structure — NOT used in focus walks
  for (let i = 0; i < clusters.length; i++) {
    edges.push({
      a: `t:${clusters[i].id}`,
      b: `t:${clusters[(i + 1) % clusters.length].id}`,
      kind: "theme-ring",
    });
  }

  for (const s of seriesList) {
    const id = `s:${s.slug}`;
    nodeIds.add(id);
    const themeIds = getThemesForSeries(s.slug);
    nodes.push({
      id,
      label: s.shortTitle,
      kind: "source",
      href: `/series/${s.slug}`,
      themeIds,
      color: "#D3D4C0",
    });
    for (const t of themeIds) {
      edges.push({ a: `t:${t}`, b: id, kind: "theme-source" });
    }
  }

  for (const d of datasets) {
    if (getSeriesForDataset(d.slug)) continue;
    const id = `d:${d.slug}`;
    nodeIds.add(id);
    const themeIds = getThemesForDataset(d.slug);
    nodes.push({
      id,
      label: d.shortTitle,
      kind: "source",
      href: `/datasets/${d.slug}`,
      themeIds,
      color:
        d.sourceKind === "github-community"
          ? "#8B9A8C"
          : d.sourceKind === "replication"
            ? "#C4A574"
            : "#F3E4C9",
    });
    for (const t of themeIds) {
      edges.push({ a: `t:${t}`, b: id, kind: "theme-source" });
    }
  }

  const edgeKey = new Set(edges.map((e) => [e.a, e.b].sort().join("|")));

  function sourceIdForDataset(slug: string): string | null {
    const series = getSeriesForDataset(slug);
    if (series) return `s:${series.slug}`;
    if (nodeIds.has(`d:${slug}`)) return `d:${slug}`;
    return null;
  }

  for (const d of datasets) {
    const from = sourceIdForDataset(d.slug);
    if (!from) continue;
    for (const other of d.pairsWith) {
      const to = sourceIdForDataset(other);
      if (!to || to === from) continue;
      const key = [from, to].sort().join("|");
      if (edgeKey.has(key)) continue;
      edgeKey.add(key);
      edges.push({ a: from, b: to, kind: "source-source" });
    }
  }

  for (const s of seriesList) {
    const from = `s:${s.slug}`;
    for (const other of s.pairsWithSeries ?? []) {
      const to = `s:${other}`;
      if (!nodeIds.has(to)) continue;
      const key = [from, to].sort().join("|");
      if (edgeKey.has(key)) continue;
      edgeKey.add(key);
      edges.push({ a: from, b: to, kind: "source-source" });
    }
  }

  return { nodes, edges };
}

/**
 * Theme click: ONLY that theme + sources with a direct theme-source edge.
 * Other themes never light up. Pair edges ignored on theme focus.
 * Source click: source + its themes + paired sources.
 */
export function getFocusSet(
  selectedId: string | null,
  nodes: GraphNodeDef[],
  edges: GraphEdgeDef[]
): Set<string> {
  const focus = new Set<string>();
  if (!selectedId) return focus;

  focus.add(selectedId);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const sel = byId.get(selectedId);
  if (!sel) return focus;

  if (sel.kind === "theme") {
    for (const e of edges) {
      if (e.kind !== "theme-source") continue;
      if (e.a === selectedId) focus.add(e.b);
      if (e.b === selectedId) focus.add(e.a);
    }
    return focus;
  }

  // Source selected
  for (const e of edges) {
    if (e.a !== selectedId && e.b !== selectedId) continue;
    if (e.kind === "theme-ring") continue;
    const other = e.a === selectedId ? e.b : e.a;
    focus.add(other);
  }
  return focus;
}

export function getThemeNodes() {
  return clusters.map((c) => ({
    id: c.id as ClusterId,
    label: c.shortName,
    fullLabel: c.name,
    color: c.color,
  }));
}
