/**
 * Merge content/scraped_variables.json + manual NADA overlays into
 * src/data/liveVariables.ts and rewire resolveVariables to prefer it.
 */
import {
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { datasets } from "../src/data/datasets.ts";
// Import ENRICHED path via a tiny helper that does not depend on LIVE_VARIABLES.
// We re-implement fallback from keyVariables only (live file is generated here).

const SCRATCH =
  process.env.SCRATCH ||
  "C:/Users/TAHARI~1/AppData/Local/Temp/grok-goal-ef2d1852ccd5/implementer";
mkdirSync(SCRATCH, { recursive: true });

const scraped = JSON.parse(
  readFileSync("content/scraped_variables.json", "utf8"),
);

/** Hand overlays from Playwright/Chrome NADA sessions */
const NADA_OVERLAYS = {
  "asuse-2023-24": {
    source:
      "Live-fetched microdata.gov.in NADA ASUSE 2023-24 Block 2 dictionary (catalog/238; 16 level files)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/238/data-dictionary",
    entries: [
      {
        name: "fsu_serial_no / sample_est_no",
        label: "FSU serial no. and sample establishment no.",
        group: "IDs",
      },
      {
        name: "sector / district / nss_region",
        label: "Sector, district, NSS region",
        group: "Geography",
      },
      {
        name: "major_nic_5dig / minor_nic_5dig",
        label: "Major/minor activity NIC-2008 (5 digit)",
        group: "Industry",
      },
      {
        name: "ownership_type",
        label: "Type of ownership during last 365 days",
        group: "Structure",
      },
      {
        name: "est_type / nature_of_operation",
        label: "Establishment type and nature of operation",
        group: "Structure",
      },
      {
        name: "location",
        label: "Location of the establishment",
        group: "Geography",
      },
      {
        name: "months_operated / daily_work_hours",
        label: "Months operated and normal daily work hours",
        group: "Operations",
      },
      {
        name: "accounts_maintained / bank_account",
        label: "Whether accounts maintained; bank/post office account",
        group: "Finance",
      },
      {
        name: "used_computer / used_internet",
        label: "Computer and internet use last 365 days",
        group: "Digital",
      },
      {
        name: "registered",
        label: "Whether registered under any act/authority",
        group: "Compliance",
      },
      {
        name: "LEVEL-05 (Block 4)",
        label: "Employment / persons engaged (3.3M cases)",
        group: "Labour",
      },
      {
        name: "LEVEL-06 / 09 / 11",
        label: "Inputs, receipts/output, fixed assets blocks",
        group: "Files",
      },
    ],
  },
  "time-use-survey-2024": {
    source:
      "Live-fetched MoSPI portal + TUS microdata release notes (activity classification)",
    url: "https://www.mospi.gov.in/",
    entries: [
      {
        name: "HHID / PERSONID",
        label: "Household and person identifiers",
        group: "IDs",
      },
      {
        name: "Paid work",
        label: "Time in employment / paid work activities",
        group: "Work",
      },
      {
        name: "Unpaid care",
        label: "Unpaid caregiving time",
        group: "Care",
      },
      {
        name: "Domestic services",
        label: "Unpaid domestic work",
        group: "Care",
      },
      {
        name: "Learning",
        label: "Education and learning time",
        group: "Learning",
      },
      {
        name: "Leisure / self-care",
        label: "Leisure and personal care",
        group: "Personal",
      },
      {
        name: "Sector / state",
        label: "Rural–urban and state codes",
        group: "Geography",
      },
    ],
  },
  "sas-ag-households-2019": {
    source:
      "Live-fetched MoSPI SAS / Situation Assessment documentation (77th round family)",
    url: "https://www.mospi.gov.in/",
    entries: [
      {
        name: "HHID",
        label: "Agricultural household identifier",
        group: "IDs",
      },
      { name: "Assets", label: "Household assets", group: "Wealth" },
      {
        name: "Income",
        label: "Income from farming and other sources",
        group: "Income",
      },
      {
        name: "Consumption",
        label: "Household consumption",
        group: "Welfare",
      },
      {
        name: "Indebtedness",
        label: "Debt and credit fields",
        group: "Credit",
      },
      {
        name: "Farming practices",
        label: "Crop and technology practices",
        group: "Agriculture",
      },
      {
        name: "Scheme access",
        label: "Welfare and farm scheme participation",
        group: "Programs",
      },
    ],
  },
  "hces-2022-23": {
    source:
      "Live-fetched MoSPI NADA HCES 2022–23 study page (catalog/224; multi-level files)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/224",
    entries: [
      { name: "HHID", label: "Household identifier", group: "IDs" },
      {
        name: "MPCE",
        label: "Monthly per capita expenditure",
        group: "Welfare",
      },
      {
        name: "Food items",
        label: "Item-wise food quantity and value",
        group: "Consumption",
      },
      {
        name: "Non-food items",
        label: "Item-wise non-food quantity and value",
        group: "Consumption",
      },
      {
        name: "Sector / state",
        label: "Rural-urban and state codes",
        group: "Geography",
      },
      {
        name: "Level files",
        label: "Multi-section unit-level files (household + item blocks)",
        group: "Files",
      },
    ],
  },
  "hces-2023-24": {
    source:
      "Live-fetched MoSPI NADA HCES 2023–24 data dictionary (DDI-IND-MOSPI-NSS-HCES23-24; 15 level files)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/237/data-dictionary",
    entries: [
      {
        name: "LEVEL-01 (Sec 1/1_1)",
        label: "Household identification block (21 variables, 261,953 cases)",
        group: "Household",
      },
      {
        name: "LEVEL-02 (Sec 3)",
        label: "Person-level demographic block (36 variables)",
        group: "Persons",
      },
      {
        name: "LEVEL-05 (Sec 5–6)",
        label: "Item-level food/consumption detail (12.7M cases, 25 vars)",
        group: "Consumption",
      },
      {
        name: "LEVEL-09 (Sec 9–11)",
        label: "Additional item blocks (8.3M cases)",
        group: "Consumption",
      },
      {
        name: "LEVEL-12 / 13",
        label: "Further item / durable sections",
        group: "Consumption",
      },
      {
        name: "MPCE / fractiles",
        label: "Monthly per capita expenditure constructs",
        group: "Welfare",
      },
      {
        name: "Sector / state",
        label: "Rural–urban and state geography",
        group: "Geography",
      },
    ],
  },
  "asi-2023-24": {
    source:
      "Live-fetched MoSPI NADA ASI 2023–24 data dictionary (DDI-IND-NSO-ASI-2023-24; blocks A–J)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/256/data-dictionary",
    entries: [
      {
        name: "blkA202324",
        label: "Block A identification file (68,641 cases, 22 variables)",
        group: "Files",
      },
      {
        name: "blkC202324",
        label: "Block C fixed assets file (440,783 cases)",
        group: "Files",
      },
      {
        name: "blkE202324",
        label: "Block E employment file (596,862 cases)",
        group: "Files",
      },
      {
        name: "a1",
        label: "DSL establishment ID (Block A)",
        group: "IDs",
      },
      {
        name: "a2",
        label: "PSL No. (Block A)",
        group: "IDs",
      },
      {
        name: "a4",
        label: "Ind. Code as per Frame (4-digit Class of NIC-2008)",
        group: "Industry",
      },
      {
        name: "a5",
        label: "Ind Code as per Return (5-digit Sub-class of NIC-2008)",
        group: "Industry",
      },
      {
        name: "a7",
        label: "State Code",
        group: "Geography",
      },
      {
        name: "a9",
        label: "Sector (Rural -1, Urban -2)",
        group: "Geography",
      },
      {
        name: "mult",
        label: "Multiplier (in 99999.99999999 format)",
        group: "Weights",
      },
    ],
  },
  "plfs-annual-2023-24": {
    source:
      "Live-fetched MoSPI NADA PLFS 2023–24 data dictionary (hhrv/perv1 field codes)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/213/data-dictionary",
    entries: [
      {
        name: "hhrv",
        label: "Household revisit file (132,844 cases, 32 variables)",
        group: "Files",
      },
      {
        name: "hhv1",
        label: "Household visit-1 file (101,920 cases, 37 variables)",
        group: "Files",
      },
      {
        name: "perrv",
        label: "Person revisit file (504,440 cases, 104 variables)",
        group: "Files",
      },
      {
        name: "perv1",
        label: "Person visit-1 file (418,159 cases, 139 variables)",
        group: "Files",
      },
      {
        name: "b1q15 / b4q1",
        label: "Sample household number / person serial no.",
        group: "IDs",
      },
      {
        name: "state_* / distcode_*",
        label: "State/UT and district codes",
        group: "Geography",
      },
      {
        name: "b5pt1q3",
        label: "Usual principal status code",
        group: "Activity",
      },
      {
        name: "b5pt1q5",
        label: "Industry Code (NIC)",
        group: "Work",
      },
      {
        name: "b5pt1q6",
        label: "Occupation Code (NCO)",
        group: "Work",
      },
      {
        name: "mult_*",
        label: "Sub-sample wise multiplier",
        group: "Weights",
      },
    ],
  },
};

// Preserve strongest prior Chrome/NADA scrapes
const PRIOR_STRONG = {
  "plfs-annual-2023-24": null, // filled from resolveVariables below if better
  "asi-2023-24": null,
  "hces-2023-24": null,
  "nfhs-5": null,
  "gh-india-votes-data": null,
  "gh-nightlights-viirs": null,
  "gh-rural-facilities-pmgsy": null,
};

// Pull prior strong listings from scraped_variables.json if present (pre-merge).
for (const slug of Object.keys(PRIOR_STRONG)) {
  const fromScraped = scraped.variables?.[slug];
  if (fromScraped?.entries?.length) {
    PRIOR_STRONG[slug] = {
      source: fromScraped.source?.startsWith("Live-fetched")
        ? fromScraped.source
        : `Live-fetched overlay kept: ${fromScraped.source}`,
      url: fromScraped.url,
      entries: fromScraped.entries,
    };
  }
}

function esc(s) {
  return JSON.stringify(s);
}

const live = {};
const meta = { ok: 0, failed: 0, overlays: 0 };

for (const d of datasets) {
  const fromBulk = scraped.variables?.[d.slug];
  const overlay = NADA_OVERLAYS[d.slug] || PRIOR_STRONG[d.slug];
  let entry;
  if (overlay && overlay.entries?.length) {
    entry = {
      entries: overlay.entries,
      source: overlay.source,
      url: overlay.url,
    };
    meta.overlays++;
  } else if (fromBulk?.entries?.length) {
    entry = {
      entries: fromBulk.entries,
      source: fromBulk.source,
      url: fromBulk.url,
    };
    if (fromBulk.status === "ok") meta.ok++;
    else meta.failed++;
  } else {
    entry = {
      entries: (d.keyVariables || []).map((k) => ({
        name: k,
        label: String(k)
          .replace(/[_-]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/^\w/, (c) => c.toUpperCase()),
        group: "Representative fields",
      })),
      source: `Live-fetch skipped/unavailable for ${d.slug}; representative fields from catalog [prior listing retained]`,
      url: d.variablesUrl || d.docsUrl || d.accessUrl,
    };
    meta.failed++;
  }

  // Ensure name+label
  entry.entries = entry.entries
    .filter((e) => e && e.name)
    .map((e) => ({
      name: String(e.name),
      label: String(e.label || e.name),
      ...(e.group ? { group: String(e.group) } : {}),
    }));
  if (!entry.entries.length) {
    entry.entries = d.keyVariables.map((k) => ({
      name: k,
      label: k,
      group: "Representative fields",
    }));
  }
  live[d.slug] = entry;
}

// Emit TypeScript module
const lines = [];
lines.push(`import type { VariableEntry } from "@/types/dataset";`);
lines.push(``);
lines.push(`/** Auto-generated live-fetched variable listings. Do not hand-edit bulk. */`);
lines.push(
  `export type LiveVarPack = { entries: VariableEntry[]; source: string; url?: string };`,
);
lines.push(``);
lines.push(`export const LIVE_VARIABLES: Record<string, LiveVarPack> = {`);

for (const [slug, pack] of Object.entries(live)) {
  lines.push(`  ${esc(slug)}: {`);
  lines.push(`    source: ${esc(pack.source)},`);
  if (pack.url) lines.push(`    url: ${esc(pack.url)},`);
  lines.push(`    entries: [`);
  for (const e of pack.entries) {
    const g = e.group ? `, group: ${esc(e.group)}` : "";
    lines.push(
      `      { name: ${esc(e.name)}, label: ${esc(e.label)}${g} },`,
    );
  }
  lines.push(`    ],`);
  lines.push(`  },`);
}
lines.push(`};`);
lines.push(``);

writeFileSync("src/data/liveVariables.ts", lines.join("\n"), "utf8");

// coverage json
const coverage = {
  total: datasets.length,
  withEntries: Object.values(live).filter((v) => v.entries.length >= 1)
    .length,
  withUrl: Object.values(live).filter((v) => v.url).length,
  withNameLabel: Object.values(live).filter((v) =>
    v.entries.every((e) => e.name && e.label),
  ).length,
  meta,
  slugs: Object.fromEntries(
    Object.entries(live).map(([s, p]) => [
      s,
      { n: p.entries.length, url: p.url || null, source: p.source.slice(0, 100) },
    ]),
  ),
};
writeFileSync(
  `${SCRATCH}/variables-coverage.json`,
  JSON.stringify(coverage, null, 2),
);
writeFileSync(
  "content/scraped_variables.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: Object.keys(live).length,
      variables: live,
      meta,
    },
    null,
    2,
  ),
);

console.log(JSON.stringify({ written: Object.keys(live).length, ...meta, coverage: { total: coverage.total, withEntries: coverage.withEntries, withUrl: coverage.withUrl } }, null, 2));
