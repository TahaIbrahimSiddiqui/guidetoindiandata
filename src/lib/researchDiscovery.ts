import type { Dataset, DataSeries } from "@/types/dataset";
import type {
  DatasetUseEvidenceKind,
  DatasetUseRelationship,
  ResearchWorkKind,
} from "@/types/researchUse";
import { DATASET_USE_SEARCH_OVERRIDES } from "@/data/datasetUseSearchOverrides";

export type DatasetSearchProfile = {
  slug: string;
  scholarlyQueries: string[];
  webQueries: string[];
  requiredWaveTerms: string[];
  ambiguousAbbreviations: string[];
  datasetNames: string[];
  requireIndiaContext: boolean;
  disableTitleAutoApproval: boolean;
};

export type DiscoveryCandidate = {
  title: string;
  authors: string[];
  publisher?: string;
  year?: number;
  kind: ResearchWorkKind;
  url: string;
  doi?: string;
  citationCount?: number;
  relationship: DatasetUseRelationship;
  evidenceKind: DatasetUseEvidenceKind;
  evidenceUrl: string;
  useSummary: string;
  discoveredVia: string[];
};

const GENERIC_ABBREVIATIONS = new Set([
  "asi",
  "crs",
  "dhs",
  "dot",
  "hmis",
  "iip",
  "ihip",
  "nas",
  "nss",
  "srs",
  "tus",
  "wpi",
]);

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function normalizeDoi(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .toLowerCase();
  return normalized.startsWith("10.") ? normalized : undefined;
}

export function canonicalizeUrl(value: string): string {
  try {
    const url = new URL(value.trim());
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    }
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return value.trim();
  }
}

export function normalizedTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function candidateKey(candidate: DiscoveryCandidate): string {
  const doi = normalizeDoi(candidate.doi);
  if (doi) return `doi:${doi}`;
  const title = normalizedTitle(candidate.title);
  if (title) return `title:${title}:${candidate.year ?? "unknown"}`;
  const url = canonicalizeUrl(candidate.url);
  if (/^https?:\/\//i.test(url)) return `url:${url.toLowerCase()}`;
  return `unknown:${candidate.year ?? "unknown"}`;
}

export function buildDatasetSearchProfile(
  dataset: Dataset,
  series?: DataSeries,
): DatasetSearchProfile {
  const override = DATASET_USE_SEARCH_OVERRIDES[dataset.slug] || {};
  const abbreviations = dataset.abbreviations.filter((abbr) => abbr.length >= 3);
  const ambiguousAbbreviations = abbreviations.filter((abbr) =>
    GENERIC_ABBREVIATIONS.has(abbr.toLowerCase()),
  );
  const safeAbbreviations = abbreviations.filter(
    (abbr) => !GENERIC_ABBREVIATIONS.has(abbr.toLowerCase()),
  );
  const requiredWaveTerms = unique(
    [dataset.waveYearLabel, dataset.timeCoverage]
      .filter((value): value is string => Boolean(value))
      .flatMap((value) => value.match(/(?:19|20)\d{2}(?:[–-]\d{2,4})?/g) ?? []),
  );
  const datasetNames = unique([
    dataset.title,
    dataset.shortTitle,
    ...(override.additionalNames || []),
  ]);
  const quotedNames = unique([
    ...datasetNames.map((name) => `"${name}"`),
    ...safeAbbreviations.map((abbr) => `"${abbr}" India dataset`),
    ...(series ? [`"${series.title}" ${requiredWaveTerms[0] ?? "India"}`] : []),
  ]);
  const doi = normalizeDoi(dataset.dataDoi);
  const scholarlyQueries = unique([
    ...(doi ? [`"${doi}"`] : []),
    ...quotedNames,
  ]);
  const webQueries = unique(
    quotedNames.map((name) => `${name} (analysis OR study OR visualization)`),
  );

  return {
    slug: dataset.slug,
    scholarlyQueries,
    webQueries,
    requiredWaveTerms,
    ambiguousAbbreviations,
    datasetNames,
    requireIndiaContext:
      override.requireIndiaContext || ambiguousAbbreviations.length > 0,
    disableTitleAutoApproval: Boolean(override.disableTitleAutoApproval),
  };
}

export function hasRequiredWaveEvidence(
  profile: DatasetSearchProfile,
  text: string,
): boolean {
  if (profile.requiredWaveTerms.length === 0) return true;
  const normalized = text.replace(/[–—]/g, "-").toLowerCase();
  return profile.requiredWaveTerms.some((term) =>
    normalized.includes(term.replace(/[–—]/g, "-").toLowerCase()),
  );
}

export function hasExplicitTitleUseEvidence(
  dataset: Dataset,
  profile: DatasetSearchProfile,
  title: string,
): boolean {
  if (profile.disableTitleAutoApproval) return false;
  const normalized = normalizedTitle(title);
  const strongNameMatch = profile.datasetNames
    .map(normalizedTitle)
    .filter((name) => name.split(" ").length >= 4)
    .some(
      (name) =>
        normalized === name ||
        normalized.includes(name) ||
        name.includes(normalized),
    );
  const useSignal =
    /\b(analysis|analy[sz]es?|based on|data from|determinants|evidence from|findings from|insights from|secondary analysis|using|utili[sz]ing|visuali[sz]|inequalit|prevalence)\b/.test(
      normalized,
    );
  if (
    !strongNameMatch ||
    !useSignal ||
    !hasRequiredWaveEvidence(profile, title)
  ) {
    return false;
  }

  if (profile.requireIndiaContext && !/\bindia(?:n|s)?\b/.test(normalized)) {
    return false;
  }

  return true;
}

const evidenceWeight: Record<DatasetUseEvidenceKind, number> = {
  "manual-review": 50,
  "exact-methods": 45,
  "data-doi-reference": 40,
  "exact-fulltext": 35,
  "source-record": 30,
};

const relationWeight: Record<DatasetUseRelationship, number> = {
  analyzes: 20,
  reuses: 16,
  visualizes: 12,
  introduces: 8,
};

export function rankDiscoveryCandidate(candidate: DiscoveryCandidate): number {
  return (
    evidenceWeight[candidate.evidenceKind] +
    relationWeight[candidate.relationship] +
    Math.min(candidate.citationCount ?? 0, 100) / 100 +
    Math.max(0, (candidate.year ?? 2000) - 2000) / 100
  );
}

export function dedupeAndRankCandidates(
  candidates: DiscoveryCandidate[],
  limit = 12,
): DiscoveryCandidate[] {
  const byKey = new Map<string, DiscoveryCandidate>();
  for (const candidate of candidates) {
    const key = candidateKey(candidate);
    const current = byKey.get(key);
    if (!current || rankDiscoveryCandidate(candidate) > rankDiscoveryCandidate(current)) {
      byKey.set(key, candidate);
    }
  }

  return [...byKey.values()]
    .sort(
      (a, b) =>
        rankDiscoveryCandidate(b) - rankDiscoveryCandidate(a) ||
        (b.year ?? 0) - (a.year ?? 0) ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit);
}
