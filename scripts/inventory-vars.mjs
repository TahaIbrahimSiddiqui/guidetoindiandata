import { writeFileSync, mkdirSync } from "node:fs";

// Use dynamic import of compiled path via tsx when run with tsx
const scratch =
  process.env.SCRATCH ||
  "C:/Users/TAHARI~1/AppData/Local/Temp/grok-goal-ef2d1852ccd5/implementer";

mkdirSync(scratch, { recursive: true });

const { datasets } = await import("../src/data/datasets.ts");
const { GUIDES_BY_SLUG } = await import("../src/data/datasetGuides.ts");
const { resolveVariables } = await import("../src/lib/variables.ts");

const inv = datasets.map((d) => {
  const v = resolveVariables(d);
  const guides = GUIDES_BY_SLUG[d.slug] ?? [];
  const urls = [
    d.variablesUrl,
    d.docsUrl,
    d.accessUrl,
    ...guides.map((g) => g.url),
  ].filter(Boolean);
  const uniq = [...new Set(urls)];
  let host = "none";
  try {
    if (uniq[0]) host = new URL(uniq[0]).hostname.replace(/^www\./, "");
  } catch {}
  const live =
    /Chrome|chrome|Scraped|scraped|NADA data dictionary|SCHEMA\.md|README column|Chrome-scraped|Playwright|Live-fetched/i.test(
      v.source,
    );
  return {
    slug: d.slug,
    host,
    live,
    url: v.url || uniq[0] || "",
    urls: uniq.slice(0, 5),
    n: v.entries.length,
    source: v.source.slice(0, 120),
  };
});

const byHost = {};
for (const r of inv) {
  (byHost[r.host] ||= []).push(r);
}

const out = {
  total: inv.length,
  live: inv.filter((x) => x.live).length,
  need: inv.filter((x) => !x.live).length,
  needSlugs: inv.filter((x) => !x.live).map((x) => x.slug),
  byHost: Object.fromEntries(
    Object.entries(byHost).map(([h, a]) => [
      h,
      {
        count: a.length,
        need: a.filter((x) => !x.live).map((x) => x.slug),
        live: a.filter((x) => x.live).map((x) => x.slug),
      },
    ]),
  ),
  rows: inv,
};

writeFileSync(`${scratch}/inventory.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ total: out.total, live: out.live, need: out.need }, null, 2));
console.log(
  Object.entries(byHost)
    .sort((a, b) => b[1].length - a[1].length)
    .map(
      ([h, a]) =>
        `${a.length}\t${h}\tneed=${a.filter((x) => !x.live).length}`,
    )
    .join("\n"),
);
