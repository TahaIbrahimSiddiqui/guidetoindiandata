/**
 * Export all website datasets to content/datasets-catalog.csv
 *
 *   npx tsx scripts/export-datasets-csv.ts
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { datasets } from "../src/data/datasets";
import { getSeriesForDataset } from "../src/data/series";
import { getCluster, normalizeClusterId } from "../src/data/clusters";
import { getThemesForDataset } from "../src/lib/graphData";

function csvEscape(v: string | number | undefined | null): string {
  if (v === undefined || v === null || v === "") return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const headers = [
  "slug",
  "title",
  "shortTitle",
  "abbreviations",
  "host",
  "institution",
  "cluster",
  "clusterName",
  "themes",
  "categories",
  "technicalTags",
  "accessType",
  "accessUrl",
  "docsUrl",
  "sizeTier",
  "formats",
  "updateFrequency",
  "geographyLevel",
  "timeCoverage",
  "keyVariables",
  "bestFor",
  "limitations",
  "pairsWith",
  "exampleUses",
  "flags",
  "seriesSlug",
  "sourceKind",
  "academicBadges",
  "authors",
  "publicationYear",
  "dataDoi",
  "paperDoi",
  "repository",
] as const;

const rows = datasets.map((d) => {
  const series = getSeriesForDataset(d.slug);
  const clusterId = normalizeClusterId(d.cluster);
  const cluster = getCluster(d.cluster);
  const themes = getThemesForDataset(d.slug);
  return [
    d.slug,
    d.title,
    d.shortTitle,
    d.abbreviations?.join("; ") ?? "",
    d.host,
    d.institution,
    clusterId,
    cluster?.name ?? "",
    themes.join("; "),
    d.categories?.join("; ") ?? "",
    d.technicalTags?.join("; ") ?? "",
    d.accessType,
    d.accessUrl ?? "",
    d.docsUrl ?? "",
    d.sizeTier,
    d.formats?.join("; ") ?? "",
    d.updateFrequency,
    d.geographyLevel?.join("; ") ?? "",
    d.timeCoverage,
    d.keyVariables?.join("; ") ?? "",
    d.bestFor,
    d.limitations,
    d.pairsWith?.join("; ") ?? "",
    d.exampleUses,
    d.flags?.join("; ") ?? "",
    series?.slug ?? d.seriesSlug ?? "",
    d.sourceKind ?? "",
    d.academicBadges?.join("; ") ?? "",
    d.authors ?? "",
    d.publicationYear ?? "",
    d.dataDoi ?? "",
    d.paperDoi ?? "",
    d.repository ?? "",
  ]
    .map(csvEscape)
    .join(",");
});

const outPath = resolve(process.cwd(), "content/datasets-catalog.csv");
const csv = `${headers.join(",")}\n${rows.join("\n")}\n`;
writeFileSync(outPath, csv, "utf8");
console.log(`Wrote ${outPath}`);
console.log(`Datasets: ${rows.length}`);
