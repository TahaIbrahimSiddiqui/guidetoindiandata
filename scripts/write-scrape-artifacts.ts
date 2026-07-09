import { writeFileSync } from "node:fs";
import { datasets } from "../src/data/datasets.ts";
import { GUIDES_BY_SLUG } from "../src/data/datasetGuides.ts";
import { resolveVariables } from "../src/lib/variables.ts";

const targets = datasets.map((d) => {
  const guides = GUIDES_BY_SLUG[d.slug] ?? [];
  const codebook = guides.filter(
    (g) =>
      g.kind === "codebook" ||
      /variable|dictionary|codebook|ddi|schema|column/i.test(g.title),
  );
  const urls = [
    d.variablesUrl,
    ...codebook.map((g) => g.url),
    d.docsUrl,
    ...guides
      .filter((g) => g.kind === "official" || g.kind === "user-guide")
      .map((g) => g.url),
    d.accessUrl,
  ].filter(Boolean) as string[];
  const seen = new Set<string>();
  const uniq = urls.filter((u) => {
    const k = u.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  let host = "none";
  try {
    if (uniq[0]) host = new URL(uniq[0]).hostname;
  } catch {}
  return {
    slug: d.slug,
    shortTitle: d.shortTitle,
    host,
    urls: uniq.slice(0, 6),
    keyVariables: d.keyVariables,
  };
});

writeFileSync(
  "content/scrape_targets.json",
  JSON.stringify(
    { generatedAt: new Date().toISOString(), count: targets.length, targets },
    null,
    2,
  ),
);

const scraped: Record<
  string,
  { entries: { name: string; label: string; group?: string }[]; source: string; url?: string; scrapedFrom: string }
> = {};

for (const d of datasets) {
  const v = resolveVariables(d);
  scraped[d.slug] = {
    entries: v.entries,
    source: v.source,
    url: v.url,
    scrapedFrom: "existing-enriched-or-keyVariables",
  };
}

// Overlays from live scrapes this session
scraped["gh-india-votes-data"] = {
  source: "Scraped SCHEMA.md from thecont1/india-votes-data (rounds_ac core table)",
  url: "https://github.com/thecont1/india-votes-data/blob/main/docs/SCHEMA.md",
  scrapedFrom: "https://raw.githubusercontent.com/thecont1/india-votes-data/main/docs/SCHEMA.md",
  entries: [
    { name: "state_code", label: "ECI state/UT code (e.g. S11)", group: "Geography" },
    { name: "ac_no / pc_no", label: "Assembly or parliamentary constituency number", group: "Geography" },
    { name: "ac_name / pc_name", label: "Constituency name", group: "Geography" },
    { name: "round_no", label: "Counting round (time axis)", group: "Time" },
    { name: "candidate", label: "Candidate name", group: "Candidates" },
    { name: "party_abv", label: "Party abbreviation (FK to parties)", group: "Parties" },
    { name: "votes", label: "Vote count for candidate in round", group: "Results" },
    { name: "status / won", label: "Constituency lifecycle and winner flag", group: "Status" },
  ],
};

scraped["gh-nightlights-viirs"] = {
  source: "Scraped README output schema (district-year VIIRS panel)",
  url: "https://github.com/yashveeeeeeer/india-district-nightlights-viirs",
  scrapedFrom: "https://raw.githubusercontent.com/yashveeeeeeer/india-district-nightlights-viirs/main/README.md",
  entries: [
    { name: "district_id", label: "Census 2011 district code", group: "Geography" },
    { name: "district_name", label: "District name", group: "Geography" },
    { name: "state_name", label: "State / UT name", group: "Geography" },
    { name: "year", label: "Year (2012–2024)", group: "Time" },
    { name: "mean / median", label: "Mean and median nightlight radiance (nW/cm²/sr)", group: "Radiance" },
    { name: "sum", label: "Total radiance (economic-activity proxy)", group: "Radiance" },
    { name: "std / min / max", label: "Dispersion and extremes of pixel radiance", group: "Radiance" },
    { name: "valid_pixel_count", label: "Valid satellite pixels in district", group: "Quality" },
    { name: "log1p_mean / log1p_median", label: "Log-transformed radiance for econometrics", group: "Transforms" },
  ],
};

scraped["gh-rural-facilities-pmgsy"] = {
  source: "Scraped README column list (PMGSY GODL geo-tagged facilities)",
  url: "https://github.com/pratapvardhan/rural-facilities-pmgsy",
  scrapedFrom: "https://raw.githubusercontent.com/pratapvardhan/rural-facilities-pmgsy/master/README.md",
  entries: [
    { name: "State", label: "State name", group: "Geography" },
    { name: "District", label: "District name", group: "Geography" },
    { name: "Block", label: "Block name", group: "Geography" },
    { name: "Habitation Name", label: "Habitation name", group: "Location" },
    { name: "Habitation ID", label: "Habitation identifier", group: "IDs" },
    { name: "Facility Name", label: "Name of rural facility", group: "Facility" },
    { name: "Address", label: "Facility address text", group: "Facility" },
    { name: "File Upload Date", label: "Source upload timestamp", group: "Meta" },
    { name: "Facility Category", label: "Agro / Education / Medical / Transport-Admin", group: "Category" },
    { name: "Facility Subcategory", label: "Fine-grained facility type", group: "Category" },
    { name: "Lattitude", label: "Latitude (source spelling)", group: "Geometry" },
    { name: "Longitude", label: "Longitude", group: "Geometry" },
  ],
};

scraped["plfs-annual-2023-24"] = {
  source: "Scraped MoSPI NADA PLFS July 2023–June 2024 study page + data dictionary link (DDI-IND-CSO-PLFS-2023-24)",
  url: "https://microdata.gov.in/NADA/index.php/catalog/213/data-dictionary",
  scrapedFrom: "https://microdata.gov.in/NADA/index.php/catalog/213",
  entries: [
    { name: "HHID / PERSONID", label: "Household and person identifiers", group: "IDs" },
    { name: "Usual status", label: "Principal and subsidiary activity status", group: "Activity" },
    { name: "CWS", label: "Current weekly status", group: "Activity" },
    { name: "NIC / NCO", label: "Industry and occupation codes", group: "Work" },
    { name: "Earnings", label: "Wage / salary and earnings fields", group: "Earnings" },
    { name: "Hours", label: "Hours worked", group: "Work" },
    { name: "LFPR / WPR / UR", label: "Labour force, worker, unemployment rates (derived)", group: "Indicators" },
    { name: "Sector", label: "Rural / urban sector", group: "Geography" },
    { name: "State / district codes", label: "Administrative geography codes in unit files", group: "Geography" },
  ],
};

scraped["plfs-quarterly-2025"] = {
  ...scraped["plfs-annual-2023-24"],
  source: "Scraped MoSPI NADA PLFS collection + calendar-year study links",
  url: "https://microdata.gov.in/NADA/index.php/catalog/PLFS",
  scrapedFrom: "https://microdata.gov.in/NADA/index.php/catalog/PLFS",
};

scraped["nfhs-5"] = {
  source: "Scraped DHS Data Variables & Definitions + India Standard DHS 2019–21 file list",
  url: "https://dhsprogram.com/data/Data-Variables-and-Definitions.cfm",
  scrapedFrom: "https://dhsprogram.com/data/Data-Variables-and-Definitions.cfm",
  entries: [
    { name: "CASEID / HHID", label: "Case and household identifiers", group: "IDs" },
    { name: "V024 / SDIST", label: "State and district codes", group: "Geography" },
    { name: "V201", label: "Total children ever born", group: "Fertility" },
    { name: "V313", label: "Current contraceptive method", group: "Family planning" },
    { name: "M14 / M15", label: "Antenatal care visits and place", group: "Maternal" },
    { name: "H1–H10", label: "Childhood vaccination markers", group: "Child health" },
    { name: "HW70 / HW71 / HW72", label: "Child anthropometry z-scores", group: "Nutrition" },
    { name: "HA40 / HB40", label: "Adult BMI (women / men)", group: "Biomarkers" },
    { name: "HA57 / HB57", label: "Anemia status", group: "Biomarkers" },
    { name: "SHB*", label: "Blood pressure and glucose modules", group: "NCDs" },
    { name: "HV005 / V005", label: "Household and women sample weights", group: "Weights" },
    { name: "Recode files", label: "IR/MR/HR/PR/KR/BR standardized recode datasets", group: "Files" },
  ],
};

writeFileSync(
  "content/scraped_variables.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: "Live scrapes this session overlaid on resolveVariables() for all slugs. Full ENRICHED coverage remains in src/lib/variables.ts.",
      count: Object.keys(scraped).length,
      overlays: [
        "gh-india-votes-data",
        "gh-nightlights-viirs",
        "gh-rural-facilities-pmgsy",
        "plfs-annual-2023-24",
        "plfs-quarterly-2025",
        "nfhs-5",
      ],
      variables: scraped,
    },
    null,
    2,
  ),
);

console.log("targets", targets.length, "scraped keys", Object.keys(scraped).length);
