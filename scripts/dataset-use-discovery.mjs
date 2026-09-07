/**
 * Discover evidence-backed works that use catalog datasets.
 *
 * Dry run (default): npm run discover:uses
 * Apply approved DOI/source-record matches: DATASET_USE_APPLY=true npm run discover:uses
 * Limit a run: DATASET_USE_SLUGS=nfhs-5,idsp-weekly-outbreaks
 */
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { datasets } from "../src/data/datasets.ts";
import { getSeriesForDataset } from "../src/data/series.ts";
import {
  buildDatasetSearchProfile,
  candidateKey,
  canonicalizeUrl,
  dedupeAndRankCandidates,
  hasExplicitTitleUseEvidence,
  normalizeDoi,
} from "../src/lib/researchDiscovery.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = join(ROOT, "src/data/datasetUses.json");
const SCRATCH = process.env.SCRATCH || join(ROOT, "content/automation/.scratch");
const APPLY = /^(1|true|yes)$/i.test(process.env.DATASET_USE_APPLY || "");
const REVALIDATE = /^(1|true|yes)$/i.test(
  process.env.DATASET_USE_REVALIDATE || "",
);
const MAX_USES = Math.max(
  1,
  Math.min(12, Number(process.env.DATASET_USE_MAX || 12)),
);
const LIMIT = Math.max(0, Number(process.env.DATASET_USE_LIMIT || 0));
const TODAY = new Date().toISOString().slice(0, 10);
const OPENALEX_KEY = process.env.OPENALEX_API_KEY || "";
const OPENALEX_MAILTO = process.env.OPENALEX_MAILTO || "";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const selectedSlugs = new Set(
  (process.env.DATASET_USE_SLUGS || "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean),
);

mkdirSync(SCRATCH, { recursive: true });

function readCatalog() {
  const parsed = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  if (parsed.version !== 1 || !parsed.works || !parsed.datasets) {
    throw new Error("src/data/datasetUses.json has an unsupported shape");
  }
  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          "User-Agent": `IndianDataGuide/1.0 (${OPENALEX_MAILTO || "https://tahaibrahim.in"})`,
          ...(options.headers || {}),
        },
        signal: AbortSignal.timeout(45_000),
      });
      const text = await response.text();
      if (!response.ok) {
        const error = new Error(
          `${response.status} ${response.statusText}: ${text.slice(0, 300)}`,
        );
        error.status = response.status;
        throw error;
      }
      return JSON.parse(text);
    } catch (error) {
      lastError = error;
      if (error.status && error.status < 500) throw error;
      if (attempt < attempts) await sleep(400 * 2 ** (attempt - 1));
    }
  }
  throw lastError;
}

let openAlexBudgetError = null;
async function fetchOpenAlex(url) {
  if (openAlexBudgetError) throw openAlexBudgetError;
  try {
    return await fetchJson(url);
  } catch (error) {
    if (error.status === 429 && /budget|remaining|funds/i.test(String(error))) {
      openAlexBudgetError = error;
    }
    throw error;
  }
}

function openAlexUrl(path, params = {}) {
  const url = new URL(`https://api.openalex.org/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }
  if (OPENALEX_KEY) url.searchParams.set("api_key", OPENALEX_KEY);
  if (OPENALEX_MAILTO) url.searchParams.set("mailto", OPENALEX_MAILTO);
  return url.toString();
}

async function openAlexWorkByDoi(doi) {
  const normalized = normalizeDoi(doi);
  if (!normalized) return null;
  try {
    return await fetchOpenAlex(
      openAlexUrl(`works/https://doi.org/${encodeURIComponent(normalized)}`),
    );
  } catch (error) {
    if (/404/.test(String(error))) return null;
    throw error;
  }
}

async function openAlexSearch(query, perPage = 12) {
  const data = await fetchOpenAlex(
    openAlexUrl("works", {
      search: query,
      per_page: String(perPage),
      select:
        "id,doi,title,publication_year,type,cited_by_count,authorships,primary_location,best_oa_location",
    }),
  );
  return data.results || [];
}

async function openAlexCitingWorks(workId) {
  const id = String(workId || "").split("/").pop();
  if (!id) return [];
  const data = await fetchOpenAlex(
    openAlexUrl("works", {
      filter: `cites:${id}`,
      per_page: "100",
      select:
        "id,doi,title,publication_year,type,cited_by_count,authorships,primary_location,best_oa_location",
    }),
  );
  return data.results || [];
}

function openAlexKind(type) {
  const kinds = {
    article: "journal-article",
    "journal-article": "journal-article",
    "proceedings-article": "conference-paper",
    proceedings: "conference-paper",
    preprint: "working-paper",
    report: "report",
    dissertation: "thesis",
  };
  return kinds[type] || null;
}

function openAlexCandidate(work, evidenceKind, relationship, useSummary, sources) {
  const kind = openAlexKind(work.type);
  const doi = normalizeDoi(work.doi);
  const location = work.primary_location || work.best_oa_location || {};
  const url = doi
    ? `https://doi.org/${doi}`
    : location.landing_page_url || location.pdf_url || work.id;
  if (!kind || !work.title || !/^https?:\/\//i.test(url || "")) return null;

  return {
    title: work.title.trim(),
    authors: (work.authorships || [])
      .map((entry) => entry.author?.display_name)
      .filter(Boolean),
    publisher: location.source?.display_name || undefined,
    year: work.publication_year || undefined,
    kind,
    url: canonicalizeUrl(url),
    doi,
    citationCount: Number.isFinite(work.cited_by_count)
      ? work.cited_by_count
      : undefined,
    relationship,
    evidenceKind,
    evidenceUrl: canonicalizeUrl(url),
    useSummary,
    discoveredVia: sources,
  };
}

async function crossrefWorkByDoi(doi) {
  const normalized = normalizeDoi(doi);
  if (!normalized) return null;
  try {
    const data = await fetchJson(
      `https://api.crossref.org/works/${encodeURIComponent(normalized)}${
        OPENALEX_MAILTO ? `?mailto=${encodeURIComponent(OPENALEX_MAILTO)}` : ""
      }`,
    );
    return data.message || null;
  } catch (error) {
    if (/404/.test(String(error))) return null;
    throw error;
  }
}

function crossrefCandidate(work, useSummary) {
  if (!work) return null;
  const typeMap = {
    "journal-article": "journal-article",
    proceedings: "conference-paper",
    "proceedings-article": "conference-paper",
    report: "report",
    dissertation: "thesis",
    posted: "working-paper",
  };
  const kind = typeMap[work.type] || "journal-article";
  const doi = normalizeDoi(work.DOI);
  const title = Array.isArray(work.title) ? work.title[0] : work.title;
  if (!doi || !title) return null;
  const dateParts =
    work.published?.["date-parts"]?.[0] ||
    work.issued?.["date-parts"]?.[0] ||
    [];
  return {
    title: String(title).trim(),
    authors: (work.author || [])
      .map((author) => [author.given, author.family].filter(Boolean).join(" "))
      .filter(Boolean),
    publisher:
      (Array.isArray(work["container-title"])
        ? work["container-title"][0]
        : work["container-title"]) || work.publisher || undefined,
    year: Number(dateParts[0]) || undefined,
    kind,
    url: `https://doi.org/${doi}`,
    doi,
    citationCount: Number.isFinite(work["is-referenced-by-count"])
      ? work["is-referenced-by-count"]
      : undefined,
    relationship: "analyzes",
    evidenceKind: "source-record",
    evidenceUrl: `https://doi.org/${doi}`,
    useSummary,
    discoveredVia: ["crossref", "catalog-record"],
  };
}

async function dataCiteRelatedDois(dataDoi) {
  const doi = normalizeDoi(dataDoi);
  if (!doi) return [];
  const url = new URL("https://api.datacite.org/events");
  url.searchParams.set("obj-id", `https://doi.org/${doi}`);
  url.searchParams.set("page[size]", "100");
  try {
    const data = await fetchJson(url.toString(), {}, 2);
    const allowedRelations = new Set([
      "references",
      "is-cited-by",
      "is-referenced-by",
    ]);
    return (data.data || [])
      .map((event) => event.attributes || event)
      .filter((event) =>
        allowedRelations.has(
          String(event["relation-type-id"] || event.relationTypeId || "").toLowerCase(),
        ),
      )
      .map((event) => event["subj-id"] || event.subjectId || event.subjId)
      .map((value) => normalizeDoi(value))
      .filter(Boolean);
  } catch (error) {
    return { error: String(error), dois: [] };
  }
}

async function discoverScholarly(dataset, profile) {
  const approved = [];
  const candidates = [];
  const errors = [];
  let dataCiteStatus = "not-applicable";

  if (dataset.paperDoi) {
    const summary = dataset.sourceKind === "replication"
      ? "This is the publication associated with the replication package and analyzes the included data."
      : "This publication is directly associated with the dataset record and analyzes or introduces its data.";
    let work = null;
    try {
      work = await openAlexWorkByDoi(dataset.paperDoi);
    } catch (error) {
      errors.push(`paper DOI OpenAlex lookup: ${error}`);
    }
    let candidate = work
      ? openAlexCandidate(
          work,
          "source-record",
          dataset.sourceKind === "replication" ? "analyzes" : "introduces",
          summary,
          ["openalex", "catalog-record"],
        )
      : null;
    if (!candidate) {
      try {
        candidate = crossrefCandidate(
          await crossrefWorkByDoi(dataset.paperDoi),
          summary,
        );
      } catch (error) {
        errors.push(`paper DOI Crossref lookup: ${error}`);
      }
    }
    if (candidate) approved.push(candidate);
  }

  if (dataset.dataDoi) {
    try {
      const dataWork = await openAlexWorkByDoi(dataset.dataDoi);
      if (dataWork?.id) {
        const citing = await openAlexCitingWorks(dataWork.id);
        for (const work of citing) {
          if (normalizeDoi(work.doi) === normalizeDoi(dataset.paperDoi)) continue;
          const candidate = openAlexCandidate(
            work,
            "data-doi-reference",
            "reuses",
            "This work cites the dataset DOI as a research data source.",
            ["openalex"],
          );
          if (candidate) approved.push(candidate);
        }
      }
    } catch (error) {
      errors.push(`OpenAlex data DOI citations: ${error}`);
    }

    const related = await dataCiteRelatedDois(dataset.dataDoi);
    const relatedDois = Array.isArray(related) ? related : related.dois;
    dataCiteStatus = Array.isArray(related) ? "complete" : "failed";
    if (!Array.isArray(related) && related.error) {
      errors.push(`DataCite events: ${related.error}`);
    }
    for (const doi of relatedDois) {
      if (doi === normalizeDoi(dataset.paperDoi)) continue;
      try {
        let work = null;
        try {
          work = await openAlexWorkByDoi(doi);
        } catch (error) {
          errors.push(`DataCite OpenAlex enrichment ${doi}: ${error}`);
        }
        const candidate = work
          ? openAlexCandidate(
              work,
              "data-doi-reference",
              "reuses",
              "This work references the dataset DOI as a research data source.",
              ["datacite", "openalex"],
            )
          : crossrefCandidate(
              await crossrefWorkByDoi(doi),
              "This work references the dataset DOI as a research data source.",
            );
        if (candidate) {
          candidate.relationship = "reuses";
          candidate.evidenceKind = "data-doi-reference";
          candidate.discoveredVia = ["datacite", ...candidate.discoveredVia];
          approved.push(candidate);
        }
      } catch (error) {
        errors.push(`DataCite related DOI ${doi}: ${error}`);
      }
    }
  }

  const primaryQuery = profile.scholarlyQueries.find(
    (query) => !normalizeDoi(query.replaceAll('"', "")),
  );
  if (primaryQuery) {
    try {
      const works = await openAlexSearch(primaryQuery, 12);
      for (const work of works) {
        if (normalizeDoi(work.doi) === normalizeDoi(dataset.dataDoi)) continue;
        const text = work.title || "";
        const candidate = openAlexCandidate(
          work,
          "source-record",
          "introduces",
          "This publication introduces or directly documents the named dataset.",
          ["openalex"],
        );
        if (!candidate) continue;
        if (
          hasExplicitTitleUseEvidence(dataset, profile, text)
        ) {
          candidate.relationship = "analyzes";
          candidate.useSummary = `This work explicitly identifies ${dataset.shortTitle} as data used in its analysis.`;
          approved.push(candidate);
        } else {
          candidates.push({
            ...candidate,
            reason: "Exact-name search result requires manual use verification",
          });
        }
      }
    } catch (error) {
      errors.push(`OpenAlex title/full-text search: ${error}`);
    }
  }

  return {
    approved: dedupeAndRankCandidates(approved, MAX_USES),
    candidates: dedupeAndRankCandidates(candidates, 12),
    errors,
    complete: errors.every((error) => !error.startsWith("OpenAlex title")),
    dataCiteStatus,
  };
}

function extractJson(text) {
  const raw = String(text || "").trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Gemini returned no JSON object");
  return JSON.parse(raw.slice(start, end + 1));
}

async function discoverWeb(dataset, profile) {
  if (!GEMINI_KEY) {
    return { complete: false, candidates: [], error: "GEMINI_API_KEY not set" };
  }

  const prompt = `Find substantive public blog posts, explainers, or data-journalism articles that explicitly analyze, reuse, or visualize this dataset. Do not include dataset landing pages, documentation, academic papers, search pages, or pages that merely mention it.

Dataset: ${dataset.title}
Abbreviations: ${dataset.abbreviations.join(", ") || "none"}
Institution: ${dataset.institution}
Time coverage: ${dataset.timeCoverage}
Queries: ${profile.webQueries.slice(0, 4).join(" | ")}

Return JSON: {"items":[{"title":"","url":"https://...","authors":[],"publisher":"","year":2026,"relationship":"analyzes|reuses|visualizes","useSummary":"One factual sentence explaining exactly how the page used the data.","evidenceUrl":"https://..."}]}. Return at most 8 items. If explicit use cannot be confirmed, return an empty items array.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
  try {
    const response = await fetchJson(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    });
    const candidate = response.candidates?.[0];
    const text = (candidate?.content?.parts || []).map((part) => part.text || "").join("\n");
    const groundedUrls = new Set(
      (candidate?.groundingMetadata?.groundingChunks || [])
        .map((chunk) => chunk.web?.uri)
        .filter(Boolean)
        .map(canonicalizeUrl),
    );
    const parsed = extractJson(text);
    const candidates = (parsed.items || [])
      .filter((item) => item.title && /^https?:\/\//i.test(item.url || ""))
      .map((item) => ({
        title: String(item.title).trim(),
        authors: Array.isArray(item.authors) ? item.authors.map(String) : [],
        publisher: item.publisher ? String(item.publisher) : undefined,
        year: Number(item.year) || undefined,
        kind: "blog",
        url: canonicalizeUrl(item.url),
        relationship: ["analyzes", "reuses", "visualizes"].includes(item.relationship)
          ? item.relationship
          : "analyzes",
        evidenceKind: "manual-review",
        evidenceUrl: canonicalizeUrl(item.evidenceUrl || item.url),
        useSummary: String(item.useSummary || "").trim(),
        discoveredVia: ["google-search"],
        grounded: groundedUrls.has(canonicalizeUrl(item.evidenceUrl || item.url)),
        reason: "Google-grounded web result requires editorial review before publication",
      }))
      .filter((item) => item.useSummary.length >= 30);
    return { complete: true, candidates: dedupeAndRankCandidates(candidates, 8) };
  } catch (error) {
    return { complete: false, candidates: [], error: String(error) };
  }
}

function mergeSources(a, b) {
  return [...new Set([...(a || []), ...(b || [])])];
}

function revalidateCatalog(catalog) {
  const works = {};
  for (const dataset of datasets) {
    const status = catalog.datasets[dataset.slug];
    if (!status) continue;
    const profile = buildDatasetSearchProfile(
      dataset,
      getSeriesForDataset(dataset.slug),
    );
    const uses = [];
    for (const link of status.uses || []) {
      const work = catalog.works[link.workId];
      if (!work) continue;
      const catalogLinked = link.discoveredVia?.includes("catalog-record");
      const publishable =
        link.evidenceKind !== "source-record" ||
        catalogLinked ||
        hasExplicitTitleUseEvidence(dataset, profile, work.title);
      if (!publishable) continue;

      const normalizedLink =
        link.evidenceKind === "source-record" && !catalogLinked
          ? {
              ...link,
              relationship: "analyzes",
              useSummary: `This work explicitly identifies ${dataset.shortTitle} as data used in its analysis.`,
            }
          : link;
      const workId = candidateKey({ ...work, ...normalizedLink });
      works[workId] = { ...work, id: workId };
      uses.push({ ...normalizedLink, workId });
    }
    status.uses = [...new Map(uses.map((use) => [use.workId, use])).values()]
      .slice(0, MAX_USES);
  }
  catalog.works = works;
}

function applyCandidates(catalog, dataset, candidates, scholarlyComplete, webComplete) {
  const current = catalog.datasets[dataset.slug] || {
    scholarlyCheckedAt: null,
    webCheckedAt: null,
    uses: [],
  };
  const links = new Map(current.uses.map((use) => [use.workId, use]));

  for (const candidate of candidates) {
    const workId = candidateKey(candidate);
    const existingWork = catalog.works[workId];
    catalog.works[workId] = {
      id: workId,
      title: candidate.title,
      authors: candidate.authors || [],
      ...(candidate.publisher ? { publisher: candidate.publisher } : {}),
      ...(candidate.year ? { year: candidate.year } : {}),
      kind: candidate.kind,
      url: canonicalizeUrl(candidate.url),
      ...(normalizeDoi(candidate.doi) ? { doi: normalizeDoi(candidate.doi) } : {}),
      ...(Number.isFinite(candidate.citationCount)
        ? { citationCount: candidate.citationCount }
        : existingWork?.citationCount !== undefined
          ? { citationCount: existingWork.citationCount }
          : {}),
    };
    const existing = links.get(workId);
    links.set(workId, {
      workId,
      relationship: candidate.relationship,
      evidenceKind: candidate.evidenceKind,
      evidenceUrl: canonicalizeUrl(candidate.evidenceUrl),
      useSummary: candidate.useSummary,
      discoveredVia: mergeSources(existing?.discoveredVia, candidate.discoveredVia),
    });
  }

  const rankedIds = dedupeAndRankCandidates(
    [...links.values()].map((link) => ({
      ...catalog.works[link.workId],
      ...link,
    })),
    MAX_USES,
  ).map(candidateKey);
  const rankOrder = new Map(rankedIds.map((id, index) => [id, index]));

  catalog.datasets[dataset.slug] = {
    scholarlyCheckedAt: scholarlyComplete ? TODAY : current.scholarlyCheckedAt,
    webCheckedAt: webComplete ? TODAY : current.webCheckedAt,
    uses: [...links.values()]
      .filter((link) => rankOrder.has(link.workId))
      .sort((a, b) => rankOrder.get(a.workId) - rankOrder.get(b.workId)),
  };
}

const selected = datasets
  .filter((dataset) => selectedSlugs.size === 0 || selectedSlugs.has(dataset.slug))
  .slice(0, LIMIT || undefined);
const catalog = readCatalog();
if (APPLY && REVALIDATE) revalidateCatalog(catalog);
const reports = [];

for (let index = 0; index < selected.length; index++) {
  const dataset = selected[index];
  const profile = buildDatasetSearchProfile(
    dataset,
    getSeriesForDataset(dataset.slug),
  );
  console.log(`[${index + 1}/${selected.length}] ${dataset.slug}`);
  const scholarly = await discoverScholarly(dataset, profile);
  const web = await discoverWeb(dataset, profile);
  const approved = dedupeAndRankCandidates(scholarly.approved, MAX_USES);

  reports.push({
    slug: dataset.slug,
    title: dataset.title,
    profile,
    approved,
    scholarlyCandidates: scholarly.candidates,
    webCandidates: web.candidates,
    scholarlyComplete: scholarly.complete,
    webComplete: web.complete,
    errors: [...scholarly.errors, ...(web.error ? [web.error] : [])],
  });

  if (APPLY) {
    applyCandidates(
      catalog,
      dataset,
      approved,
      scholarly.complete,
      web.complete,
    );
  }
}

// Every catalog record gets an explicit status object, even before its first scan.
if (APPLY) {
  for (const dataset of datasets) {
    catalog.datasets[dataset.slug] ||= {
      scholarlyCheckedAt: null,
      webCheckedAt: null,
      uses: [],
    };
  }
  catalog.datasets = Object.fromEntries(
    Object.entries(catalog.datasets).sort(([a], [b]) => a.localeCompare(b)),
  );
  catalog.works = Object.fromEntries(
    Object.entries(catalog.works).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
}

const summary = {
  generatedAt: new Date().toISOString(),
  applied: APPLY,
  selectedDatasets: selected.length,
  scholarlyComplete: reports.filter((report) => report.scholarlyComplete).length,
  webComplete: reports.filter((report) => report.webComplete).length,
  approvedUses: reports.reduce((sum, report) => sum + report.approved.length, 0),
  scholarlyCandidates: reports.reduce(
    (sum, report) => sum + report.scholarlyCandidates.length,
    0,
  ),
  webCandidates: reports.reduce(
    (sum, report) => sum + report.webCandidates.length,
    0,
  ),
  errorCount: reports.reduce((sum, report) => sum + report.errors.length, 0),
};
const payload = { summary, reports };
writeFileSync(
  join(SCRATCH, "dataset-use-discovery-latest.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
);
writeFileSync(
  join(SCRATCH, "dataset-use-discovery-latest.md"),
  [
    "# Dataset use discovery",
    "",
    `Generated: ${summary.generatedAt}`,
    `Applied approved matches: ${summary.applied ? "yes" : "no"}`,
    `Datasets scanned: ${summary.selectedDatasets}`,
    `Scholarly scans complete: ${summary.scholarlyComplete}`,
    `Web scans complete: ${summary.webComplete}`,
    `Approved evidence-backed uses: ${summary.approvedUses}`,
    `Scholarly candidates requiring review: ${summary.scholarlyCandidates}`,
    `Web candidates requiring review: ${summary.webCandidates}`,
    `Provider errors or skipped sources: ${summary.errorCount}`,
    "",
    "Search candidates in the JSON artifact are not published. Only approved DOI or catalog-record evidence is written to the site catalog.",
  ].join("\n"),
);

console.log(JSON.stringify(summary, null, 2));
