/**
 * Monthly article digest for top economics journals plus JDE.
 *
 * Searches OpenAlex and Crossref for articles in the configured window, then
 * scores them against the user's broad interests:
 * politics, India, discrimination, and political economy.
 *
 * Env:
 *   DIGEST_FROM              yyyy-mm-dd; default first day of previous month
 *   DIGEST_TO                yyyy-mm-dd; default last day of previous month
 *   DIGEST_MONTH             optional label, e.g. 2026-07
 *   DIGEST_INTERESTS         optional comma-separated interest text
 *   DIGEST_MIN_SCORE         keyword fallback threshold, default 4
 *   DIGEST_MAX_PER_JOURNAL   max records per source/journal API, default 120
 *   OPENALEX_MAILTO          optional polite-pool email for OpenAlex/Crossref
 *   AI_API_KEY               optional Dartmouth/OpenAI-compatible classifier
 *   AI_BASE_URL              default https://chat.dartmouth.edu/api
 *   AI_MODEL                 optional; otherwise auto-pick from /models
 *
 * Run:
 *   npx tsx scripts/monthly-journal-digest.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "content", "automation");
mkdirSync(OUT_DIR, { recursive: true });

const JOURNALS = [
  {
    key: "aer",
    name: "American Economic Review",
    short: "AER",
    issns: ["0002-8282", "1944-7981"],
  },
  {
    key: "jpe",
    name: "Journal of Political Economy",
    short: "JPE",
    issns: ["0022-3808", "1537-534X"],
  },
  {
    key: "qje",
    name: "Quarterly Journal of Economics",
    short: "QJE",
    issns: ["0033-5533", "1531-4650"],
  },
  {
    key: "econometrica",
    name: "Econometrica",
    short: "Econometrica",
    issns: ["0012-9682", "1468-0262"],
  },
  {
    key: "restud",
    name: "Review of Economic Studies",
    short: "REStud",
    issns: ["0034-6527", "1467-937X"],
  },
  {
    key: "jde",
    name: "Journal of Development Economics",
    short: "JDE",
    issns: ["0304-3878"],
  },
];

const DEFAULT_INTERESTS = "politics, India, discrimination, political economy";
const INTERESTS = process.env.DIGEST_INTERESTS || DEFAULT_INTERESTS;
const MIN_SCORE = Math.max(1, Number(process.env.DIGEST_MIN_SCORE || 4));
const MAX_PER_JOURNAL = Math.max(
  20,
  Number(process.env.DIGEST_MAX_PER_JOURNAL || 120),
);
const MAILTO = process.env.OPENALEX_MAILTO || process.env.CROSSREF_MAILTO || "";

const KEY =
  process.env.AI_API_KEY ||
  process.env.DARTMOUTH_API_KEY ||
  process.env.OPENAI_API_KEY ||
  "";
const PROVIDER = (process.env.AI_PROVIDER || "dartmouth").toLowerCase();
const AI_BASE = (
  process.env.AI_BASE_URL || "https://chat.dartmouth.edu/api"
).replace(/\/$/, "");

function pad(n) {
  return String(n).padStart(2, "0");
}

function toIsoDate(d) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate(),
  )}`;
}

function previousMonthRange() {
  const now = new Date();
  const firstThisMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const firstPrevMonth = new Date(
    Date.UTC(
      firstThisMonth.getUTCFullYear(),
      firstThisMonth.getUTCMonth() - 1,
      1,
    ),
  );
  const lastPrevMonth = new Date(
    firstThisMonth.getTime() - 24 * 60 * 60 * 1000,
  );
  return { from: toIsoDate(firstPrevMonth), to: toIsoDate(lastPrevMonth) };
}

function validateDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    throw new Error(`${label} must be yyyy-mm-dd`);
  }
  return value;
}

const defaultRange = previousMonthRange();
const FROM = validateDate(
  process.env.DIGEST_FROM || defaultRange.from,
  "DIGEST_FROM",
);
const TO = validateDate(process.env.DIGEST_TO || defaultRange.to, "DIGEST_TO");
const MONTH = process.env.DIGEST_MONTH || FROM.slice(0, 7);

function cleanText(value, max = 4000) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function stripHtml(value) {
  return cleanText(String(value || "").replace(/<[^>]+>/g, " "));
}

function normalizeTitle(value) {
  return cleanText(value, 400)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function doiKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:/, "")
    .trim();
}

function abstractFromInvertedIndex(index) {
  if (!index || typeof index !== "object") return "";
  const words = [];
  for (const [word, positions] of Object.entries(index)) {
    if (!Array.isArray(positions)) continue;
    for (const pos of positions) {
      if (Number.isInteger(pos)) words[pos] = word;
    }
  }
  return words.filter(Boolean).join(" ");
}

function authorsFromOpenAlex(authorships) {
  return (Array.isArray(authorships) ? authorships : [])
    .map((a) => cleanText(a?.author?.display_name, 80))
    .filter(Boolean)
    .slice(0, 6);
}

function authorsFromCrossref(authors) {
  return (Array.isArray(authors) ? authors : [])
    .map((a) => cleanText([a.given, a.family].filter(Boolean).join(" "), 80))
    .filter(Boolean)
    .slice(0, 6);
}

function crossrefDate(item) {
  const parts =
    item?.published?.["date-parts"]?.[0] ||
    item?.["published-online"]?.["date-parts"]?.[0] ||
    item?.["published-print"]?.["date-parts"]?.[0] ||
    item?.issued?.["date-parts"]?.[0] ||
    [];
  const [year, month = 1, day = 1] = parts;
  return year ? `${year}-${pad(month)}-${pad(day)}` : "";
}

function sourceUrlFor(work) {
  if (work.doi) return `https://doi.org/${doiKey(work.doi)}`;
  return work.url || work.openalexId || "";
}

function compactAuthorLine(authors) {
  if (!authors?.length) return "Authors not listed";
  if (authors.length <= 4) return authors.join(", ");
  return `${authors.slice(0, 4).join(", ")} et al.`;
}

async function fetchJson(url, label) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "IndianDataGuideJournalDigest/1.0 (+https://github.com/TahaIbrahimSiddiqui/guidetoindiandata)",
    },
    signal: AbortSignal.timeout(90000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${label} ${res.status}: ${text.slice(0, 500)}`);
  }
  return JSON.parse(text);
}

async function fetchOpenAlexJournal(journal) {
  const out = [];
  let cursor = "*";
  let pages = 0;

  while (cursor && pages < 3 && out.length < MAX_PER_JOURNAL) {
    const url = new URL("https://api.openalex.org/works");
    url.searchParams.set(
      "filter",
      [
        `from_publication_date:${FROM}`,
        `to_publication_date:${TO}`,
        `primary_location.source.issn:${journal.issns.join("|")}`,
      ].join(","),
    );
    url.searchParams.set("sort", "publication_date:desc");
    url.searchParams.set("per-page", "200");
    url.searchParams.set("cursor", cursor);
    url.searchParams.set(
      "select",
      [
        "id",
        "doi",
        "display_name",
        "publication_date",
        "authorships",
        "primary_location",
        "open_access",
        "abstract_inverted_index",
        "concepts",
        "topics",
        "keywords",
      ].join(","),
    );
    if (MAILTO) url.searchParams.set("mailto", MAILTO);

    const data = await fetchJson(url, `OpenAlex ${journal.short}`);
    const results = Array.isArray(data.results) ? data.results : [];
    for (const item of results) {
      out.push({
        source: "openalex",
        journalKey: journal.key,
        journal: journal.name,
        journalShort: journal.short,
        title: cleanText(item.display_name, 500),
        publicationDate: item.publication_date || "",
        doi: doiKey(item.doi),
        url:
          item.primary_location?.landing_page_url ||
          item.primary_location?.pdf_url ||
          item.doi ||
          item.id ||
          "",
        openalexId: item.id,
        authors: authorsFromOpenAlex(item.authorships),
        abstract: cleanText(
          abstractFromInvertedIndex(item.abstract_inverted_index),
          2500,
        ),
        concepts: [
          ...(Array.isArray(item.concepts)
            ? item.concepts.map((c) => c.display_name)
            : []),
          ...(Array.isArray(item.topics)
            ? item.topics.map((t) => t.display_name || t.topic?.display_name)
            : []),
          ...(Array.isArray(item.keywords)
            ? item.keywords.map((k) => k.display_name || k.keyword)
            : []),
        ]
          .map((x) => cleanText(x, 80))
          .filter(Boolean)
          .slice(0, 18),
      });
    }
    cursor = data.meta?.next_cursor || "";
    pages += 1;
    if (!results.length) break;
  }

  return out.slice(0, MAX_PER_JOURNAL);
}

async function fetchCrossrefJournal(journal, issn) {
  const url = new URL(`https://api.crossref.org/journals/${issn}/works`);
  url.searchParams.set(
    "filter",
    [
      `from-pub-date:${FROM}`,
      `until-pub-date:${TO}`,
      "type:journal-article",
    ].join(","),
  );
  url.searchParams.set("rows", String(Math.min(100, MAX_PER_JOURNAL)));
  url.searchParams.set("sort", "published");
  url.searchParams.set("order", "desc");
  url.searchParams.set(
    "select",
    [
      "DOI",
      "title",
      "subtitle",
      "container-title",
      "published",
      "published-online",
      "published-print",
      "issued",
      "URL",
      "abstract",
      "author",
      "subject",
    ].join(","),
  );
  if (MAILTO) url.searchParams.set("mailto", MAILTO);

  const data = await fetchJson(url, `Crossref ${journal.short} ${issn}`);
  const items = Array.isArray(data.message?.items) ? data.message.items : [];
  return items.map((item) => ({
    source: "crossref",
    journalKey: journal.key,
    journal: journal.name,
    journalShort: journal.short,
    title: cleanText(
      [...(item.title || []), ...(item.subtitle || [])].join(": "),
      500,
    ),
    publicationDate: crossrefDate(item),
    doi: doiKey(item.DOI),
    url: item.URL || (item.DOI ? `https://doi.org/${doiKey(item.DOI)}` : ""),
    openalexId: "",
    authors: authorsFromCrossref(item.author),
    abstract: cleanText(stripHtml(item.abstract), 2500),
    concepts: (Array.isArray(item.subject) ? item.subject : [])
      .map((x) => cleanText(x, 80))
      .filter(Boolean)
      .slice(0, 18),
  }));
}

async function fetchAllWorks() {
  const errors = [];
  const records = [];

  for (const journal of JOURNALS) {
    try {
      records.push(...(await fetchOpenAlexJournal(journal)));
    } catch (e) {
      errors.push({
        source: "openalex",
        journal: journal.short,
        error: String(e?.message || e),
      });
    }

    for (const issn of journal.issns) {
      try {
        records.push(...(await fetchCrossrefJournal(journal, issn)));
      } catch (e) {
        errors.push({
          source: "crossref",
          journal: journal.short,
          issn,
          error: String(e?.message || e),
        });
      }
    }
  }

  return { records, errors };
}

const RULES = [
  {
    tag: "India",
    weight: 4,
    terms: [
      "india",
      "indian",
      "bharat",
      "delhi",
      "mumbai",
      "bihar",
      "uttar pradesh",
      "tamil nadu",
      "kerala",
      "west bengal",
      "maharashtra",
      "gujarat",
      "karnataka",
      "rajasthan",
      "haryana",
      "punjab",
      "telangana",
      "andhra pradesh",
      "odisha",
      "assam",
      "caste",
      "dalit",
      "jati",
      "hindu",
      "muslim",
      "aadhaar",
      "panchayat",
      "lok sabha",
    ],
  },
  {
    tag: "Politics",
    weight: 3,
    terms: [
      "politic",
      "election",
      "voter",
      "voting",
      "party",
      "democracy",
      "governance",
      "bureaucracy",
      "state capacity",
      "public good",
      "public goods",
      "clientelism",
      "corruption",
      "protest",
      "conflict",
      "violence",
      "media",
      "propaganda",
      "representation",
      "legislature",
      "parliament",
      "public policy",
      "institutions",
      "tax",
      "redistribution",
    ],
  },
  {
    tag: "Discrimination",
    weight: 4,
    terms: [
      "discrimination",
      "discriminat",
      "caste",
      "race",
      "racial",
      "ethnic",
      "ethnicity",
      "religion",
      "religious",
      "muslim",
      "minority",
      "gender",
      "women",
      "female",
      "segregation",
      "bias",
      "prejudice",
      "affirmative action",
      "quota",
      "inequality",
      "identity",
      "social exclusion",
    ],
  },
  {
    tag: "Political economy",
    weight: 3,
    terms: [
      "political economy",
      "institutions",
      "state capacity",
      "taxation",
      "tax",
      "public finance",
      "redistribution",
      "bureaucracy",
      "corruption",
      "public goods",
      "elite",
      "land reform",
      "property rights",
      "regulation",
      "rent seeking",
      "governance",
      "informality",
      "welfare state",
    ],
  },
];

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termMatches(text, term) {
  const normalized = term.toLowerCase();
  const stemTerms = new Set(["politic", "discriminat"]);
  if (stemTerms.has(normalized)) {
    return new RegExp(`\\b${escapeRegex(normalized)}\\w*\\b`, "i").test(text);
  }
  const phrase = escapeRegex(normalized).replace(/\\ /g, "\\s+");
  return new RegExp(`\\b${phrase}\\b`, "i").test(text);
}

function scoreWork(work) {
  const haystack = [work.title, work.abstract].join(" ").toLowerCase();

  const tags = [];
  const hits = [];
  let score = 0;

  for (const rule of RULES) {
    const matchedTerms = rule.terms.filter((term) =>
      termMatches(haystack, term),
    );
    if (!matchedTerms.length) continue;
    tags.push(rule.tag);
    hits.push(...matchedTerms.slice(0, 4));
    score += rule.weight + Math.min(3, matchedTerms.length - 1);
  }

  if (tags.includes("India") && tags.some((t) => t !== "India")) score += 2;
  if (
    tags.includes("Discrimination") &&
    (tags.includes("Politics") || tags.includes("Political economy"))
  ) {
    score += 1;
  }
  if (/political economy/i.test(haystack)) score += 2;

  return {
    keywordScore: score,
    tags: [...new Set(tags)],
    hits: [...new Set(hits)].slice(0, 10),
  };
}

function dedupeWorks(records) {
  const map = new Map();
  for (const raw of records) {
    const titleKey = normalizeTitle(raw.title);
    if (!titleKey || titleKey.length < 8) continue;
    const key = raw.doi ? `doi:${raw.doi}` : `title:${titleKey}`;
    const prior = map.get(key);
    if (!prior) {
      map.set(key, raw);
      continue;
    }
    const priorQuality =
      (prior.abstract ? 2 : 0) +
      (prior.doi ? 1 : 0) +
      (prior.source === "openalex" ? 1 : 0);
    const nextQuality =
      (raw.abstract ? 2 : 0) +
      (raw.doi ? 1 : 0) +
      (raw.source === "openalex" ? 1 : 0);
    if (nextQuality > priorQuality) {
      map.set(key, {
        ...prior,
        ...raw,
        source: `${prior.source}+${raw.source}`,
      });
    } else {
      map.set(key, {
        ...raw,
        ...prior,
        source: `${prior.source}+${raw.source}`,
      });
    }
  }
  return [...map.values()];
}

function isEditorialNoise(work) {
  const title = normalizeTitle(work.title);
  if (!title) return true;
  const noise = [
    /^a note from the editor/,
    /^annual report/,
    /^back matter/,
    /^books received/,
    /^call for papers/,
    /^comments? and replies$/,
    /^conference program/,
    /^corrigendum/,
    /^correction/,
    /^errata?$/,
    /^front matter/,
    /^index$/,
    /^jpe turnaround times$/,
    /^list of referees/,
    /^recent referees$/,
    /^referees$/,
    /^reviewers$/,
    /^volume contents$/,
  ];
  return noise.some((re) => re.test(title));
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
  const res = await fetch(`${AI_BASE}/models`, {
    headers: { Authorization: `bearer ${KEY}`, Accept: "application/json" },
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  if (!res.ok)
    throw new Error(`Dartmouth /models ${res.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  return (data.data || data.models || [])
    .map((m) => m.id || m.name)
    .filter(Boolean);
}

async function resolveAiModel() {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  if (PROVIDER === "dartmouth") {
    const pick = pickPreferredModel(await listDartmouthModels());
    if (!pick) throw new Error("No Dartmouth models available");
    return pick;
  }
  return "gpt-4o-mini";
}

function extractJson(text) {
  const raw = String(text || "").trim();
  try {
    return JSON.parse(raw);
  } catch {
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) return JSON.parse(fence[1].trim());
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("Could not parse JSON from AI response");
  }
}

function aiSystemPrompt() {
  return `You prepare a monthly economics-journal article digest for a researcher.

Interests: ${INTERESTS}

Return JSON only:
{
  "decisions": [
    {
      "id": "input id",
      "include": true,
      "priority": "high|medium|low",
      "tags": ["India", "Politics", "Discrimination", "Political economy"],
      "reason": "one concise reason",
      "whyRead": "one concise reading note"
    }
  ]
}

Include articles that are materially about any interest. Prefer precision over quantity.`;
}

async function classifyWithAi(candidates) {
  if (!KEY || !candidates.length)
    return { decisions: {}, model: null, error: "" };
  const input = candidates.slice(0, 100).map((w) => ({
    id: w.id,
    title: w.title,
    journal: w.journalShort,
    date: w.publicationDate,
    authors: w.authors,
    abstract: cleanText(w.abstract, 900),
    concepts: w.concepts,
    keywordTags: w.tags,
    keywordHits: w.hits,
  }));

  try {
    const model = await resolveAiModel();
    const body = {
      model,
      stream: false,
      messages: [
        { role: "system", content: aiSystemPrompt() },
        {
          role: "user",
          content:
            JSON.stringify({ articles: input }, null, 2) +
            "\n\nRespond with JSON only.",
        },
      ],
    };
    if (!/claude.*opus-4/i.test(model)) body.temperature = 0.2;

    const res = await fetch(`${AI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180000),
    });
    const text = await res.text();
    if (!res.ok)
      throw new Error(`AI classifier ${res.status}: ${text.slice(0, 500)}`);
    const data = JSON.parse(text);
    const parsed = extractJson(data.choices?.[0]?.message?.content || "");
    const decisions = {};
    for (const d of parsed.decisions || []) {
      if (!d?.id) continue;
      decisions[d.id] = {
        include: Boolean(d.include),
        priority: ["high", "medium", "low"].includes(d.priority)
          ? d.priority
          : "medium",
        tags: Array.isArray(d.tags)
          ? d.tags.map((t) => cleanText(t, 40)).filter(Boolean)
          : [],
        reason: cleanText(d.reason, 260),
        whyRead: cleanText(d.whyRead, 260),
      };
    }
    return { decisions, model, error: "" };
  } catch (e) {
    return { decisions: {}, model: null, error: String(e?.message || e) };
  }
}

function enrichMatches(works, ai) {
  const aiAvailable = Boolean(
    ai.model && Object.keys(ai.decisions || {}).length,
  );
  return works
    .map((work) => {
      const decision = ai.decisions[work.id];
      const include = aiAvailable
        ? Boolean(decision?.include)
        : work.keywordScore >= MIN_SCORE;
      const priority =
        decision?.priority ||
        (work.keywordScore >= 8
          ? "high"
          : work.keywordScore >= 5
            ? "medium"
            : "low");
      const tags = [...(decision?.tags || []), ...(work.tags || [])].filter(
        Boolean,
      );
      const reason =
        decision?.reason ||
        (work.hits.length
          ? `Matched terms: ${work.hits.join(", ")}.`
          : "Matched the configured interest profile.");
      const whyRead =
        decision?.whyRead ||
        (work.abstract
          ? cleanText(work.abstract, 220)
          : "Open the article page to inspect the abstract and replication materials.");
      return {
        ...work,
        include,
        priority,
        tags: [...new Set(tags)].slice(0, 6),
        reason,
        whyRead,
      };
    })
    .filter((w) => w.include)
    .sort((a, b) => {
      const rank = { high: 3, medium: 2, low: 1 };
      return (
        (rank[b.priority] || 0) - (rank[a.priority] || 0) ||
        b.keywordScore - a.keywordScore ||
        String(b.publicationDate).localeCompare(String(a.publicationDate))
      );
    });
}

function formatWork(work, index) {
  const tags = work.tags.length ? work.tags.join(", ") : "matched";
  const concepts = work.concepts?.length
    ? `\n- Metadata topics: ${work.concepts.slice(0, 6).join(", ")}`
    : "";
  const link = sourceUrlFor(work);
  return `### ${index}. ${work.title}

- Journal: ${work.journalShort} (${work.publicationDate || "date not listed"})
- Authors: ${compactAuthorLine(work.authors)}
- Priority: ${work.priority}
- Tags: ${tags}
- Why matched: ${work.reason}
- Why read: ${work.whyRead}
- Link: ${link || "No stable link found"}${concepts}
`;
}

function journalCounts(works) {
  const counts = new Map();
  for (const j of JOURNALS) counts.set(j.short, 0);
  for (const work of works)
    counts.set(work.journalShort, (counts.get(work.journalShort) || 0) + 1);
  return [...counts.entries()];
}

function writeReports(report) {
  const json = JSON.stringify(report, null, 2);
  writeFileSync(join(OUT_DIR, `journal-digest-${MONTH}.json`), json);
  writeFileSync(join(OUT_DIR, "journal-digest-latest.json"), json);

  const lines = [];
  lines.push(`# Monthly journal article digest - ${MONTH}`);
  lines.push("");
  lines.push(`Window: ${FROM} to ${TO}`);
  lines.push(`Interests: ${INTERESTS}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Scanned records: ${report.scannedCount}`);
  lines.push(`- Unique articles: ${report.uniqueCount}`);
  lines.push(`- Matched articles: ${report.matchCount}`);
  lines.push(`- AI classifier: ${report.ai.model || "not used"}`);
  if (report.ai.error) lines.push(`- AI note: ${report.ai.error}`);
  if (report.errors.length)
    lines.push(`- Metadata warnings: ${report.errors.length}`);
  lines.push("");
  lines.push("## Matches By Journal");
  lines.push("");
  lines.push("| Journal | Matches |");
  lines.push("|---|---:|");
  for (const [journal, count] of journalCounts(report.matches)) {
    lines.push(`| ${journal} | ${count} |`);
  }
  lines.push("");

  if (!report.matches.length) {
    lines.push("## No Matches");
    lines.push("");
    lines.push(
      "No article crossed the configured relevance threshold this month. The run still checked the journal metadata sources and uploaded the raw report artifact.",
    );
  } else {
    const high = report.matches.filter((m) => m.priority === "high");
    const rest = report.matches.filter((m) => m.priority !== "high");
    if (high.length) {
      lines.push("## Highest Priority");
      lines.push("");
      high.forEach((work, i) => lines.push(formatWork(work, i + 1)));
    }
    if (rest.length) {
      lines.push("## Other Matches");
      lines.push("");
      rest.forEach((work, i) => lines.push(formatWork(work, i + 1)));
    }
  }

  if (report.errors.length) {
    lines.push("## Metadata Warnings");
    lines.push("");
    for (const e of report.errors.slice(0, 20)) {
      lines.push(
        `- ${e.source} ${e.journal}${e.issn ? ` ${e.issn}` : ""}: ${e.error}`,
      );
    }
  }

  lines.push("");
  lines.push(
    "_Sources queried: OpenAlex works API and Crossref journal works API; matched with local keyword rules and optional Dartmouth AI classification._",
  );

  const md = lines.join("\n");
  writeFileSync(join(OUT_DIR, `journal-digest-${MONTH}.md`), md);
  writeFileSync(join(OUT_DIR, "journal-digest-latest.md"), md);
  writeFileSync(
    join(OUT_DIR, "journal-digest-meta.env"),
    [
      `DIGEST_MONTH=${MONTH}`,
      `MATCH_COUNT=${report.matchCount}`,
      `SCANNED_COUNT=${report.scannedCount}`,
      `ISSUE_TITLE=${shellQuote(`Monthly journal digest: ${MONTH}`)}`,
    ].join("\n") + "\n",
  );
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\"'\"'")}'`;
}

async function main() {
  const { records, errors } = await fetchAllWorks();
  const unique = dedupeWorks(records).filter((work) => !isEditorialNoise(work));
  const scored = unique.map((work) => ({
    ...work,
    id: work.doi
      ? `doi:${work.doi}`
      : `title:${normalizeTitle(work.title).slice(0, 80)}`,
    ...scoreWork(work),
  }));

  const aiCandidates = scored
    .filter((work) => work.keywordScore > 0)
    .sort((a, b) => b.keywordScore - a.keywordScore)
    .slice(0, 100);
  const ai = await classifyWithAi(aiCandidates);
  const matches = enrichMatches(scored, ai).slice(0, 40);

  const report = {
    ok: true,
    month: MONTH,
    from: FROM,
    to: TO,
    interests: INTERESTS,
    minScore: MIN_SCORE,
    scannedCount: records.length,
    uniqueCount: unique.length,
    matchCount: matches.length,
    generatedAt: new Date().toISOString(),
    journals: JOURNALS.map((j) => ({
      key: j.key,
      name: j.name,
      short: j.short,
      issns: j.issns,
    })),
    ai: {
      used: Boolean(KEY),
      model: ai.model,
      error: ai.error,
    },
    matches,
    errors,
  };

  writeReports(report);
  console.log(
    JSON.stringify(
      {
        ok: true,
        month: MONTH,
        from: FROM,
        to: TO,
        scannedCount: report.scannedCount,
        uniqueCount: report.uniqueCount,
        matchCount: report.matchCount,
        aiModel: report.ai.model,
        warnings: errors.length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  const report = {
    ok: false,
    month: MONTH,
    from: FROM,
    to: TO,
    interests: INTERESTS,
    error: String(e?.message || e),
    generatedAt: new Date().toISOString(),
    scannedCount: 0,
    uniqueCount: 0,
    matchCount: 0,
    matches: [],
    errors: [],
    ai: { used: Boolean(KEY), model: null, error: "" },
  };
  writeReports(report);
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
});
