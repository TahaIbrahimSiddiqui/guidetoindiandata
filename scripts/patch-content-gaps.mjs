/**
 * One-shot patcher: fill missing access URLs + expand thin editorial fields.
 * Run: npx tsx scripts/patch-content-gaps.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

function injectAccess(source, slug, urls) {
  const slugMarker = `slug: "${slug}"`;
  const start = source.indexOf(slugMarker);
  if (start < 0) throw new Error(`slug block not found: ${slug}`);
  const after = source.slice(start);
  const clusterIdx = after.search(/\n\s*cluster:/);
  if (clusterIdx < 0) throw new Error(`cluster not found for ${slug}`);
  let block = after.slice(0, clusterIdx);
  if (/accessUrl:|docsUrl:|dataDoi:/.test(block)) {
    console.log("skip (already has link):", slug);
    return source;
  }
  const instMatch = block.match(/institution: "[^"]*",\n/);
  if (!instMatch) throw new Error(`no institution in ${slug}`);
  let insert = "";
  if (urls.accessUrl) insert += `    accessUrl: "${urls.accessUrl}",\n`;
  if (urls.docsUrl) insert += `    docsUrl: "${urls.docsUrl}",\n`;
  if (urls.dataDoi) insert += `    dataDoi: "${urls.dataDoi}",\n`;
  const newBlock = block.replace(instMatch[0], instMatch[0] + insert);
  return source.slice(0, start) + newBlock + source.slice(start + block.length);
}

function patchField(source, slug, field, value) {
  const slugMarker = `slug: "${slug}"`;
  const start = source.indexOf(slugMarker);
  if (start < 0) throw new Error(`slug not found: ${slug}`);
  const nextSlug = source.indexOf("\n    slug: ", start + slugMarker.length);
  const end = nextSlug < 0 ? source.length : nextSlug;
  const block = source.slice(start, end);
  const fieldRe = new RegExp(`${field}: "[^"]*"`);
  const fm = block.match(fieldRe);
  if (!fm) throw new Error(`field ${field} not found for ${slug}`);
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const newBlock = block.replace(fm[0], `${field}: "${escaped}"`);
  return source.slice(0, start) + newBlock + source.slice(end);
}

// ── datasets.ts access URLs ───────────────────────────────────────
const datasetsPath = "src/data/datasets.ts";
let datasetsSrc = readFileSync(datasetsPath, "utf8");

const accessPatches = {
  "dlhs-1": {
    accessUrl: "https://www.iipsindia.ac.in/",
    docsUrl: "https://ghdx.healthdata.org/",
  },
  "dlhs-2": {
    accessUrl: "https://ghdx.healthdata.org/",
    docsUrl: "https://www.iipsindia.ac.in/",
  },
  "dlhs-3": {
    accessUrl: "https://www.iipsindia.ac.in/",
    docsUrl: "https://ghdx.healthdata.org/",
  },
  "dlhs-4": {
    accessUrl: "https://ghdx.healthdata.org/",
    docsUrl: "https://www.iipsindia.ac.in/",
  },
  "lasi-wave-1": {
    accessUrl: "https://www.iipsindia.ac.in/content/LASI-data",
    docsUrl: "https://www.iipsindia.ac.in/lasi/",
  },
  "lasi-dad": {
    accessUrl: "https://www.lasi-dad.org/data/overview",
    docsUrl: "https://www.lasi-dad.org/",
  },
  "nas-2021": {
    accessUrl: "https://parakh.ncert.gov.in/nas-dashboard",
    docsUrl: "https://ncert.nic.in/",
  },
  wpi: { accessUrl: "https://eaindustry.nic.in/" },
  "input-survey-2016-17": { accessUrl: "https://agcensus.nic.in/" },
  "input-survey-2022-23": { accessUrl: "https://agcensus.nic.in/" },
  "cost-of-cultivation": {
    accessUrl: "https://desagri.gov.in/",
    docsUrl: "https://cacp.dacnet.nic.in/",
  },
  "enam-dashboard": { accessUrl: "https://www.enam.gov.in/" },
  "soil-health-card": { accessUrl: "https://www.soilhealth.dac.gov.in/" },
  "india-wris-reservoirs": { accessUrl: "https://indiawris.gov.in/" },
  "cgwb-groundwater": {
    accessUrl: "https://indiawris.gov.in/",
    docsUrl: "https://cgwb.gov.in/",
  },
  "npp-grid-india": {
    accessUrl: "https://npp.gov.in/",
    docsUrl: "https://grid-india.in/",
  },
  "road-accidents-india": { accessUrl: "https://morth.nic.in/" },
  "pmgsy-dashboard": {
    accessUrl: "https://omms.nic.in/",
    docsUrl: "https://pmgsy.nic.in/",
  },
  "dgca-monthly-traffic": { accessUrl: "https://www.dgca.gov.in/" },
  "jjm-dashboard": {
    accessUrl: "https://ejalshakti.gov.in/jjmreport/JJMIndia.aspx",
    docsUrl: "https://jaljeevanmission.gov.in/",
  },
  "sbm-g-dashboard": { accessUrl: "https://sbm.gov.in/" },
  "wastelands-atlas-2019": {
    accessUrl: "https://dolr.gov.in/",
    docsUrl: "https://bhuvan.nrsc.gov.in/",
  },
};

let accessCount = 0;
for (const [slug, urls] of Object.entries(accessPatches)) {
  const before = datasetsSrc;
  datasetsSrc = injectAccess(datasetsSrc, slug, urls);
  if (datasetsSrc !== before) {
    accessCount++;
    console.log("access patched:", slug);
  }
}

// Thin fields in datasets.ts
const datasetsThin = {
  "prison-statistics-india": {
    limitations:
      "Annual NCRB PDF packaging; definitions and table structures can shift across years",
  },
  "cea-installed-capacity": {
    limitations:
      "Monthly capacity tables arrive as PDF/XLS packs; series construction needs careful base handling",
  },
};
for (const [slug, fields] of Object.entries(datasetsThin)) {
  for (const [field, value] of Object.entries(fields)) {
    datasetsSrc = patchField(datasetsSrc, slug, field, value);
    console.log("thin patched datasets:", slug, field);
  }
}
writeFileSync(datasetsPath, datasetsSrc);
console.log("wrote datasets.ts, access:", accessCount);

// ── academicDatasets.ts thin ──────────────────────────────────────
const academicPath = "src/data/academicDatasets.ts";
let academicSrc = readFileSync(academicPath, "utf8");
const academicThin = {
  "covid-r-estimates-india": {
    limitations:
      "Research deposit; check Dataverse license and formats before redistribution",
  },
  "india-treaty-registry": {
    limitations:
      "Research deposit; verify Dataverse license and citation terms for reuse",
  },
};
for (const [slug, fields] of Object.entries(academicThin)) {
  for (const [field, value] of Object.entries(fields)) {
    academicSrc = patchField(academicSrc, slug, field, value);
    console.log("thin patched academic:", slug, field);
  }
}
writeFileSync(academicPath, academicSrc);
console.log("wrote academicDatasets.ts");

// ── githubDatasets.ts thin ────────────────────────────────────────
const githubPath = "src/data/githubDatasets.ts";
let githubSrc = readFileSync(githubPath, "utf8");
const githubThin = {
  "gh-udise-schools": {
    exampleUses:
      "School access maps and catchment analysis against population layers",
  },
  "gh-india-maps-data": {
    exampleUses:
      "Quick web maps and front-end demos via CDN-friendly map assets",
  },
  "gh-village-boundaries": {
    exampleUses:
      "Village choropleths and rural boundary joins with survey microdata",
  },
};
for (const [slug, fields] of Object.entries(githubThin)) {
  for (const [field, value] of Object.entries(fields)) {
    githubSrc = patchField(githubSrc, slug, field, value);
    console.log("thin patched github:", slug, field);
  }
}
writeFileSync(githubPath, githubSrc);
console.log("wrote githubDatasets.ts");
console.log("ALL DONE");
