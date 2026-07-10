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
  /** All linked domain themes (multi-membership). */
  themeIds: ClusterId[];
  /**
   * Home theme for orbital layout — first domain theme.
   * Sources revolve around this sun; other themeIds are secondary links.
   */
  homeThemeId?: ClusterId;
  color: string;
};

export type GraphEdgeDef = {
  a: string;
  b: string;
  kind: "theme-source" | "source-source" | "theme-ring";
};

/**
 * Source layers (GitHub, replication archives, catalogs) — not domain themes.
 * Never rendered as theme circles on the universe graph.
 */
export const SOURCE_LAYER_IDS = new Set<string>([
  "github-community",
  "research-replication",
  "data-catalogs",
]);

export const domainClusters = clusters.filter(
  (c) => !SOURCE_LAYER_IDS.has(c.id),
);

function uniqThemes(ids: ClusterId[]): ClusterId[] {
  return Array.from(new Set(ids.map(normalizeClusterId)));
}

/** Keep only real domain themes (drop GitHub / Replication / Catalogs). */
function domainThemesOnly(ids: ClusterId[]): ClusterId[] {
  return uniqThemes(ids.filter((id) => !SOURCE_LAYER_IDS.has(id)));
}

export function getThemesForSeries(seriesSlug: string): ClusterId[] {
  const series = seriesList.find((s) => s.slug === seriesSlug);
  if (!series) return [];
  const fromOverride = SERIES_THEME_OVERRIDES[seriesSlug] ?? [];
  const fromWaves = series.waves.flatMap((w) => {
    const d = datasets.find((x) => x.slug === w.datasetSlug);
    return d ? themesFromCategoryList(d.categories) : [];
  });
  const themes = domainThemesOnly([
    ...fromOverride,
    normalizeClusterId(series.cluster),
    ...fromWaves,
  ]);
  return themes.length ? themes : ["international-india"];
}

export function getThemesForDataset(datasetSlug: string): ClusterId[] {
  const d = datasets.find((x) => x.slug === datasetSlug);
  if (!d) return [];
  const series = getSeriesForDataset(datasetSlug);
  if (series) return getThemesForSeries(series.slug);
  const fromOverride = DATASET_THEME_OVERRIDES[datasetSlug] ?? [];
  // Do not treat GitHub / replication / catalogs as theme circles —
  // only real domain themes from overrides, categories, and cluster when domain.
  let themes = domainThemesOnly([
    ...fromOverride,
    normalizeClusterId(d.cluster),
    ...themesFromCategoryList(d.categories),
  ]);
  if (themes.length) return themes;
  // Fallback domain for pure source-layer records
  if (d.sourceKind === "github-community") {
    return domainThemesOnly([
      ...themesFromCategoryList(d.categories),
      "geospatial-remote-sensing",
      "digital-economy",
    ]);
  }
  if (d.sourceKind === "replication") {
    return domainThemesOnly([
      ...themesFromCategoryList(d.categories),
      "politics-governance",
      "education",
    ]);
  }
  return ["international-india"];
}

/** Full interlinked graph: all themes + all sources. */
export function buildInterlinkedGraph(): {
  nodes: GraphNodeDef[];
  edges: GraphEdgeDef[];
} {
  const nodes: GraphNodeDef[] = [];
  const edges: GraphEdgeDef[] = [];
  const nodeIds = new Set<string>();

  // Domain themes only — never GitHub / Replication / Catalogs as circles
  domainClusters.forEach((c) => {
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
  for (let i = 0; i < domainClusters.length; i++) {
    edges.push({
      a: `t:${domainClusters[i].id}`,
      b: `t:${domainClusters[(i + 1) % domainClusters.length].id}`,
      kind: "theme-ring",
    });
  }

  for (const s of seriesList) {
    const id = `s:${s.slug}`;
    nodeIds.add(id);
    const themeIds = getThemesForSeries(s.slug);
    const homeThemeId = themeIds[0];
    nodes.push({
      id,
      label: s.shortTitle,
      kind: "source",
      href: `/series/${s.slug}`,
      themeIds,
      homeThemeId,
      color: "#c8c8c8",
    });
    for (const t of themeIds) {
      if (SOURCE_LAYER_IDS.has(t)) continue;
      if (!nodeIds.has(`t:${t}`)) continue;
      edges.push({ a: `t:${t}`, b: id, kind: "theme-source" });
    }
  }

  for (const d of datasets) {
    if (getSeriesForDataset(d.slug)) continue;
    const id = `d:${d.slug}`;
    nodeIds.add(id);
    const themeIds = getThemesForDataset(d.slug);
    const homeThemeId = themeIds[0];
    nodes.push({
      id,
      label: d.shortTitle,
      kind: "source",
      href: `/datasets/${d.slug}`,
      themeIds,
      homeThemeId,
      // Light grey datasets — tint applied from home theme when drawing
      color: "#c8c8c8",
    });
    for (const t of themeIds) {
      if (SOURCE_LAYER_IDS.has(t)) continue;
      if (!nodeIds.has(`t:${t}`)) continue;
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
 * Theme click: that theme + every source linked to it (home orbiters AND
 * secondary multi-theme members that revolve around a different sun).
 * Other themes stay dim. Pair edges ignored on theme focus.
 * Source click: source + all its themes + paired sources.
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
    const tid = sel.themeId;
    for (const e of edges) {
      if (e.kind !== "theme-source") continue;
      if (e.a === selectedId) focus.add(e.b);
      if (e.b === selectedId) focus.add(e.a);
    }
    // Also catch any source that lists this theme but edge was skipped
    if (tid) {
      for (const n of nodes) {
        if (n.kind === "source" && n.themeIds.includes(tid)) focus.add(n.id);
      }
    }
    return focus;
  }

  // Source selected: light its themes + pair edges
  for (const e of edges) {
    if (e.a !== selectedId && e.b !== selectedId) continue;
    if (e.kind === "theme-ring") continue;
    const other = e.a === selectedId ? e.b : e.a;
    focus.add(other);
  }
  return focus;
}

/** True if source's home (orbital) theme is this theme id string without t: prefix. */
export function isHomeOrbit(source: GraphNodeDef, themeId: string): boolean {
  const home = source.homeThemeId ?? source.themeIds[0];
  return Boolean(home && home === themeId);
}

export function getThemeNodes() {
  return domainClusters.map((c) => ({
    id: c.id as ClusterId,
    label: c.shortName,
    fullLabel: c.name,
    color: c.color,
  }));
}
