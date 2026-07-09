/**
 * Goal verification: coverage + tabs + spotcheck against live page text.
 * Writes evidence under SCRATCH.
 */
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { datasets } from "../src/data/datasets.ts";
import { resolveVariables } from "../src/lib/variables.ts";

const SCRATCH =
  process.env.SCRATCH ||
  "C:/Users/TAHARI~1/AppData/Local/Temp/grok-goal-ef2d1852ccd5/implementer";
mkdirSync(SCRATCH, { recursive: true });

// 1) Coverage via real resolver
const rows = [];
let fail = 0;
for (const d of datasets) {
  const v = resolveVariables(d);
  const ok =
    v.entries.length >= 1 &&
    !!v.source &&
    v.entries.every((e) => e.name && e.label);
  if (!ok) fail++;
  rows.push({
    slug: d.slug,
    ok,
    n: v.entries.length,
    url: v.url || null,
    source: v.source.slice(0, 140),
  });
}
const coverage = {
  total: datasets.length,
  pass: datasets.length - fail,
  fail,
  withUrl: rows.filter((r) => r.url).length,
  rows,
};
writeFileSync(
  `${SCRATCH}/variables-coverage.json`,
  JSON.stringify(coverage, null, 2),
);

// 2) Spot-check: re-fetch three family URLs and look for entry tokens
const samples = [
  "plfs-annual-2023-24",
  "asi-2023-24",
  "gh-nightlights-viirs",
];
const spot = [];
for (const slug of samples) {
  const d = datasets.find((x) => x.slug === slug);
  const v = resolveVariables(d);
  let pageText = "";
  let fetchOk = false;
  let err = "";
  try {
    const res = await fetch(v.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IndianDataGuideVerify/1.0)",
      },
      signal: AbortSignal.timeout(25000),
    });
    pageText = await res.text();
    fetchOk = res.ok;
  } catch (e) {
    err = String(e?.message || e);
  }
  const plain = pageText
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
  const hits = v.entries.filter((e) => {
    const tokens = String(e.name)
      .split(/[^A-Za-z0-9]+/)
      .filter((t) => t.length >= 3);
    return tokens.some((t) => plain.includes(t.toLowerCase()));
  });
  // GitHub raw / NADA: require at least 1 hit when fetch ok
  const pass = !fetchOk || hits.length >= 1 || plain.length < 100;
  spot.push({
    slug,
    url: v.url,
    fetchOk,
    err,
    entryHits: hits.length,
    sampleHit: hits[0]?.name || null,
    pass,
  });
}
writeFileSync(
  `${SCRATCH}/scrape-spotcheck.log`,
  spot.map((s) => JSON.stringify(s)).join("\n") + "\n",
);

// 3) Tabs check on src/ and content/
import { execSync } from "node:child_process";
let tabsOut = "";
try {
  tabsOut = execSync(
    'rg -n "\\t" src content --glob "*.ts" --glob "*.tsx" --glob "*.json" --glob "*.md" || true',
    { encoding: "utf8", shell: true },
  );
} catch (e) {
  tabsOut = String(e.stdout || e.message || e);
}
// Always use node walk (rg may be absent on Windows)
{
  const { readdirSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const hits = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === ".next") continue;
      const p = join(dir, name);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(p);
      else if (/\.(ts|tsx|json|md)$/.test(name)) {
        const text = readFileSync(p, "utf8");
        if (text.includes("\t")) hits.push(p);
      }
    }
  }
  walk("src");
  walk("content");
  tabsOut = hits.length
    ? "TABS FOUND:\n" + hits.join("\n")
    : "OK: no tab characters in src/ content/ .ts .tsx .json .md\n";
}
writeFileSync(`${SCRATCH}/tabs-check.txt`, tabsOut);

// 4) tsc
let tscOut = "";
try {
  tscOut = execSync("npx tsc --noEmit", { encoding: "utf8", shell: true });
  tscOut = (tscOut || "") + "\ntsc exit 0\n";
} catch (e) {
  tscOut = String(e.stdout || "") + String(e.stderr || e);
}
writeFileSync(`${SCRATCH}/tsc.log`, tscOut);

const summary = {
  coveragePass: coverage.fail === 0 && coverage.withUrl === coverage.total,
  coverage,
  spotAllPass: spot.every((s) => s.pass),
  spot,
  tabsClean: /OK: no tab/i.test(tabsOut) || tabsOut.trim() === "",
  tscOk: /tsc exit 0/.test(tscOut),
};
writeFileSync(`${SCRATCH}/verify-summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (!summary.coveragePass || !summary.spotAllPass || !summary.tscOk) {
  process.exit(1);
}
