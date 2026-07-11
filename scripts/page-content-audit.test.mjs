/**
 * Gating tests: every catalog record has required content; every route data
 * source has non-empty primary fields. Drives real datasets + resolveGuides +
 * resolveVariables (not reimplemented copies).
 *
 * Run: npx tsx scripts/page-content-audit.test.mjs
 * Exit 0 = all assertions pass.
 */
import { datasets } from "../src/data/datasets.ts";
import { resolveGuides } from "../src/lib/guides.ts";
import { resolveVariables } from "../src/lib/variables.ts";
import { seriesList } from "../src/data/series.ts";
import { domainClusters } from "../src/lib/graphData.ts";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

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
const THIN_MIN = 20;

let fails = 0;
const messages = [];

function assert(cond, msg) {
  if (!cond) {
    fails++;
    messages.push("FAIL: " + msg);
  }
}

function isEmpty(v) {
  return v == null || String(v).trim() === "";
}

// Criterion 1 + 2: every dataset
const hardFails = [];
const noAccess = [];
const thin = [];
for (const d of datasets) {
  const failed = [];
  for (const f of REQUIRED_STRING_FIELDS) {
    if (isEmpty(d[f])) failed.push(f);
  }
  for (const f of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(d[f]) || d[f].length === 0) failed.push(f);
  }
  const guides = resolveGuides(d);
  if (guides.length < 1) failed.push("guides");
  const vars = resolveVariables(d);
  if (!vars.entries?.length) failed.push("variables");
  if (isEmpty(vars.source)) failed.push("variables.source");
  if (vars.entries?.some((e) => isEmpty(e.name) || isEmpty(e.label))) {
    failed.push("variables.name/label");
  }
  if (failed.length) hardFails.push({ slug: d.slug, failed });

  const hasLink = !!(d.accessUrl || d.docsUrl || d.dataDoi);
  if (!hasLink) noAccess.push(d.slug);

  for (const f of ["bestFor", "limitations", "exampleUses"]) {
    const s = String(d[f] ?? "").trim();
    if (s && s.length < THIN_MIN) thin.push({ slug: d.slug, f, len: s.length });
  }
}

assert(hardFails.length === 0, `hard field fails: ${hardFails.length}`);
assert(noAccess.length === 0, `missing access links: ${noAccess.join(", ")}`);
assert(thin.length === 0, `thin editorial fields: ${JSON.stringify(thin)}`);
assert(datasets.length >= 100, `catalog size too small: ${datasets.length}`);

// Criterion 3: series + clusters
for (const s of seriesList) {
  assert(!isEmpty(s.title), `series ${s.slug} title`);
  assert(!isEmpty(s.description), `series ${s.slug} description`);
  assert(!isEmpty(s.host), `series ${s.slug} host`);
  assert(s.waves?.length >= 1, `series ${s.slug} waves`);
}
for (const c of domainClusters) {
  assert(!isEmpty(c.name), `cluster ${c.id} name`);
  assert(!isEmpty(c.description), `cluster ${c.id} description`);
}

// Page modules present with primary blocks
const pages = [
  ["src/app/(marketing)/page.tsx", ["LandingExperience"]],
  ["src/app/(marketing)/map/page.tsx", ["MapExperience"]],
  ["src/app/(catalog)/explore/page.tsx", ["ExploreClient"]],
  ["src/components/ExploreClient.tsx", ["Explore", "filter"]],
  ["src/app/(catalog)/clusters/page.tsx", ["export"]],
  ["src/app/(catalog)/series/page.tsx", ["export"]],
  ["src/app/(catalog)/series/[slug]/page.tsx", ["description"]],
  ["src/app/(catalog)/academic/page.tsx", ["export"]],
  ["src/app/(catalog)/about/page.tsx", ["What each record", "Caveats"]],
  ["src/app/privacy/page.tsx", ["Privacy"]],
  [
    "src/app/(catalog)/datasets/[slug]/page.tsx",
    ["resolveGuides", "resolveVariables", "bestFor", "limitations", "Open access portal"],
  ],
];
for (const [rel, markers] of pages) {
  assert(existsSync(rel), `missing page ${rel}`);
  if (existsSync(rel)) {
    const text = readFileSync(rel, "utf8");
    for (const m of markers) {
      assert(text.includes(m), `${rel} missing marker: ${m}`);
    }
  }
}

// Spot-check access CTAs in page source path for previously-empty slugs
const spot = ["dlhs-1", "lasi-wave-1", "nas-2021", "wpi", "jjm-dashboard"];
for (const slug of spot) {
  const d = datasets.find((x) => x.slug === slug);
  assert(!!d, `spot missing slug ${slug}`);
  assert(!!(d.accessUrl || d.docsUrl || d.dataDoi), `spot no access ${slug}`);
  // page module renders Access CTA when accessUrl present
  assert(!!d.accessUrl, `spot accessUrl for CTA ${slug}`);
}

const report = {
  total: datasets.length,
  hardFails,
  noAccess,
  thin,
  fails,
  messages,
  pass: fails === 0,
};
writeFileSync(
  `${SCRATCH}/page-content-test-report.json`,
  JSON.stringify(report, null, 2),
);
const summaryLine = `SUMMARY pass=${fails === 0} total=${datasets.length} fails=${fails} hardFails=${hardFails.length} noAccess=${noAccess.length} thin=${thin.length}\n`;
writeFileSync(
  `${SCRATCH}/content-verify.log`,
  (messages.length ? messages.join("\n") + "\n\n" : "") + summaryLine,
);

if (fails) {
  console.error(messages.join("\n"));
  console.error(`\n${fails} assertion(s) failed`);
  process.exit(1);
}
console.log(
  `PASS page-content-audit.test.mjs — ${datasets.length} datasets, ${seriesList.length} series, ${domainClusters.length} clusters, ${spot.length} access spot-checks`,
);
process.exit(0);
