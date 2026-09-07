export const RESEARCH_WORK_KINDS = [
  "journal-article",
  "conference-paper",
  "working-paper",
  "report",
  "thesis",
  "blog",
] as const;

export type ResearchWorkKind = (typeof RESEARCH_WORK_KINDS)[number];

export const DATASET_USE_RELATIONSHIPS = [
  "introduces",
  "analyzes",
  "reuses",
  "visualizes",
] as const;

export type DatasetUseRelationship =
  (typeof DATASET_USE_RELATIONSHIPS)[number];

export const DATASET_USE_EVIDENCE_KINDS = [
  "data-doi-reference",
  "exact-methods",
  "exact-fulltext",
  "source-record",
  "manual-review",
] as const;

export type DatasetUseEvidenceKind =
  (typeof DATASET_USE_EVIDENCE_KINDS)[number];

export const DATASET_USE_DISCOVERY_SOURCES = [
  "openalex",
  "datacite",
  "crossref",
  "google-search",
  "google-scholar-manual",
  "catalog-record",
] as const;

export type DatasetUseDiscoverySource =
  (typeof DATASET_USE_DISCOVERY_SOURCES)[number];

export type ResearchWork = {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  year?: number;
  kind: ResearchWorkKind;
  url: string;
  doi?: string;
  citationCount?: number;
};

export type DatasetUseLink = {
  workId: string;
  relationship: DatasetUseRelationship;
  evidenceKind: DatasetUseEvidenceKind;
  evidenceUrl: string;
  useSummary: string;
  discoveredVia: DatasetUseDiscoverySource[];
};

export type DatasetResearchStatus = {
  scholarlyCheckedAt: string | null;
  webCheckedAt: string | null;
  uses: DatasetUseLink[];
};

export type DatasetUseCatalog = {
  version: 1;
  works: Record<string, ResearchWork>;
  datasets: Record<string, DatasetResearchStatus>;
};

export type ResolvedDatasetUse = DatasetUseLink & {
  work: ResearchWork;
};

export type ResolvedDatasetUses = {
  scholarlyCheckedAt: string | null;
  webCheckedAt: string | null;
  scholarly: ResolvedDatasetUse[];
  web: ResolvedDatasetUse[];
};
