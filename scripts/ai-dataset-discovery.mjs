/**
 * Discover new India data sources and optionally append high-confidence,
 * deduped records to src/data/discoveredDatasets.ts.
 *
 * Env:
 *   AI_API_KEY | DARTMOUTH_API_KEY  required for AI discovery
 *   AI_PROVIDER                     dartmouth | google | openai
 *   AI_MODEL                        optional
 *   AI_BASE_URL                     default https://chat.dartmouth.edu/api
 *   DISCOVERY_APPLY                 true/false, default false
 *   DISCOVERY_MAX_ADDITIONS         default 2
 *   DISCOVERY_MIN_CONFIDENCE        default 0.86
 *   DISCOVERY_SOURCE_URLS           optional comma-separated URL overrides
 *
 * Run: npx tsx scripts/ai-dataset-discovery.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { datasets } from "../src/data/datasets.ts";
import { discoveredDatasets } from "../src/data/discoveredDatasets.ts";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "content", "automation");
const DISCOVERED_PATH = join(ROOT, "src", "data", "discoveredDatasets.ts");
mkdirSync(OUT_DIR, { recursive: true });

const KEY =
  process.env.AI_API_KEY ||
  process.env.DARTMOUTH_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.OPENAI_API_KEY ||
  "";

const PROVIDER = (process.env.AI_PROVIDER || "dartmouth").toLowerCase();
const DARTMOUTH_BASE = (
  process.env.AI_BASE_URL || "https://chat.dartmouth.edu/api"
).replace(/\/$/, "");
const APPLY = /^(1|true|yes)$/i.test(process.env.DISCOVERY_APPLY || "");
const MAX_ADDITIONS = Math.max(
  0,
  Number(process.env.DISCOVERY_MAX_ADDITIONS || 2),
);
const MIN_CONFIDENCE = Math.min(
  1,
  Math.max(0, Number(process.env.DISCOVERY_MIN_CONFIDENCE || 0.86)),
);

const DEFAULT_SOURCE_URLS = [
  "https://microdata.gov.in/NADA/index.php/catalog",
  "https://microdata.gov.in/NADA/index.php/catalog/OTH",
  "https://microdata.gov.in/NADA/index.php/catalog/PL",
  "https://www.mospi.gov.in/",
  "https://data.gov.in/catalogs",
  "https://www.rbi.org.in/Scripts/Statistics.aspx",
  "https://www.education.gov.in/statistics-new",
  "https://www.mohfw.gov.in/",
  "https://www.epfindia.gov.in/site_en/Estimate_of_Payroll.php",
  "https://www.trai.gov.in/release-publication/reports",
];

const SOURCE_URLS = (process.env.DISCOVERY_SOURCE_URLS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const DISCOVERY_URLS = SOURCE_URLS.length ? SOURCE_URLS : DEFAULT_SOURCE_URLS;

const VALID_ACCESS_TYPES = new Set([
  "open-download",
  "public-dashboard",
  "registration",
  "data-use-agreement",
  "request-only",
  "paid-subscription",
]);
const VALID_SIZE_TIERS = new Set(["Medium", "Large", "Very large"]);
const VALID_CLUSTERS = [
  "population-demography",
  "households-living",
  "labour-employment",
  "firms-industry",
  "trade-commerce",
  "agriculture-rural",
  "health-nutrition",
  "education",
  "politics-governance",
  "public-finance",
  "banking-finance",
  "markets-prices",
  "environment-climate",
  "infrastructure-transport",
  "urban-development",
  "social-protection",
  "crime-justice",
  "geospatial-remote-sensing",
  "digital-economy",
  "international-india",
  "data-catalogs",
];
const VALID_CLUSTER_SET = new Set(VALID_CLUSTERS);

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function cleanText(value, max = 320) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function cleanArray(value, maxItems = 6, maxChars = 80) {
  const arr = Array.isArray(value) ? value : [];
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const text = cleanText(item, maxChars);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= maxItems) break;
  }
  return out;
}

function stripHtml(html) {
  return String(html || "")
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
  const m = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripHtml(m[1]).slice(0, 200) : "";
}

function extractLinks(html, baseUrl) {
  const links = [];
  const seen = new Set();
  for (const m of String(html || "").matchAll(
    /href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    const label = stripHtml(m[2]).slice(0, 120);
    const href = m[1];
    if (
      !label ||
      !/(data|dataset|catalog|download|report|statistics|survey|table)/i.test(
        label + " " + href,
      )
    ) {
      continue;
    }
    let url = href;
    try {
      url = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }
    const key = `${label.toLowerCase()}|${url.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ label, url });
    if (links.length >= 20) break;
  }
  return links;
}

async function fetchSource(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "IndianDataGuideBot/1.0 (+https://github.com/TahaIbrahimSiddiqui/guidetoindiandata)",
        Accept: "text/html,text/plain,application/json,*/*",
      },
    });
    const text = await res.text();
    const plain = res.headers.get("content-type")?.includes("json")
      ? text
      : stripHtml(text);
    return {
      url,
      finalUrl: res.url || url,
      ok: res.ok,
      status: res.status,
      title: extractTitle(text),
      text: plain.slice(0, 4500),
      links: extractLinks(text, res.url || url),
    };
  } catch (e) {
    return {
      url,
      finalUrl: url,
      ok: false,
      status: 0,
      title: "",
      text: "",
      links: [],
      error: String(e?.message || e),
    };
  } finally {
    clearTimeout(timer);
  }
}

function extractJson(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Empty model text");
  try {
    return JSON.parse(raw);
  } catch {
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) return JSON.parse(fence[1].trim());
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("Could not parse JSON from model response");
  }
}

function pickPreferredModel(ids) {
  const list = [...(ids || [])];
  const opus = list
    .filter((id) => /claude.*opus-4/i.test(id))
    .sort()
    .reverse();
  if (opus[0]) return opus[0];
  const sonnet = list
    .filter((id) => /claude.*sonnet-4/i.test(id))
    .sort()
    .reverse();
  if (sonnet[0]) return sonnet[0];
  const prefer = [
    /openai\.gpt-5(?!.*mini)/i,
    /vertex_ai\.gemini-3\.1-pro/i,
    /vertex_ai\.gemini-2\.5-pro/i,
    /gpt-4o(?!-mini)/i,
    /claude.*haiku/i,
  ];
  for (const re of prefer) {
    const hit = list.find((id) => re.test(id));
    if (hit) return hit;
  }
  return list[0] || null;
}

async function listDartmouthModels() {
  const res = await fetch(`${DARTMOUTH_BASE}/models`, {
    headers: {
      Authorization: `bearer ${KEY}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Dartmouth /models ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = JSON.parse(text);
  return (data.data || []).map((m) => m.id).filter(Boolean);
}

async function resolveModel() {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  if (PROVIDER === "dartmouth") {
    const ids = await listDartmouthModels();
    const pick = pickPreferredModel(ids);
    if (!pick) throw new Error("No models returned from Dartmouth /models");
    return pick;
  }
  if (PROVIDER === "google" || PROVIDER === "gemini") return "gemini-2.5-pro";
  return "gpt-4o-mini";
}

function systemPrompt() {
  return `You are a conservative curator for the Indian Data Guide.

Return JSON only:
{
  "candidates": [
    {
      "slug": "lowercase-hyphen-slug",
      "title": "Dataset title",
      "shortTitle": "Short label",
      "abbreviations": ["..."],
      "categories": ["..."],
      "technicalTags": ["..."],
      "host": "Host",
      "institution": "Institution",
      "accessUrl": "https://...",
      "docsUrl": "https://...",
      "accessType": "open-download | public-dashboard | registration | data-use-agreement | request-only | paid-subscription",
      "sizeTier": "Medium | Large | Very large",
      "formats": ["..."],
      "updateFrequency": "...",
      "geographyLevel": ["..."],
      "timeCoverage": "...",
      "keyVariables": ["at least 3 fields"],
      "summary": "1-2 specific sentences",
      "bestFor": "specific research use",
      "limitations": "honest limitation",
      "pairsWith": ["existing-slug"],
      "exampleUses": "short applied example",
      "cluster": "one allowed cluster",
      "sourceKind": "government",
      "confidence": 0.0,
      "evidenceUrl": "https://...",
      "whyNew": "why it is not already covered"
    }
  ]
}

Rules:
- Use only the provided source snippets and links as evidence.
- Prefer named recurring datasets, dashboards, official microdata releases, or structured public data portals for India.
- Do not propose broad ministry home pages, news posts, one-off press releases, or sources already covered by the existing catalog.
- If unsure, return no candidates.
- Every candidate must have a working-looking http(s) accessUrl or docsUrl, at least 3 keyVariables, and a confidence >= 0.86.
- cluster must be one of: ${VALID_CLUSTERS.join(", ")}.`;
}

async function chat(model, userText) {
  if (PROVIDER === "google" || PROVIDER === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(KEY)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt() }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(180000),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${text.slice(0, 500)}`);
    const data = JSON.parse(text);
    return extractJson(
      (data.candidates?.[0]?.content?.parts || [])
        .map((p) => p.text || "")
        .join("\n"),
    );
  }

  const base =
    PROVIDER === "dartmouth"
      ? DARTMOUTH_BASE
      : (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(
          /\/$/,
          "",
        );
  const body = {
    model,
    stream: false,
    messages: [
      { role: "system", content: systemPrompt() },
      {
        role: "user",
        content: `${userText}\n\nRespond with a single JSON object only.`,
      },
    ],
  };
  if (!/claude.*opus-4/i.test(model)) body.temperature = 0.1;
  if (PROVIDER === "openai") body.response_format = { type: "json_object" };

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization:
        PROVIDER === "dartmouth" ? `bearer ${KEY}` : `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${PROVIDER} chat ${res.status}: ${text.slice(0, 600)}`);
  }
  const data = JSON.parse(text);
  return extractJson(data.choices?.[0]?.message?.content);
}

function normalizeText(value) {
  return cleanText(value, 500)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleWords(value) {
  const stop = new Set([
    "the",
    "and",
    "of",
    "for",
    "in",
    "india",
    "indian",
    "data",
    "dataset",
    "statistics",
    "portal",
  ]);
  return normalizeText(value)
    .split(" ")
    .filter((w) => w.length > 2 && !stop.has(w));
}

function jaccard(a, b) {
  const aa = new Set(a);
  const bb = new Set(b);
  if (!aa.size || !bb.size) return 0;
  let inter = 0;
  for (const x of aa) if (bb.has(x)) inter++;
  return inter / (aa.size + bb.size - inter);
}

function slugify(value) {
  return normalizeText(value)
    .replace(/\s+/g, "-")
    .slice(0, 72)
    .replace(/-+$/g, "");
}

function urlKey(value) {
  if (!value) return "";
  try {
    const u = new URL(String(value));
    u.hash = "";
    u.search = "";
    return u.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return "";
  }
}

function isBroadCatalogUrl(value) {
  const key = urlKey(value);
  if (!key) return false;
  try {
    const u = new URL(key);
    const path = u.pathname.replace(/\/+$/g, "").toLowerCase();
    return (
      path === "" ||
      path === "/nada/index.php/catalog" ||
      path === "/catalog" ||
      path === "/catalogs" ||
      path === "/scripts/statistics.aspx"
    );
  } catch {
    return false;
  }
}

function isSpecificUrlKey(key) {
  if (!key) return false;
  try {
    const u = new URL(key);
    const path = u.pathname.replace(/\/+$/g, "").toLowerCase();
    if (
      path === "" ||
      path === "/nada/index.php/catalog" ||
      path === "/catalog" ||
      path === "/catalogs" ||
      path === "/scripts/statistics.aspx"
    ) {
      return false;
    }
    const segments = u.pathname.split("/").filter(Boolean);
    if (segments.length >= 3) return true;
    if (
      segments.length >= 2 &&
      /(catalog|dataset|data-dictionary|download|study|reports?)/i.test(
        u.pathname,
      )
    ) {
      return true;
    }
    if (/doi\.org$/i.test(u.hostname)) return true;
  } catch {
    return false;
  }
  return false;
}

function findEvidence(candidate, sources) {
  const candidateWords = titleWords(
    `${candidate.title} ${candidate.shortTitle}`,
  );
  let best = { score: 0, url: "", label: "" };

  for (const source of sources) {
    const sourceText = normalizeText(
      [
        source.title,
        source.text?.slice(0, 8000),
        ...(source.links || []).flatMap((link) => [link.label, link.url]),
      ].join(" "),
    );
    const hits = candidateWords.filter((word) =>
      sourceText.includes(word),
    ).length;
    if (hits >= Math.min(3, candidateWords.length)) {
      best = {
        score: Math.max(best.score, hits / Math.max(candidateWords.length, 1)),
        url: best.url || source.finalUrl,
        label: best.label || source.title,
      };
    }

    for (const link of source.links || []) {
      const score = jaccard(
        candidateWords,
        titleWords(`${link.label} ${link.url}`),
      );
      if (score > best.score) {
        best = { score, url: link.url, label: link.label };
      }
    }
  }

  return {
    matched: best.score >= 0.28,
    url: best.url,
    label: best.label,
    score: best.score,
  };
}

function inferCluster(categories) {
  const text = normalizeText((categories || []).join(" "));
  if (/health|nutrition|disease|hospital/.test(text)) return "health-nutrition";
  if (/school|education|student|teacher/.test(text)) return "education";
  if (/labour|labor|employment|payroll|worker/.test(text))
    return "labour-employment";
  if (/firm|industry|factory|enterprise/.test(text)) return "firms-industry";
  if (/trade|export|import|commerce/.test(text)) return "trade-commerce";
  if (/agri|rural|farm|crop|land/.test(text)) return "agriculture-rural";
  if (/crime|court|justice|police|prison/.test(text)) return "crime-justice";
  if (/climate|air|water|environment|pollution/.test(text))
    return "environment-climate";
  if (/transport|road|rail|aviation|power|electricity/.test(text))
    return "infrastructure-transport";
  if (/finance|bank|credit|payment/.test(text)) return "banking-finance";
  if (/price|market|inflation/.test(text)) return "markets-prices";
  if (/digital|telecom|internet/.test(text)) return "digital-economy";
  if (/census|population|demography/.test(text)) return "population-demography";
  if (/welfare|benefit|protection|ration|housing/.test(text))
    return "social-protection";
  return "data-catalogs";
}

function buildExistingIndex(records) {
  return {
    slugs: new Set(records.map((d) => d.slug)),
    titleKeys: new Set(records.map((d) => normalizeText(d.title))),
    urlKeys: new Set(
      records
        .flatMap((d) => [d.accessUrl, d.docsUrl, d.dataDoi])
        .map(urlKey)
        .filter(Boolean),
    ),
    records: records.map((d) => ({
      slug: d.slug,
      title: d.title,
      shortTitle: d.shortTitle,
      words: titleWords(`${d.title} ${d.shortTitle}`),
      host: d.host,
      institution: d.institution,
    })),
  };
}

function findDuplicate(candidate, index, accepted) {
  if (index.slugs.has(candidate.slug) || accepted.slugs.has(candidate.slug)) {
    return `duplicate slug: ${candidate.slug}`;
  }
  const titleKey = normalizeText(candidate.title);
  if (index.titleKeys.has(titleKey) || accepted.titleKeys.has(titleKey)) {
    return `duplicate title: ${candidate.title}`;
  }
  for (const u of [candidate.accessUrl, candidate.docsUrl, candidate.dataDoi]) {
    const key = urlKey(u);
    if (
      key &&
      isSpecificUrlKey(key) &&
      (index.urlKeys.has(key) || accepted.urlKeys.has(key))
    ) {
      return `duplicate URL/DOI: ${key}`;
    }
  }

  const words = titleWords(`${candidate.title} ${candidate.shortTitle}`);
  for (const existing of index.records) {
    const score = jaccard(words, existing.words);
    if (score >= 0.74) {
      return `near duplicate of ${existing.slug} (title similarity ${score.toFixed(2)})`;
    }
    const a = normalizeText(candidate.title);
    const b = normalizeText(existing.title);
    if (a.length > 12 && b.length > 12 && (a.includes(b) || b.includes(a))) {
      return `near duplicate of ${existing.slug} (title containment)`;
    }
  }
  return "";
}

function normalizeCandidate(raw) {
  const title = cleanText(raw.title, 140);
  const shortTitle = cleanText(raw.shortTitle || title, 48);
  const slug = slugify(raw.slug || title);
  const categories = cleanArray(raw.categories, 5);
  const keyVariables = cleanArray(raw.keyVariables, 10);
  const accessUrl = cleanText(raw.accessUrl, 300);
  const docsUrl = cleanText(raw.docsUrl, 300);
  const confidence = Number(raw.confidence || 0);
  const cluster = VALID_CLUSTER_SET.has(raw.cluster)
    ? raw.cluster
    : inferCluster(categories);

  const candidate = {
    slug,
    title,
    shortTitle,
    abbreviations: cleanArray(raw.abbreviations, 5, 32),
    categories,
    technicalTags: cleanArray(raw.technicalTags, 6),
    host: cleanText(raw.host, 80),
    institution: cleanText(raw.institution, 120),
    accessUrl,
    docsUrl,
    accessType: VALID_ACCESS_TYPES.has(raw.accessType)
      ? raw.accessType
      : "open-download",
    sizeTier: VALID_SIZE_TIERS.has(raw.sizeTier) ? raw.sizeTier : "Medium",
    formats: cleanArray(raw.formats, 6, 40),
    updateFrequency: cleanText(raw.updateFrequency, 80),
    geographyLevel: cleanArray(raw.geographyLevel, 6, 40),
    timeCoverage: cleanText(raw.timeCoverage, 100),
    keyVariables,
    summary: cleanText(raw.summary, 280),
    bestFor: cleanText(raw.bestFor, 180),
    limitations: cleanText(raw.limitations, 180),
    pairsWith: cleanArray(raw.pairsWith, 4, 80).filter((slug) =>
      datasets.some((d) => d.slug === slug),
    ),
    exampleUses: cleanText(raw.exampleUses, 140),
    cluster,
    sourceKind: "government",
  };

  const errors = [];
  if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(candidate.slug))
    errors.push("bad slug");
  for (const field of [
    "title",
    "shortTitle",
    "host",
    "institution",
    "updateFrequency",
    "timeCoverage",
    "summary",
    "bestFor",
    "limitations",
    "exampleUses",
  ]) {
    if (!candidate[field]) errors.push(`missing ${field}`);
  }
  for (const field of [
    "categories",
    "technicalTags",
    "formats",
    "geographyLevel",
    "keyVariables",
  ]) {
    if (!candidate[field]?.length) errors.push(`missing ${field}`);
  }
  if (candidate.keyVariables.length < 3)
    errors.push("needs at least 3 keyVariables");
  if (!urlKey(candidate.accessUrl) && !urlKey(candidate.docsUrl)) {
    errors.push("needs http(s) accessUrl or docsUrl");
  }
  if (candidate.summary.length < 60) errors.push("summary too short");
  if (candidate.bestFor.length < 24) errors.push("bestFor too short");
  if (candidate.limitations.length < 24) errors.push("limitations too short");
  if (confidence < MIN_CONFIDENCE) {
    errors.push(`confidence ${confidence || 0} below ${MIN_CONFIDENCE}`);
  }

  return {
    record: candidate,
    meta: {
      confidence,
      evidenceUrl: cleanText(
        raw.evidenceUrl || raw.accessUrl || raw.docsUrl,
        300,
      ),
      whyNew: cleanText(raw.whyNew, 300),
    },
    errors,
  };
}

function formatDatasetModule(records) {
  return `import type { DatasetDraft } from "@/types/dataset";

/**
 * Automated catalog additions.
 *
 * The scheduled discovery workflow appends only records that pass duplicate
 * checks and the normal catalog audit. Keeping these separate from the
 * hand-curated government list makes later pruning/review easier.
 */
export const discoveredDatasets: DatasetDraft[] = ${JSON.stringify(records, null, 2)};
`;
}

function writeReports(report) {
  const json = JSON.stringify(report, null, 2);
  writeFileSync(join(OUT_DIR, `discovery-${stamp()}.json`), json);
  writeFileSync(join(OUT_DIR, "discovery-latest.json"), json);

  const lines = [
    `# Dataset discovery - ${stamp()}`,
    "",
    `- Provider: \`${report.provider}\``,
    `- Model: \`${report.model || "n/a"}\``,
    `- Apply mode: ${report.apply}`,
    `- Existing catalog size: ${report.existingCount}`,
    `- Raw candidates: ${report.rawCandidates.length}`,
    `- Accepted additions: ${report.accepted.length}`,
    `- Rejected candidates: ${report.rejected.length}`,
    "",
  ];
  if (report.accepted.length) {
    lines.push("## Accepted", "");
    for (const a of report.accepted) {
      lines.push(`### \`${a.record.slug}\``);
      lines.push(`- ${a.record.title}`);
      lines.push(`- Evidence: ${a.meta.evidenceUrl || "n/a"}`);
      lines.push(`- Why new: ${a.meta.whyNew || "n/a"}`);
      lines.push("");
    }
  }
  if (report.rejected.length) {
    lines.push("## Rejected", "");
    for (const r of report.rejected.slice(0, 12)) {
      lines.push(`- \`${r.slug || "unknown"}\`: ${r.reasons.join("; ")}`);
    }
    lines.push("");
  }
  if (report.error) {
    lines.push("## Error", "", report.error, "");
  }
  writeFileSync(join(OUT_DIR, `discovery-${stamp()}.md`), lines.join("\n"));
  writeFileSync(join(OUT_DIR, "discovery-latest.md"), lines.join("\n"));
}

async function main() {
  const report = {
    ranAt: new Date().toISOString(),
    provider: PROVIDER,
    model: null,
    baseUrl:
      PROVIDER === "dartmouth"
        ? DARTMOUTH_BASE
        : process.env.AI_BASE_URL || null,
    apply: APPLY,
    existingCount: datasets.length,
    sourceUrls: DISCOVERY_URLS,
    fetchedSources: [],
    rawCandidates: [],
    accepted: [],
    rejected: [],
    applied: 0,
    skipped: false,
    error: null,
  };

  if (!KEY || MAX_ADDITIONS === 0) {
    report.skipped = true;
    report.error = !KEY
      ? "AI_API_KEY not set - discovery skipped."
      : "DISCOVERY_MAX_ADDITIONS is 0 - discovery skipped.";
    writeReports(report);
    console.log(
      JSON.stringify({ ok: true, skipped: true, reason: report.error }),
    );
    process.exit(0);
  }

  try {
    const sources = await Promise.all(DISCOVERY_URLS.map(fetchSource));
    report.fetchedSources = sources.map((s) => ({
      url: s.url,
      finalUrl: s.finalUrl,
      ok: s.ok,
      status: s.status,
      title: s.title,
      linkCount: s.links.length,
      error: s.error || null,
    }));

    const model = await resolveModel();
    report.model = model;

    const existingCatalog = datasets.map((d) => ({
      slug: d.slug,
      title: d.title,
      shortTitle: d.shortTitle,
      host: d.host,
      institution: d.institution,
      accessUrl: d.accessUrl || null,
      docsUrl: d.docsUrl || null,
      dataDoi: d.dataDoi || null,
      categories: d.categories,
    }));

    const userText = JSON.stringify({
      task: "Find genuinely new India research datasets not already in the existing catalog. Return at most the configured max additions.",
      maxAdditions: MAX_ADDITIONS,
      minConfidence: MIN_CONFIDENCE,
      existingCatalog,
      sourcePages: sources.map((s) => ({
        url: s.finalUrl,
        title: s.title,
        ok: s.ok,
        text: s.text,
        links: s.links,
      })),
    });

    const parsed = await chat(model, userText);
    const rawCandidates = Array.isArray(parsed.candidates)
      ? parsed.candidates
      : [];
    report.rawCandidates = rawCandidates;

    const index = buildExistingIndex(datasets);
    const acceptedIndex = {
      slugs: new Set(),
      titleKeys: new Set(),
      urlKeys: new Set(),
    };

    for (const raw of rawCandidates) {
      const normalized = normalizeCandidate(raw);
      const reasons = [...normalized.errors];
      const evidence = findEvidence(normalized.record, sources);
      if (!evidence.matched) {
        reasons.push("no matching source evidence");
      }
      if (evidence.url) {
        normalized.meta.evidenceUrl = evidence.url;
        if (isBroadCatalogUrl(normalized.record.accessUrl)) {
          normalized.record.accessUrl = evidence.url;
        }
        if (
          normalized.record.docsUrl &&
          isBroadCatalogUrl(normalized.record.docsUrl)
        ) {
          normalized.record.docsUrl = evidence.url;
        }
      }
      const dup = findDuplicate(normalized.record, index, acceptedIndex);
      if (dup) reasons.push(dup);

      if (reasons.length) {
        report.rejected.push({
          slug: normalized.record.slug || raw.slug || "",
          title: normalized.record.title || raw.title || "",
          reasons,
          meta: normalized.meta,
        });
        continue;
      }

      report.accepted.push(normalized);
      acceptedIndex.slugs.add(normalized.record.slug);
      acceptedIndex.titleKeys.add(normalizeText(normalized.record.title));
      for (const u of [
        normalized.record.accessUrl,
        normalized.record.docsUrl,
        normalized.record.dataDoi,
      ]) {
        const key = urlKey(u);
        if (key) acceptedIndex.urlKeys.add(key);
      }
      if (report.accepted.length >= MAX_ADDITIONS) break;
    }

    if (APPLY && report.accepted.length) {
      const current = [...discoveredDatasets];
      const next = [...current, ...report.accepted.map((a) => a.record)];
      writeFileSync(DISCOVERED_PATH, formatDatasetModule(next));
      report.applied = next.length - current.length;
    }

    writeReports(report);
    console.log(
      JSON.stringify({
        ok: true,
        provider: PROVIDER,
        model,
        rawCandidates: report.rawCandidates.length,
        accepted: report.accepted.length,
        applied: report.applied,
      }),
    );
    process.exit(0);
  } catch (e) {
    report.error = String(e?.message || e);
    writeReports(report);
    console.error(report.error);
    if (process.env.DISCOVERY_STRICT === "1") process.exit(1);
    process.exit(0);
  }
}

main();
