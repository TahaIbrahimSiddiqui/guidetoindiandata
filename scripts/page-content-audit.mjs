/**
 * Full page/content audit against plan acceptance criteria.
 * Uses real datasets + resolveGuides + resolveVariables (not reimplemented).
 *
 * Run: npx tsx scripts/page-content-audit.mjs
 * Env: SCRATCH=... (defaults to implementer scratch)
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { datasets } from "../src/data/datasets.ts";
import { resolveGuides } from "../src/lib/guides.ts";
import { resolveVariables } from "../src/lib/variables.ts";
import { seriesList } from "../src/data/series.ts";
import { domainClusters } from "../src/lib/graphData.ts";
import { getDatasetUseCatalog } from "../src/lib/datasetUses.ts";
import {
  DATASET_USE_DISCOVERY_SOURCES,
  DATASET_USE_EVIDENCE_KINDS,
  DATASET_USE_RELATIONSHIPS,
  RESEARCH_WORK_KINDS,
} from "../src/types/researchUse.ts";

const SCRATCH =
  process.env.SCRATCH ||
  "C:/Users/TAHARI~1/AppData/Local/Temp/grok-goal-a2ca30e9109a/implementer";
mkdirSync(SCRATCH, { recursive: true });

const REQUIRED_STRING_FIELDS = [
  "title",
  "shortTitle",
  "summary",
  "accessType",
  "host",
  "institution",
  "timeCoverage",
  "updateFrequency",
  "sizeTier",
  "bestFor",
  "limitations",
  "exampleUses",
];

const REQUIRED_ARRAY_FIELDS = [
  "categories",
  "geographyLevel",
  "technicalTags",
  "formats",
  "keyVariables",
  "pairsWith",
];

const THIN_MIN = 20; // limitations/bestFor/exampleUses under this are "thin" unless intentional label

function isEmptyString(v) {
  return v == null || String(v).trim() === "";
}

function auditDataset(d) {
  const failedFields = [];
  const thinFields = [];

  for (const f of REQUIRED_STRING_FIELDS) {
    if (isEmptyString(d[f])) failedFields.push(f);
  }
  for (const f of REQUIRED_ARRAY_FIELDS) {
    const arr = d[f];
    if (!Array.isArray(arr) || arr.length === 0) failedFields.push(f);
    else if (arr.some((x) => isEmptyString(x)))
      failedFields.push(`${f}[empty-item]`);
  }

  for (const f of ["bestFor", "limitations", "exampleUses"]) {
    const s = String(d[f] ?? "").trim();
    if (s && s.length < THIN_MIN)
      thinFields.push({ field: f, length: s.length, value: s });
  }

  const guides = resolveGuides(d);
  if (guides.length < 1) failedFields.push("guides");

  const vars = resolveVariables(d);
  if (!vars.entries || vars.entries.length < 1)
    failedFields.push("variables.entries");
  if (isEmptyString(vars.source)) failedFields.push("variables.source");
  if (
    vars.entries?.some((e) => isEmptyString(e.name) || isEmptyString(e.label))
  ) {
    failedFields.push("variables.name/label");
  }

  const hasAccessLink = !!(d.accessUrl || d.docsUrl || d.dataDoi);
  const accessOk =
    hasAccessLink || (guides.length >= 1 && !isEmptyString(d.host));

  return {
    slug: d.slug,
    failedFields,
    thinFields,
    guideCount: guides.length,
    varCount: vars.entries?.length ?? 0,
    varSource: (vars.source || "").slice(0, 100),
    hasAccessLink,
    accessOk,
    accessUrl: d.accessUrl || null,
    docsUrl: d.docsUrl || null,
    dataDoi: d.dataDoi || null,
    host: d.host,
    hardFail: failedFields.length > 0,
  };
}

const rows = datasets.map(auditDataset);
const slugCounts = new Map();
const titleCounts = new Map();
for (const d of datasets) {
  slugCounts.set(d.slug, (slugCounts.get(d.slug) || 0) + 1);
  titleCounts.set(
    String(d.title || "")
      .trim()
      .toLowerCase(),
    (titleCounts.get(
      String(d.title || "")
        .trim()
        .toLowerCase(),
    ) || 0) + 1,
  );
}
const duplicateSlugs = [...slugCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([slug]) => slug);
const duplicateTitles = [...titleCounts.entries()]
  .filter(([title, count]) => title && count > 1)
  .map(([title]) => title);
const hardFails = rows.filter((r) => r.hardFail);
const noAccessLink = rows.filter((r) => !r.hasAccessLink);
const thinRows = rows.filter((r) => r.thinFields.length > 0);
const residualSkips = noAccessLink
  .filter((r) => r.accessOk && !r.hardFail)
  .map((r) => ({
    slug: r.slug,
    reason:
      "No public accessUrl/docsUrl/dataDoi after catalog; host + guides retained",
    host: r.host,
    guideCount: r.guideCount,
  }));
const accessHardFails = noAccessLink.filter((r) => !r.accessOk || r.hardFail);

// Research-use catalog integrity and full dataset scan-status coverage.
const useCatalog = getDatasetUseCatalog();
const datasetSlugSet = new Set(datasets.map((d) => d.slug));
const useCatalogFailures = [];
const workDoiOwners = new Map();
const workUrlOwners = new Map();
const validDate = (value) =>
  value === null || /^\d{4}-\d{2}-\d{2}$/.test(String(value));
const validHttpUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

for (const dataset of datasets) {
  const status = useCatalog.datasets[dataset.slug];
  if (!status) {
    useCatalogFailures.push(`${dataset.slug}: missing scan status`);
    continue;
  }
  if (!validDate(status.scholarlyCheckedAt)) {
    useCatalogFailures.push(`${dataset.slug}: invalid scholarlyCheckedAt`);
  }
  if (!validDate(status.webCheckedAt)) {
    useCatalogFailures.push(`${dataset.slug}: invalid webCheckedAt`);
  }
  if (!Array.isArray(status.uses) || status.uses.length > 12) {
    useCatalogFailures.push(`${dataset.slug}: uses must contain 0-12 items`);
    continue;
  }
  const seenWorkIds = new Set();
  for (const use of status.uses) {
    if (seenWorkIds.has(use.workId)) {
      useCatalogFailures.push(`${dataset.slug}: duplicate work ${use.workId}`);
    }
    seenWorkIds.add(use.workId);
    if (!useCatalog.works[use.workId]) {
      useCatalogFailures.push(`${dataset.slug}: missing work ${use.workId}`);
    }
    if (!DATASET_USE_RELATIONSHIPS.includes(use.relationship)) {
      useCatalogFailures.push(`${dataset.slug}: invalid relationship`);
    }
    if (!DATASET_USE_EVIDENCE_KINDS.includes(use.evidenceKind)) {
      useCatalogFailures.push(`${dataset.slug}: invalid evidence kind`);
    }
    if (!validHttpUrl(use.evidenceUrl) || isEmptyString(use.useSummary)) {
      useCatalogFailures.push(`${dataset.slug}: incomplete evidence for ${use.workId}`);
    }
    if (
      !Array.isArray(use.discoveredVia) ||
      use.discoveredVia.length === 0 ||
      use.discoveredVia.some(
        (source) => !DATASET_USE_DISCOVERY_SOURCES.includes(source),
      )
    ) {
      useCatalogFailures.push(`${dataset.slug}: invalid discovery source`);
    }
  }
}

for (const slug of Object.keys(useCatalog.datasets)) {
  if (!datasetSlugSet.has(slug)) {
    useCatalogFailures.push(`${slug}: scan status has no matching dataset`);
  }
}

for (const [workId, work] of Object.entries(useCatalog.works)) {
  if (
    work.id !== workId ||
    isEmptyString(work.title) ||
    !Array.isArray(work.authors) ||
    !RESEARCH_WORK_KINDS.includes(work.kind) ||
    !validHttpUrl(work.url)
  ) {
    useCatalogFailures.push(`${workId}: invalid work metadata`);
  }
  if (work.doi) {
    const doi = String(work.doi).toLowerCase().replace(/^https?:\/\/doi\.org\//, "");
    if (workDoiOwners.has(doi)) {
      useCatalogFailures.push(
        `${workId}: duplicate DOI also used by ${workDoiOwners.get(doi)}`,
      );
    }
    workDoiOwners.set(doi, workId);
  }
  const canonicalUrl = String(work.url).toLowerCase().replace(/\/$/, "");
  if (workUrlOwners.has(canonicalUrl)) {
    useCatalogFailures.push(
      `${workId}: duplicate URL also used by ${workUrlOwners.get(canonicalUrl)}`,
    );
  }
  workUrlOwners.set(canonicalUrl, workId);
}

const report = {
  generatedAt: new Date().toISOString(),
  total: datasets.length,
  duplicates: {
    slugs: duplicateSlugs,
    titles: duplicateTitles,
  },
  hardFailCount: hardFails.length,
  hardFails: hardFails.map((r) => ({
    slug: r.slug,
    failedFields: r.failedFields,
  })),
  access: {
    withLink: rows.filter((r) => r.hasAccessLink).length,
    withoutLink: noAccessLink.length,
    residualSkips,
    accessHardFails: accessHardFails.map((r) => r.slug),
  },
  thin: {
    count: thinRows.length,
    rows: thinRows.map((r) => ({ slug: r.slug, thinFields: r.thinFields })),
  },
  researchUses: {
    works: Object.keys(useCatalog.works).length,
    statuses: Object.keys(useCatalog.datasets).length,
    failures: useCatalogFailures,
  },
  rows,
};

writeFileSync(
  `${SCRATCH}/page-content-audit.json`,
  JSON.stringify(report, null, 2),
);
writeFileSync(
  `${SCRATCH}/access-links.json`,
  JSON.stringify(
    {
      withLink: report.access.withLink,
      withoutLink: report.access.withoutLink,
      residualSkips: report.access.residualSkips,
      accessHardFails: report.access.accessHardFails,
    },
    null,
    2,
  ),
);

// ── Routes / series / clusters check ──────────────────────────────
const routeChecks = [];
function check(name, ok, detail = "") {
  routeChecks.push({ name, ok: !!ok, detail });
}

// Series
for (const s of seriesList) {
  check(
    `series:${s.slug}:description`,
    !isEmptyString(s.description),
    (s.description || "").slice(0, 60),
  );
  check(`series:${s.slug}:host`, !isEmptyString(s.host), s.host);
  check(
    `series:${s.slug}:waves`,
    Array.isArray(s.waves) && s.waves.length >= 1,
    `waves=${s.waves?.length ?? 0}`,
  );
  check(`series:${s.slug}:title`, !isEmptyString(s.title), s.title);
}

// Clusters
for (const c of domainClusters) {
  check(`cluster:${c.id}:name`, !isEmptyString(c.name), c.name);
  check(
    `cluster:${c.id}:description`,
    !isEmptyString(c.description),
    (c.description || "").slice(0, 60),
  );
}

// Page modules exist and have primary copy markers
const root = process.cwd();
const pageFiles = [
  {
    path: "src/app/(marketing)/page.tsx",
    markers: ["LandingExperience", "export"],
  },
  {
    path: "src/app/(marketing)/map/page.tsx",
    markers: ["MapExperience", "export"],
  },
  {
    path: "src/app/(catalog)/explore/page.tsx",
    markers: ["ExploreClient", "export"],
  },
  {
    path: "src/components/ExploreClient.tsx",
    markers: ["Explore", "filter", "search"],
  },
  {
    path: "src/app/(catalog)/clusters/page.tsx",
    markers: ["cluster", "export"],
  },
  { path: "src/app/(catalog)/series/page.tsx", markers: ["series", "export"] },
  {
    path: "src/app/(catalog)/series/[slug]/page.tsx",
    markers: ["description", "export"],
  },
  { path: "src/app/(catalog)/academic/page.tsx", markers: ["export"] },
  {
    path: "src/app/(catalog)/about/page.tsx",
    markers: ["About", "What each record", "Caveats"],
  },
  { path: "src/app/privacy/page.tsx", markers: ["Privacy", "export"] },
  {
    path: "src/app/(catalog)/datasets/[slug]/page.tsx",
    markers: ["bestFor", "limitations", "resolveGuides", "resolveVariables"],
  },
];

for (const pf of pageFiles) {
  const full = join(root, pf.path);
  const exists = existsSync(full);
  if (!exists) {
    check(`page:${pf.path}`, false, "missing file");
    continue;
  }
  const text = readFileSync(full, "utf8");
  const missing = pf.markers.filter((m) => !text.includes(m));
  // empty title/lede strings in source
  const emptyTitle =
    /title:\s*["']\s*["']/.test(text) || /page-title[^>]*>\s*</.test(text);
  const emptyLede = /page-lede[^>]*>\s*</.test(text);
  check(
    `page:${pf.path}`,
    missing.length === 0 && !emptyTitle && !emptyLede,
    missing.length
      ? `missing markers: ${missing.join(",")}`
      : emptyTitle || emptyLede
        ? "empty title/lede"
        : "ok",
  );
}

// Landing / Explore / Map content strings in components
const landing = readFileSync(
  join(root, "src/components/LandingExperience.tsx"),
  "utf8",
);
check(
  "landing:primary-copy",
  landing.length > 500 && /Explore|dataset|map/i.test(landing),
  `chars=${landing.length}`,
);
const explore = readFileSync(
  join(root, "src/components/ExploreClient.tsx"),
  "utf8",
);
check(
  "explore:title-filters",
  /Explore|search|filter/i.test(explore) && explore.length > 400,
  `chars=${explore.length}`,
);
const mapExp = readFileSync(
  join(root, "src/components/MapExperience.tsx"),
  "utf8",
);
check("map:experience", mapExp.length > 200, `chars=${mapExp.length}`);
const privacy = readFileSync(join(root, "src/app/privacy/page.tsx"), "utf8");
check(
  "privacy:body",
  privacy.length > 300 && !/TODO|TBD|FIXME/.test(privacy),
  `chars=${privacy.length}`,
);

const routesTxt = routeChecks
  .map(
    (c) =>
      `${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.detail ? " — " + c.detail : ""}`,
  )
  .join("\n");
const routesSummary = {
  total: routeChecks.length,
  pass: routeChecks.filter((c) => c.ok).length,
  fail: routeChecks.filter((c) => !c.ok).length,
  fails: routeChecks.filter((c) => !c.ok),
};
writeFileSync(
  `${SCRATCH}/routes-content-check.txt`,
  `Routes/content structural check\n${JSON.stringify(routesSummary, null, 2)}\n\n${routesTxt}\n`,
);

const summary = {
  total: report.total,
  hardFailCount: report.hardFailCount,
  withoutAccessLink: report.access.withoutLink,
  residualSkipCount: residualSkips.length,
  thinCount: report.thin.count,
  routesFail: routesSummary.fail,
  researchUseFailures: useCatalogFailures,
  hardFailSlugs: hardFails.map((r) => r.slug),
  noAccessSlugs: noAccessLink.map((r) => r.slug),
  thinSlugs: thinRows.map((r) => r.slug),
  duplicateSlugs,
  duplicateTitles,
};

console.log(JSON.stringify(summary, null, 2));

const exitCode =
  report.hardFailCount === 0 &&
  duplicateSlugs.length === 0 &&
  duplicateTitles.length === 0 &&
  accessHardFails.length === 0 &&
  useCatalogFailures.length === 0 &&
  routesSummary.fail === 0
    ? 0
    : 1;
process.exitCode = exitCode;
