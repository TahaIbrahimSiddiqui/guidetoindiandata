import { clusters } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import {
  CATEGORY_TO_THEME,
  DATASET_THEME_OVERRIDES,
  SERIES_THEME_OVERRIDES,
} from "@/data/themeLinks";
import {
  getSeriesForDataset,
  seriesList,
} from "@/data/series";
import type { ClusterId } from "@/types/dataset";

export type GraphNodeKind = "theme" | "source";

export type GraphNodeDef = {
  id: string;
  label: string;
  kind: GraphNodeKind;
  href?: string;
  /** Theme id if kind === theme */
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
  return Array.from(new Set(ids));
}

function themesFromCategories(categories: string[]): ClusterId[] {
  const out: ClusterId[] = [];
  for (const c of categories) {
    const t = CATEGORY_TO_THEME[c] ?? CATEGORY_TO_THEME[c.toLowerCase()];
    if (t) out.push(t);
  }
  return out;
}

export function getThemesForSeries(seriesSlug: string): ClusterId[] {
  const series = seriesList.find((s) => s.slug === seriesSlug);
  if (!series) return [];
  const fromOverride = SERIES_THEME_OVERRIDES[seriesSlug] ?? [];
  const fromWaves = series.waves.flatMap((w) => {
    const d = datasets.find((x) => x.slug === w.datasetSlug);
    return d ? themesFromCategories(d.categories) : [];
  });
  return uniqThemes([...fromOverride, series.cluster, ...fromWaves]);
}

export function getThemesForDataset(datasetSlug: string): ClusterId[] {
  const d = datasets.find((x) => x.slug === datasetSlug);
  if (!d) return [];
  const series = getSeriesForDataset(datasetSlug);
  if (series) return getThemesForSeries(series.slug);
  const fromOverride = DATASET_THEME_OVERRIDES[datasetSlug] ?? [];
  return uniqThemes([
    ...fromOverride,
    d.cluster,
    ...themesFromCategories(d.categories),
  ]);
}

/** Build full interlinked graph: all themes + all sources, multi-edges. */
export function buildInterlinkedGraph(): {
  nodes: GraphNodeDef[];
  edges: GraphEdgeDef[];
} {
  const themeColor = new Map(clusters.map((c) => [c.id, c.color] as const));
  const nodes: GraphNodeDef[] = [];
  const edges: GraphEdgeDef[] = [];
  const nodeIds = new Set<string>();

  // Themes
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

  // Theme ring (weak structure)
  for (let i = 0; i < clusters.length; i++) {
    edges.push({
      a: `t:${clusters[i].id}`,
      b: `t:${clusters[(i + 1) % clusters.length].id}`,
      kind: "theme-ring",
    });
  }

  // Series sources
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
      color: "#a78bfa",
    });
    for (const t of themeIds) {
      edges.push({ a: `t:${t}`, b: id, kind: "theme-source" });
    }
  }

  // Standalone datasets (not in a series)
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
      color: "#c4b5fd",
    });
    for (const t of themeIds) {
      edges.push({ a: `t:${t}`, b: id, kind: "theme-source" });
    }
  }

  // Source–source from pairsWith (dataset level → series/source nodes)
  const edgeKey = new Set(
    edges.map((e) => [e.a, e.b].sort().join("|"))
  );

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

  // Series pairsWithSeries
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
 * Focus set for Obsidian-style highlighting.
 * - Theme focus: theme + all sources linked to it + their paired sources (1-hop)
 * - Source focus: source + its themes + paired sources
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

  const neighbors = (id: string) =>
    edges
      .filter((e) => e.a === id || e.b === id)
      .map((e) => (e.a === id ? e.b : e.a));

  if (sel.kind === "theme") {
    for (const n of neighbors(selectedId)) {
      focus.add(n);
      // 1-hop pairs among sources linked to this theme
      for (const n2 of neighbors(n)) {
        const node = byId.get(n2);
        if (node?.kind === "source" && focus.has(n)) focus.add(n2);
      }
    }
  } else {
    for (const n of neighbors(selectedId)) {
      focus.add(n);
    }
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
