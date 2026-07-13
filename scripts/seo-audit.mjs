/**
 * Lightweight SEO audit for Indian Data Guide.
 * Checks catalog metadata readiness without network calls.
 *
 * Run: npx tsx scripts/seo-audit.mjs
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { datasets } from "../src/data/datasets.ts";
import { seriesList } from "../src/data/series.ts";
import { DATASET_SEO } from "../src/data/datasetSeo.ts";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "content", "automation");
mkdirSync(OUT_DIR, { recursive: true });

const issues = [];
const warnings = [];

function issue(level, code, message, slug) {
  const row = { level, code, message, slug: slug || null };
  if (level === "error") issues.push(row);
  else warnings.push(row);
}

// Guard: marketing experience files should not contain SEO FAQ dumps
const marketingGuards = [
  "src/components/LandingExperience.tsx",
  "src/components/MapExperience.tsx",
  "src/components/ObsidianGraphFull.tsx",
];
for (const rel of marketingGuards) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) {
    issue("error", "missing-marketing-file", `Expected ${rel}`, null);
    continue;
  }
  const src = readFileSync(p, "utf8");
  if (/FAQPage|seoDescription|application\/ld\+json/i.test(src)) {
    issue(
      "error",
      "marketing-seo-clutter",
      `${rel} contains SEO/JSON-LD body — keep marketing experience clean`,
      null,
    );
  }
}

// Required SEO modules
for (const rel of [
  "src/lib/site.ts",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/lib/seo/jsonLd.ts",
  "src/lib/seo/metadata.ts",
]) {
  if (!existsSync(join(ROOT, rel))) {
    issue("error", "missing-seo-module", `Missing ${rel}`, null);
  }
}

const titleCounts = new Map();
const descCounts = new Map();

for (const d of datasets) {
  const seo = DATASET_SEO[d.slug];
  const title = (seo?.seoTitle || `${d.shortTitle} data India`).trim();
  const desc = (
    seo?.seoDescription ||
    d.summary ||
    d.bestFor ||
    ""
  ).trim();

  if (!d.summary?.trim() && !seo?.seoDescription) {
    issue("warn", "thin-summary", "No summary and no seoDescription", d.slug);
  }
  if (desc.length < 40) {
    issue("warn", "short-description", `Description only ${desc.length} chars`, d.slug);
  }
  if (desc.length > 200 && seo?.seoDescription) {
    issue("warn", "long-seo-description", "seoDescription > 200 chars", d.slug);
  }
  if (title.length > 70 && seo?.seoTitle) {
    issue("warn", "long-seo-title", "seoTitle > 70 chars", d.slug);
  }

  titleCounts.set(title.toLowerCase(), [
    ...(titleCounts.get(title.toLowerCase()) || []),
    d.slug,
  ]);
  if (desc) {
    descCounts.set(desc.toLowerCase(), [
      ...(descCounts.get(desc.toLowerCase()) || []),
      d.slug,
    ]);
  }
}

for (const [title, slugs] of titleCounts) {
  if (slugs.length > 1) {
    issue(
      "warn",
      "duplicate-title",
      `Duplicate title "${title}" on ${slugs.join(", ")}`,
      slugs[0],
    );
  }
}

for (const [desc, slugs] of descCounts) {
  if (slugs.length > 1 && desc.length > 50) {
    issue(
      "warn",
      "duplicate-description",
      `Duplicate description on ${slugs.join(", ")}`,
      slugs[0],
    );
  }
}

for (const s of seriesList) {
  if (!s.description || s.description.trim().length < 40) {
    issue("warn", "thin-series", "Series description short", s.slug);
  }
}

const report = {
  ranAt: new Date().toISOString(),
  datasetCount: datasets.length,
  seriesCount: seriesList.length,
  seoOverrides: Object.keys(DATASET_SEO).length,
  errors: issues,
  warnings,
  ok: issues.length === 0,
};

writeFileSync(
  join(OUT_DIR, "seo-audit-latest.json"),
  JSON.stringify(report, null, 2),
);

const md = [
  `# SEO audit`,
  "",
  `- Datasets: ${report.datasetCount}`,
  `- Series: ${report.seriesCount}`,
  `- SEO overrides: ${report.seoOverrides}`,
  `- Errors: ${issues.length}`,
  `- Warnings: ${warnings.length}`,
  "",
  "## Errors",
  "",
  ...(issues.length
    ? issues.map((i) => `- **${i.code}** ${i.slug ? `\`${i.slug}\` ` : ""}${i.message}`)
    : ["- none"]),
  "",
  "## Warnings",
  "",
  ...(warnings.length
    ? warnings
        .slice(0, 40)
        .map((i) => `- **${i.code}** ${i.slug ? `\`${i.slug}\` ` : ""}${i.message}`)
    : ["- none"]),
  "",
];

writeFileSync(join(OUT_DIR, "seo-audit-latest.md"), md.join("\n"));

console.log(
  JSON.stringify({
    ok: report.ok,
    errors: issues.length,
    warnings: warnings.length,
    datasets: datasets.length,
    seoOverrides: report.seoOverrides,
  }),
);

if (issues.length) process.exit(1);
