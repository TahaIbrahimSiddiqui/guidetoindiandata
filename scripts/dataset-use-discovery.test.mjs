import assert from "node:assert/strict";
import {
  buildDatasetSearchProfile,
  candidateKey,
  canonicalizeUrl,
  dedupeAndRankCandidates,
  hasExplicitTitleUseEvidence,
  hasRequiredWaveEvidence,
  normalizeDoi,
} from "../src/lib/researchDiscovery.ts";
import { getDatasetBySlug } from "../src/data/datasets.ts";
import { getSeriesForDataset } from "../src/data/series.ts";

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("ok -", name);
  } catch (error) {
    console.error("FAIL -", name);
    throw error;
  }
}

test("normalizes DOI URLs and labels", () => {
  assert.equal(normalizeDoi("https://doi.org/10.7910/DVN/YGJR1L"), "10.7910/dvn/ygjr1l");
  assert.equal(normalizeDoi("DOI: 10.1086/694101"), "10.1086/694101");
  assert.equal(normalizeDoi("not-a-doi"), undefined);
});

test("canonicalizes URLs and drops tracking", () => {
  assert.equal(
    canonicalizeUrl("https://Example.com/post/?utm_source=x#section"),
    "https://example.com/post",
  );
});

test("DOI is the primary candidate identity", () => {
  assert.equal(
    candidateKey({ doi: "10.1000/ABC", url: "https://example.com/a", title: "A" }),
    "doi:10.1000/abc",
  );
});

test("ambiguous acronyms are not standalone queries", () => {
  const dataset = getDatasetBySlug("srs-statistical-reports");
  const profile = buildDatasetSearchProfile(dataset, getSeriesForDataset(dataset.slug));
  assert.ok(profile.ambiguousAbbreviations.includes("SRS"));
  assert.ok(!profile.scholarlyQueries.some((query) => query === '"SRS" India dataset'));
});

test("wave-specific profiles require an exact year", () => {
  const dataset = getDatasetBySlug("nfhs-5");
  const profile = buildDatasetSearchProfile(dataset, getSeriesForDataset(dataset.slug));
  assert.ok(profile.requiredWaveTerms.length > 0);
  assert.equal(hasRequiredWaveEvidence(profile, "NFHS 2019-21 analysis"), true);
  assert.equal(hasRequiredWaveEvidence(profile, "Generic NFHS analysis"), false);
});

test("ambiguous titles require India context and an explicit use signal", () => {
  const dataset = getDatasetBySlug("hmis");
  const profile = buildDatasetSearchProfile(dataset, getSeriesForDataset(dataset.slug));
  assert.equal(
    hasExplicitTitleUseEvidence(
      dataset,
      profile,
      "Health Management Information System data quality in Rwanda",
    ),
    false,
  );
  assert.equal(
    hasExplicitTitleUseEvidence(
      dataset,
      profile,
      "Analysis using Health Management Information System (HMIS) data in India",
    ),
    true,
  );
});

test("manual override blocks broad-title automatic approval", () => {
  const dataset = getDatasetBySlug("road-accidents-india");
  const profile = buildDatasetSearchProfile(dataset, getSeriesForDataset(dataset.slug));
  assert.equal(profile.disableTitleAutoApproval, true);
  assert.equal(
    hasExplicitTitleUseEvidence(
      dataset,
      profile,
      "An analysis of Road Accidents in India",
    ),
    false,
  );
});

test("dedupes DOI variants and keeps stronger evidence", () => {
  const base = {
    title: "Example",
    authors: [],
    kind: "journal-article",
    url: "https://doi.org/10.1000/test",
    doi: "10.1000/test",
    relationship: "introduces",
    evidenceKind: "source-record",
    evidenceUrl: "https://doi.org/10.1000/test",
    useSummary: "Introduces the dataset.",
    discoveredVia: ["openalex"],
  };
  const results = dedupeAndRankCandidates([
    base,
    {
      ...base,
      doi: "https://doi.org/10.1000/TEST",
      relationship: "analyzes",
      evidenceKind: "exact-methods",
    },
  ]);
  assert.equal(results.length, 1);
  assert.equal(results[0].evidenceKind, "exact-methods");
});

test("ranking is deterministic and capped at 12", () => {
  const candidates = Array.from({ length: 20 }, (_, index) => ({
    title: `Work ${String(index).padStart(2, "0")}`,
    authors: [],
    year: 2000 + index,
    kind: "journal-article",
    url: `https://example.com/${index}`,
    relationship: "analyzes",
    evidenceKind: "manual-review",
    evidenceUrl: `https://example.com/${index}`,
    useSummary: "Explicitly analyzes the named dataset.",
    discoveredVia: ["google-scholar-manual"],
  }));
  const results = dedupeAndRankCandidates(candidates, 12);
  assert.equal(results.length, 12);
  assert.equal(results[0].title, "Work 19");
});

console.log(`\n${passed} dataset-use discovery tests passed`);
