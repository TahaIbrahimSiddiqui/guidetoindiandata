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
    "title": "All-India Debt and Investment Survey (NSS 77th Round, 2019)",
    "shortTitle": "AIDIS 2019",
    "abbreviations": [
      "AIDIS",
      "NSS 77th Round"
    ],
    "categories": [
      "household finance",
      "debt",
      "assets"
    ],
    "technicalTags": [
      "microdata",
      "unit-level",
      "NSS"
    ],
    "host": "NSO / MoSPI NADA",
    "institution": "National Sample Survey Office / MoSPI",
    "accessUrl": "https://microdata.gov.in/NADA/index.php/catalog/OTH",
    "docsUrl": "https://microdata.gov.in/NADA/index.php/catalog/300",
    "accessType": "open-download",
    "sizeTier": "Large",
    "formats": [
      "fixed-width text",
      "CSV",
      "DDI documentation"
    ],
    "updateFrequency": "Decennial (roughly every 10 years)",
    "geographyLevel": [
      "national",
      "state",
      "rural-urban"
    ],
    "timeCoverage": "January 2019 - December 2019 (Visit 1 and Visit 2)",
    "keyVariables": [
      "household assets",
      "outstanding debt",
      "borrowing by source",
      "household capital expenditure",
      "interest rates"
    ],
    "summary": "Unit-level All-India Debt and Investment Survey (NSS 77th Round) collecting household-level data on assets, liabilities, and capital expenditure across rural and urban India with two visits during 2019.",
    "bestFor": "Studying household indebtedness, wealth distribution, and access to formal vs informal credit in India.",
    "limitations": "Conducted roughly once a decade, so it does not capture short-run changes in household balance sheets.",
    "pairsWith": [
      "hces-2022-23",
      "cmie-cphs",
      "rbi-dbie"
    ],
    "exampleUses": "Estimating rural household debt-to-asset ratios and reliance on moneylenders by state and social group.",
    "cluster": "households-living",
    "sourceKind": "government"
  }
];
