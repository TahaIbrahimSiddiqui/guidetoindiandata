import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { datasets } from "../src/data/datasets.ts";
import { resolveVariables } from "../src/lib/variables.ts";

const SCRATCH =
  process.env.SCRATCH ||
  "C:/Users/TAHARI~1/AppData/Local/Temp/grok-goal-ef2d1852ccd5/implementer";

let ok = 0,
  noUrl = 0,
  noLabel = 0;
const bad = [];
const rows = [];
for (const d of datasets) {
  const v = resolveVariables(d);
  if (v.entries.length >= 1 && v.source) ok++;
  else bad.push(d.slug);
  if (!v.url) noUrl++;
  if (v.entries.some((e) => !e.name || !e.label)) noLabel++;
  rows.push({
    slug: d.slug,
    n: v.entries.length,
    url: v.url || null,
    live: /^Live-fetched/i.test(v.source),
    source: v.source.slice(0, 120),
  });
}

const logPath = `${SCRATCH}/bulk-scrape-log.json`;
let failedBulk = [];
if (existsSync(logPath)) {
  const log = JSON.parse(readFileSync(logPath, "utf8"));
  failedBulk = log.filter((x) => x.status !== "ok").map((x) => x.slug);
}

const out = {
  total: datasets.length,
  ok,
  noUrl,
  noLabel,
  bad,
  failedBulk,
  liveCount: rows.filter((r) => r.live).length,
  rows,
};
writeFileSync(`${SCRATCH}/variables-coverage.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ total: out.total, ok, noUrl, noLabel, bad, liveCount: out.liveCount, failedBulkCount: failedBulk.length, failedBulk }, null, 2));
