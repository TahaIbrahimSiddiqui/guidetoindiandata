import type { AccessType, Dataset, SourceKind } from "@/types/dataset";

export type DatasetFilters = {
  q?: string;
  category?: string;
  accessType?: AccessType | "";
  geography?: string;
  format?: string;
  frequency?: string;
  institution?: string;
  cluster?: string;
  flag?: string;
  /** government | academic | replication */
  source?: string;
};

export function filterDatasets(
  datasets: Dataset[],
  filters: DatasetFilters
): Dataset[] {
  const q = filters.q?.trim().toLowerCase();

  return datasets.filter((d) => {
    if (filters.category && !d.categories.includes(filters.category)) {
      return false;
    }
    if (filters.accessType && d.accessType !== filters.accessType) {
      return false;
    }
    if (
      filters.geography &&
      !d.geographyLevel.some(
        (g) => g.toLowerCase() === filters.geography!.toLowerCase()
      )
    ) {
      return false;
    }
    if (
      filters.format &&
      !d.formats.some((f) =>
        f.toLowerCase().includes(filters.format!.toLowerCase())
      )
    ) {
      return false;
    }
    if (
      filters.frequency &&
      !d.updateFrequency
        .toLowerCase()
        .includes(filters.frequency.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.institution &&
      !`${d.institution} ${d.host}`
        .toLowerCase()
        .includes(filters.institution.toLowerCase())
    ) {
      return false;
    }
    if (filters.cluster && d.cluster !== filters.cluster) {
      return false;
    }
    if (
      filters.flag &&
      !(d.flags ?? []).includes(filters.flag as "good-starting" | "best-district")
    ) {
      return false;
    }
    if (filters.source) {
      const kind: SourceKind = d.sourceKind ?? "government";
      if (filters.source === "government" && kind !== "government") return false;
      if (filters.source === "academic") {
        if (
          kind !== "academic-reference" &&
          kind !== "academic-survey" &&
          kind !== "academic-project"
        )
          return false;
      }
      if (filters.source === "replication" && kind !== "replication") return false;
    }
    if (q) {
      const hay = [
        d.title,
        d.shortTitle,
        d.host,
        d.institution,
        d.bestFor,
        d.exampleUses,
        d.dataDoi,
        d.paperDoi,
        d.authors,
        d.recommendedCitation,
        ...d.abbreviations,
        ...d.categories,
        ...d.technicalTags,
        ...d.keyVariables,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}
