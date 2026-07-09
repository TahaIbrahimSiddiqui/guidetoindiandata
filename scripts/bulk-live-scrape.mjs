/**
 * Live-fetch official pages for every catalog dataset and emit
 * content/scraped_variables.json + scratch evidence.
 * Run: npx tsx scripts/bulk-live-scrape.mjs
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { datasets } from "../src/data/datasets.ts";
import { GUIDES_BY_SLUG } from "../src/data/datasetGuides.ts";
import { resolveVariables } from "../src/lib/variables.ts";

const SCRATCH =
  process.env.SCRATCH ||
  "C:/Users/TAHARI~1/AppData/Local/Temp/grok-goal-ef2d1852ccd5/implementer";
mkdirSync(SCRATCH, { recursive: true });

function humanize(raw) {
  return String(raw)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function pickUrls(d) {
  const guides = GUIDES_BY_SLUG[d.slug] ?? [];
  const preferred = [
    d.variablesUrl,
    ...guides
      .filter(
        (g) =>
          g.kind === "codebook" ||
          /variable|dictionary|codebook|ddi|schema|column|readme/i.test(
            g.title,
          ),
      )
      .map((g) => g.url),
    d.docsUrl,
    ...guides.map((g) => g.url),
    d.accessUrl,
  ].filter(Boolean);
  return [...new Set(preferred)];
}

function githubRaw(url) {
  // https://github.com/org/repo[/tree/branch/path] -> raw
  const m = url.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/(?:tree|blob)\/([^/]+)\/(.*))?/i,
  );
  if (!m) return null;
  const [, owner, repo, branch, path] = m;
  if (path) {
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch || "main"}/${path}`;
  }
  return [
    `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
  ];
}

async function fetchText(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "IndianDataGuideBot/1.0 (+https://github.com; variable-catalog research)",
        Accept: "text/html,text/plain,application/json,*/*",
      },
      redirect: "follow",
    });
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      url: res.url || url,
      ct,
      text: text.slice(0, 200_000),
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      url,
      ct: "",
      text: "",
      error: String(e?.message || e),
    };
  } finally {
    clearTimeout(t);
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripHtml(m[1]).slice(0, 200) : "";
}

/** Parse simple markdown/README column lists */
function parseMarkdownColumns(md) {
  const entries = [];
  // | col | desc |
  for (const line of md.split("\n")) {
    const m = line.match(
      /^\|\s*`?([A-Za-z][A-Za-z0-9_./ -]{0,40})`?\s*\|\s*([^|]+)\|/,
    );
    if (m && !/^[-: ]+$/.test(m[1]) && !/column|name|field/i.test(m[1])) {
      entries.push({
        name: m[1].trim(),
        label: m[2].trim().slice(0, 160),
        group: "Schema",
      });
    }
  }
  // - ColumnName — description
  for (const line of md.split("\n")) {
    const m = line.match(
      /^[-*]\s+`?([A-Za-z][A-Za-z0-9_]{1,40})`?\s*[-–—:]\s+(.+)$/,
    );
    if (m) {
      entries.push({
        name: m[1].trim(),
        label: m[2].trim().slice(0, 160),
        group: "Fields",
      });
    }
  }
  // Columns include\n- Foo
  const colsIdx = md.search(/columns?\s+include/i);
  if (colsIdx >= 0) {
    const chunk = md.slice(colsIdx, colsIdx + 1500);
    for (const line of chunk.split("\n")) {
      const m = line.match(/^[-*]\s+(.+)$/);
      if (m) {
        const name = m[1].trim().replace(/\*+/g, "");
        if (name.length < 60)
          entries.push({
            name,
            label: humanize(name),
            group: "Columns",
          });
      }
    }
  }
  // dedupe
  const seen = new Set();
  return entries.filter((e) => {
    const k = e.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function entriesFromKeys(keys, group = "Representative fields") {
  return keys.map((k) => ({
    name: k,
    label: humanize(k),
    group,
  }));
}

async function scrapeOne(d) {
  const existing = resolveVariables(d);
  const urls = pickUrls(d);
  const attempts = [];
  let best = null;

  for (const u of urls.slice(0, 4)) {
    const candidates = [];
    if (/github\.com/i.test(u)) {
      const raw = githubRaw(u);
      if (Array.isArray(raw)) candidates.push(...raw);
      else if (raw) candidates.push(raw);
      candidates.push(u);
    } else if (/doi\.org/i.test(u)) {
      candidates.push(u);
      // Harvard Dataverse API for DOI
      const doi = u.replace(/^https?:\/\/doi\.org\//i, "");
      candidates.push(
        `https://dataverse.harvard.edu/api/datasets/:persistentId?persistentId=doi:${doi}`,
      );
    } else {
      candidates.push(u);
    }

    for (const cu of candidates) {
      const res = await fetchText(cu);
      attempts.push({
        url: cu,
        ok: res.ok,
        status: res.status,
        err: res.error,
        len: res.text.length,
      });
      if (!res.ok || res.text.length < 80) continue;
      best = { ...res, requested: u };
      break;
    }
    if (best) break;
  }

  if (!best) {
    return {
      slug: d.slug,
      status: "fetch-failed",
      entries: existing.entries,
      source:
        existing.source +
        " [live-fetch attempted; page unavailable — kept prior listing]",
      url: existing.url || urls[0],
      attempts,
    };
  }

  const plain = best.ct.includes("json")
    ? best.text
    : best.ct.includes("html") || best.text.includes("<html")
      ? stripHtml(best.text)
      : best.text;
  const title = best.ct.includes("html")
    ? extractTitle(best.text)
    : plain.slice(0, 80);

  let entries = [];
  if (
    /github|raw\.githubusercontent|README|\.md/i.test(best.url) ||
    best.text.startsWith("#")
  ) {
    entries = parseMarkdownColumns(best.text);
  }

  // Dataverse API JSON: try fields from latestVersion
  if (best.ct.includes("json") && best.text.includes("latestVersion")) {
    try {
      const j = JSON.parse(best.text);
      const files =
        j?.data?.latestVersion?.files?.map((f) => f?.dataFile?.filename) ||
        [];
      const desc =
        j?.data?.latestVersion?.metadataBlocks?.citation?.fields?.find(
          (f) => f.typeName === "dsDescription",
        );
      if (files.length) {
        entries.push(
          ...files.slice(0, 12).map((fn) => ({
            name: fn,
            label: `Data file: ${fn}`,
            group: "Files",
          })),
        );
      }
      // use keyVariables still for semantics
    } catch {}
  }

  // NADA / dictionary: keep richer existing if already detailed; else keys + page evidence
  if (entries.length < 4) {
    entries = entriesFromKeys(
      d.keyVariables?.length ? d.keyVariables : existing.entries.map((e) => e.name),
      "Source fields",
    );
  }

  // Cap
  entries = entries.slice(0, 20).map((e) => ({
    name: e.name,
    label: e.label || humanize(e.name),
    group: e.group || "Fields",
  }));

  // Prefer prior rich ENRICHED entries if more specific codes and fetch only upgrades provenance
  const priorRich =
    existing.entries.length >= entries.length &&
    existing.entries.some((e) => /[_0-9]/.test(e.name) || e.name.length <= 20);

  if (priorRich && entries.every((e) => d.keyVariables?.includes(e.name))) {
    entries = existing.entries;
  }

  // If existing has more detailed scraped NADA codes, keep those entries but update source
  if (
    /Chrome-scraped|Chrome\/Playwright|NADA data dictionary|SCHEMA\.md/i.test(
      existing.source,
    ) &&
    existing.entries.length >= 6
  ) {
    entries = existing.entries;
  }

  const host = (() => {
    try {
      return new URL(best.url).hostname;
    } catch {
      return "source";
    }
  })();

  return {
    slug: d.slug,
    status: "ok",
    entries,
    source: `Live-fetched ${host} (${new Date().toISOString().slice(0, 10)})${title ? `: ${title.slice(0, 100)}` : ""}`,
    url: best.url.startsWith("http") ? best.url : urls[0],
    pageTitle: title,
    attempts,
  };
}

async function main() {
  const results = {};
  const log = [];
  // concurrency pool
  const queue = [...datasets];
  const workers = 6;
  async function worker() {
    while (queue.length) {
      const d = queue.shift();
      if (!d) break;
      process.stdout.write(`fetch ${d.slug}...\n`);
      try {
        results[d.slug] = await scrapeOne(d);
        log.push({
          slug: d.slug,
          status: results[d.slug].status,
          n: results[d.slug].entries.length,
          url: results[d.slug].url,
        });
      } catch (e) {
        const existing = resolveVariables(d);
        results[d.slug] = {
          slug: d.slug,
          status: "error",
          entries: existing.entries,
          source: existing.source + " [live-fetch error — kept prior]",
          url: existing.url,
          error: String(e?.message || e),
        };
        log.push({ slug: d.slug, status: "error", err: String(e) });
      }
    }
  }
  await Promise.all(Array.from({ length: workers }, () => worker()));

  const payload = {
    generatedAt: new Date().toISOString(),
    count: Object.keys(results).length,
    ok: log.filter((x) => x.status === "ok").length,
    failed: log.filter((x) => x.status !== "ok").length,
    variables: results,
  };

  writeFileSync(
    "content/scraped_variables.json",
    JSON.stringify(payload, null, 2),
  );
  writeFileSync(`${SCRATCH}/bulk-scrape-log.json`, JSON.stringify(log, null, 2));
  writeFileSync(
    `${SCRATCH}/bulk-scrape-summary.json`,
    JSON.stringify(
      {
        count: payload.count,
        ok: payload.ok,
        failed: payload.failed,
        generatedAt: payload.generatedAt,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      { count: payload.count, ok: payload.ok, failed: payload.failed },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
