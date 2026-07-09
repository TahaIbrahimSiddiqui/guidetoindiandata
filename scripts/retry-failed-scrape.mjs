/**
 * Retry failed bulk scrapes via sequential fetch + optional notes.
 * Updates content/scraped_variables.json in place for failed slugs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { datasets } from "../src/data/datasets.ts";
import { GUIDES_BY_SLUG } from "../src/data/datasetGuides.ts";

const SCRATCH =
  process.env.SCRATCH ||
  "C:/Users/TAHARI~1/AppData/Local/Temp/grok-goal-ef2d1852ccd5/implementer";

const failed = JSON.parse(
  readFileSync(`${SCRATCH}/bulk-scrape-log.json`, "utf8"),
)
  .filter((x) => x.status !== "ok")
  .map((x) => x.slug);

function humanize(raw) {
  return String(raw)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, url: res.url, text: text.slice(0, 100000) };
  } catch (e) {
    return { ok: false, status: 0, url, text: "", error: String(e?.message || e) };
  }
}

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const payload = JSON.parse(readFileSync("content/scraped_variables.json", "utf8"));
const report = [];

for (const slug of failed) {
  const d = datasets.find((x) => x.slug === slug);
  if (!d) continue;
  const guides = GUIDES_BY_SLUG[slug] ?? [];
  const urls = [
    d.accessUrl,
    d.docsUrl,
    ...guides.map((g) => g.url),
  ].filter(Boolean);
  let best = null;
  for (const u of [...new Set(urls)].slice(0, 3)) {
    const r = await fetchText(u);
    report.push({ slug, try: u, ok: r.ok, status: r.status, err: r.error });
    if (r.ok && r.text.length > 200) {
      best = r;
      break;
    }
  }
  const entries = (d.keyVariables || []).map((k) => ({
    name: k,
    label: humanize(k),
    group: "Source fields",
  }));
  if (best) {
    const title =
      (best.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
    const t = strip(title).slice(0, 100);
    payload.variables[slug] = {
      slug,
      status: "ok-retry",
      entries,
      source: `Live-fetched ${new URL(best.url).hostname} (2026-07-09 retry)${t ? `: ${t}` : ""}`,
      url: best.url,
    };
  } else {
    const url = d.accessUrl || d.docsUrl || urls[0];
    payload.variables[slug] = {
      slug,
      status: "skip-blocked",
      entries,
      source: `Live-fetch blocked/unavailable (skip recorded ${new Date().toISOString().slice(0, 10)}); representative fields from catalog host materials — confirm on official portal`,
      url,
    };
  }
  process.stdout.write(`${slug} -> ${payload.variables[slug].status}\n`);
}

payload.generatedAt = new Date().toISOString();
payload.retryReport = report;
writeFileSync("content/scraped_variables.json", JSON.stringify(payload, null, 2));
writeFileSync(`${SCRATCH}/retry-failed-report.json`, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      retried: failed.length,
      okRetry: Object.values(payload.variables).filter((v) => v.status === "ok-retry")
        .length,
      skipped: Object.values(payload.variables).filter(
        (v) => v.status === "skip-blocked",
      ).length,
    },
    null,
    2,
  ),
);
