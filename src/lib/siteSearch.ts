/**
 * Client-side site search for the solar map (and reusable elsewhere).
 * Multi-field ranked matching + India-data synonym expansion — no server, no embedding model.
 */
import { datasets } from "@/data/datasets";
import { seriesList } from "@/data/series";
import { domainClusters } from "@/lib/graphData";

export type SiteSearchKind = "dataset" | "series" | "theme" | "page";

export type SiteSearchDoc = {
  id: string;
  kind: SiteSearchKind;
  title: string;
  subtitle: string;
  href: string;
  /** Pre-lowercased blob for scoring */
  haystack: string;
  /** High-priority tokens (abbreviations, short titles) */
  aliases: string[];
};

export type SiteSearchResult = SiteSearchDoc & {
  score: number;
};

/** Small synonym groups: any query token expands to the whole group. */
const SYNONYM_GROUPS: string[][] = [
  ["labour", "labor", "employment", "jobs", "wages", "workforce", "plfs", "unemployment"],
  ["health", "nutrition", "maternal", "fertility", "nfhs", "dlhs", "biomarker", "anemia"],
  ["agriculture", "farm", "crops", "rural", "mandi", "agri"],
  ["education", "school", "learning", "udise", "aishe", "aser", "nas", "literacy"],
  ["census", "population", "demography", "demographic", "vital"],
  ["firm", "firms", "industry", "manufacturing", "msme", "asi", "asuse", "enterprise"],
  ["trade", "export", "import", "customs", "exim", "tariff"],
  ["climate", "weather", "environment", "pollution", "emissions", "pm25"],
  ["district", "districts", "subnational", "state-level", "geography"],
  ["microdata", "unit-level", "household survey", "survey"],
  ["consumption", "expenditure", "poverty", "hces", "living standards"],
  ["banking", "finance", "credit", "rbi", "financial"],
  ["election", "elections", "politics", "governance", "lok sabha"],
  ["geospatial", "gis", "boundaries", "maps", "spatial", "remote sensing"],
  ["github", "open source", "repository", "repo"],
  ["academic", "dataverse", "replication", "doi"],
  ["time use", "tus", "unpaid work", "care work"],
  ["aging", "ageing", "elderly", "lasi", "geriatric"],
];

const synonymMap: Map<string, string[]> = (() => {
  const m = new Map<string, string[]>();
  for (const group of SYNONYM_GROUPS) {
    const norm = group.map((g) => g.toLowerCase());
    for (const term of norm) {
      m.set(term, norm);
    }
  }
  return m;
})();

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s+.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const n = normalize(text);
  if (!n) return [];
  return n.split(" ").filter((t) => t.length > 0);
}

function expandTokens(tokens: string[]): string[] {
  const out = new Set<string>();
  for (const t of tokens) {
    out.add(t);
    const syn = synonymMap.get(t);
    if (syn) syn.forEach((s) => out.add(s));
    // light stemming-ish: drop trailing s
    if (t.length > 4 && t.endsWith("s")) out.add(t.slice(0, -1));
  }
  return [...out];
}

function buildIndex(): SiteSearchDoc[] {
  const docs: SiteSearchDoc[] = [];

  for (const d of datasets) {
    const aliases = [
      d.shortTitle,
      ...d.abbreviations,
      d.slug.replace(/-/g, " "),
    ].map((a) => a.toLowerCase());
    const hay = normalize(
      [
        d.title,
        d.shortTitle,
        d.summary,
        d.bestFor,
        d.exampleUses,
        d.host,
        d.institution,
        d.accessType,
        d.timeCoverage,
        ...(d.categories ?? []),
        ...(d.technicalTags ?? []),
        ...(d.keyVariables ?? []),
        ...(d.abbreviations ?? []),
        d.authors ?? "",
      ].join(" "),
    );
    docs.push({
      id: `dataset:${d.slug}`,
      kind: "dataset",
      title: d.shortTitle || d.title,
      subtitle: d.summary || d.bestFor || d.host,
      href: `/datasets/${d.slug}`,
      haystack: hay,
      aliases,
    });
  }

  for (const s of seriesList) {
    const aliases = [s.shortTitle, s.slug, s.family].map((a) =>
      String(a).toLowerCase(),
    );
    const hay = normalize(
      [s.title, s.shortTitle, s.description, s.host, s.family].join(" "),
    );
    docs.push({
      id: `series:${s.slug}`,
      kind: "series",
      title: s.shortTitle,
      subtitle: s.description,
      href: `/series/${s.slug}`,
      haystack: hay,
      aliases,
    });
  }

  for (const c of domainClusters) {
    const aliases = [c.shortName, c.id.replace(/-/g, " ")].map((a) =>
      a.toLowerCase(),
    );
    const hay = normalize(
      [c.name, c.shortName, c.description, c.id.replace(/-/g, " ")].join(" "),
    );
    docs.push({
      id: `theme:${c.id}`,
      kind: "theme",
      title: c.shortName,
      subtitle: c.description,
      href: `/explore?cluster=${encodeURIComponent(c.id)}`,
      haystack: hay,
      aliases,
    });
  }

  type PageSeed = {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    body: string;
    aliases: string[];
  };

  const pages: PageSeed[] = [
    {
      id: "page:explore",
      title: "Explore datasets",
      subtitle: "Search and filter the full catalog",
      href: "/explore",
      body: "explore search filter catalog browse all datasets",
      aliases: ["explore", "search", "catalog", "browse"],
    },
    {
      id: "page:series",
      title: "Series hubs",
      subtitle: "Multi-year survey families (NFHS, PLFS, …)",
      href: "/series",
      body: "series waves nfhs plfs nss multi-year timeline",
      aliases: ["series", "waves"],
    },
    {
      id: "page:clusters",
      title: "Themes",
      subtitle: "Domain themes that organize the solar map",
      href: "/clusters",
      body: "themes clusters taxonomy domains solar map",
      aliases: ["themes", "clusters", "taxonomy"],
    },
    {
      id: "page:academic",
      title: "Academic & Dataverse",
      subtitle: "Research deposits and replication packages",
      href: "/academic",
      body: "academic dataverse replication doi harvard research",
      aliases: ["academic", "dataverse", "replication"],
    },
    {
      id: "page:about",
      title: "About this guide",
      subtitle: "How the catalog is structured",
      href: "/about",
      body: "about guide maintainer badges how it works",
      aliases: ["about", "help"],
    },
    {
      id: "page:support",
      title: "Support",
      subtitle: "Buy Taha a coffee or chai",
      href: "/support",
      body: "support donate coffee chai ko-fi kofi upi public data goods",
      aliases: ["support", "donate", "coffee", "chai", "upi", "ko-fi"],
    },
    {
      id: "page:map",
      title: "Solar system map",
      subtitle: "Interactive theme and dataset universe",
      href: "/map",
      body: "map solar system graph orbit universe",
      aliases: ["map", "solar", "graph"],
    },
  ];

  for (const p of pages) {
    docs.push({
      id: p.id,
      kind: "page",
      title: p.title,
      subtitle: p.subtitle,
      href: p.href,
      haystack: normalize(`${p.title} ${p.subtitle} ${p.body}`),
      aliases: p.aliases.map((a) => a.toLowerCase()),
    });
  }

  return docs;
}

let cachedIndex: SiteSearchDoc[] | null = null;

export function getSiteSearchIndex(): SiteSearchDoc[] {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

function scoreDoc(
  doc: SiteSearchDoc,
  rawTokens: string[],
  expanded: string[],
): number {
  let score = 0;
  const titleN = normalize(doc.title);
  const subtitleN = normalize(doc.subtitle);

  for (const t of rawTokens) {
    if (doc.aliases.some((a) => a === t || a.includes(t))) score += 48;
    else if (titleN === t) score += 40;
    else if (titleN.startsWith(t) || titleN.includes(` ${t}`)) score += 28;
    else if (titleN.includes(t)) score += 18;

    if (subtitleN.includes(t)) score += 6;
  }

  for (const t of expanded) {
    if (t.length < 2) continue;
    // whole-word-ish presence in haystack
    if (
      doc.haystack.includes(` ${t} `) ||
      doc.haystack.startsWith(`${t} `) ||
      doc.haystack.endsWith(` ${t}`) ||
      doc.haystack === t
    ) {
      score += 4;
    } else if (doc.haystack.includes(t)) {
      score += 2;
    }
  }

  // Bonus: fraction of raw tokens matched somewhere
  let matched = 0;
  for (const t of rawTokens) {
    if (
      titleN.includes(t) ||
      subtitleN.includes(t) ||
      doc.haystack.includes(t) ||
      doc.aliases.some((a) => a.includes(t))
    ) {
      matched++;
    }
  }
  if (rawTokens.length > 1) {
    score += (matched / rawTokens.length) * 20;
  }

  // Prefer datasets slightly for research queries when scores are close
  if (doc.kind === "dataset") score += 1;
  if (doc.kind === "series") score += 2;

  return score;
}

/**
 * Ranked site search. Empty query → [].
 */
export function searchSite(query: string, limit = 8): SiteSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const rawTokens = tokenize(q);
  if (!rawTokens.length) return [];
  const expanded = expandTokens(rawTokens);
  const index = getSiteSearchIndex();

  const scored: SiteSearchResult[] = [];
  for (const doc of index) {
    const score = scoreDoc(doc, rawTokens, expanded);
    if (score > 0) scored.push({ ...doc, score });
  }

  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return scored.slice(0, limit);
}

export const SITE_SEARCH_KIND_LABEL: Record<SiteSearchKind, string> = {
  dataset: "Dataset",
  series: "Series",
  theme: "Theme",
  page: "Page",
};
