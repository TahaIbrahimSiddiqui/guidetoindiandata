import catalogJson from "@/data/datasetUses.json";
import type {
  DatasetUseCatalog,
  DatasetUseEvidenceKind,
  DatasetUseRelationship,
  ResearchWork,
  ResolvedDatasetUse,
  ResolvedDatasetUses,
} from "@/types/researchUse";

export const MAX_DATASET_USES = 12;

const catalog = catalogJson as DatasetUseCatalog;

const evidenceWeight: Record<DatasetUseEvidenceKind, number> = {
  "manual-review": 50,
  "exact-methods": 45,
  "data-doi-reference": 40,
  "exact-fulltext": 35,
  "source-record": 30,
};

const relationshipWeight: Record<DatasetUseRelationship, number> = {
  analyzes: 20,
  reuses: 16,
  visualizes: 12,
  introduces: 8,
};

const workKindWeight: Record<ResearchWork["kind"], number> = {
  "journal-article": 12,
  "conference-paper": 10,
  "working-paper": 8,
  report: 7,
  thesis: 6,
  blog: 5,
};

export function datasetUseScore(item: ResolvedDatasetUse): number {
  const citations = Math.min(item.work.citationCount ?? 0, 100) / 100;
  const recency = item.work.year ? Math.max(0, item.work.year - 2000) / 100 : 0;

  return (
    evidenceWeight[item.evidenceKind] +
    relationshipWeight[item.relationship] +
    workKindWeight[item.work.kind] +
    citations +
    recency
  );
}

function compareUses(a: ResolvedDatasetUse, b: ResolvedDatasetUse): number {
  return (
    datasetUseScore(b) - datasetUseScore(a) ||
    (b.work.year ?? 0) - (a.work.year ?? 0) ||
    a.work.title.localeCompare(b.work.title)
  );
}

export function getDatasetUses(slug: string): ResolvedDatasetUses {
  const status = catalog.datasets[slug];
  if (!status) {
    return {
      scholarlyCheckedAt: null,
      webCheckedAt: null,
      scholarly: [],
      web: [],
    };
  }

  const resolved = status.uses
    .map((use) => {
      const work = catalog.works[use.workId];
      return work ? ({ ...use, work } satisfies ResolvedDatasetUse) : null;
    })
    .filter((use): use is ResolvedDatasetUse => use !== null)
    .sort(compareUses)
    .slice(0, MAX_DATASET_USES);

  return {
    scholarlyCheckedAt: status.scholarlyCheckedAt,
    webCheckedAt: status.webCheckedAt,
    scholarly: resolved.filter((item) => item.work.kind !== "blog"),
    web: resolved.filter((item) => item.work.kind === "blog"),
  };
}

export function getDatasetUseCatalog(): DatasetUseCatalog {
  return catalog;
}
