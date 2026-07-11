import type { DatasetDraft } from "@/types/dataset";

/**
 * Automated catalog additions.
 *
 * The scheduled discovery workflow appends only records that pass duplicate
 * checks and the normal catalog audit. Keeping these separate from the
 * hand-curated government list makes later pruning/review easier.
 */
export const discoveredDatasets: DatasetDraft[] = [
  {
    "slug": "nss-debt-investment-2019",
    "title": "All India Debt and Investment Survey, NSS 77th Round (2019)",
    "shortTitle": "AIDIS 2019",
    "abbreviations": [
      "AIDIS",
      "NSS 77th Round"
    ],
    "categories": [
      "household finance",
      "assets",
      "debt",
      "wealth"
    ],
    "technicalTags": [
      "unit-level-microdata",
      "DDI",
      "household-survey",
      "two-visit-panel"
    ],
    "host": "NSO / MoSPI NADA",
    "institution": "National Sample Survey Office / MoSPI",
    "accessUrl": "https://microdata.gov.in/NADA/index.php/catalog/OTH",
    "docsUrl": "https://microdata.gov.in/NADA/themes/nada52/fontawesome/css/all.css",
    "accessType": "open-download",
    "sizeTier": "Large",
    "formats": [
      "Fixed-width text",
      "CSV",
      "Documentation PDF"
    ],
    "updateFrequency": "Decennial (every ~10 years)",
    "geographyLevel": [
      "National",
      "State",
      "Rural/Urban"
    ],
    "timeCoverage": "January 2019 - December 2019 (Visit 1 and Visit 2)",
    "keyVariables": [
      "household assets",
      "outstanding debt / loans",
      "amount and source of borrowing",
      "capital expenditure and investment",
      "land and building holdings"
    ],
    "summary": "Unit-level microdata from the NSS 77th Round All India Debt and Investment Survey (Schedule 18.2), covering household assets, liabilities, and borrowing for January-December 2019 across two visits. It is the decennial benchmark survey of household indebtedness and asset ownership",
    "bestFor": "Studying rural/urban household indebtedness, wealth distribution, and access to formal vs informal credit",
    "limitations": "Decennial cadence means data are not timely; two-visit design and complex schedule require careful weighting.",
    "pairsWith": [
      "hces-2022-23",
      "cmie-cphs",
      "nss-microdata-catalog"
    ],
    "exampleUses": "Estimating household debt-to-asset ratios by state and analysing reliance on moneylenders versus banks.",
    "cluster": "households-living",
    "sourceKind": "government"
  }
];
