import type { ClusterId } from "@/types/dataset";

/**
 * Map free-text category tags → theme hubs.
 * A source can map to many themes (Obsidian multi-link).
 */
export const CATEGORY_TO_THEME: Record<string, ClusterId> = {
  health: "health-demography",
  demographics: "health-demography",
  nutrition: "health-demography",
  aging: "health-demography",
  HIV: "health-demography",
  gender: "health-demography",
  "women and children": "health-demography",
  "health systems": "health-demography",
  "public safety": "health-demography",
  education: "education",
  "learning outcomes": "education",
  "human capital": "education",
  labor: "labor-firms",
  wages: "labor-firms",
  consumption: "labor-firms",
  poverty: "labor-firms",
  prices: "labor-firms",
  firms: "labor-firms",
  MSMEs: "labor-firms",
  manufacturing: "labor-firms",
  macroeconomy: "labor-firms",
  finance: "labor-firms",
  banking: "labor-firms",
  agriculture: "agriculture",
  land: "agriculture",
  crime: "governance-justice",
  policing: "governance-justice",
  justice: "governance-justice",
  elections: "governance-justice",
  governance: "governance-justice",
  climate: "climate-infra",
  hydrology: "climate-infra",
  "air quality": "climate-infra",
  "urban environment": "climate-infra",
  water: "climate-infra",
  energy: "climate-infra",
  infrastructure: "climate-infra",
  transport: "climate-infra",
  aviation: "climate-infra",
  "rural services": "climate-infra",
  sanitation: "climate-infra",
  geospatial: "climate-infra",
  "remote sensing": "climate-infra",
  ecology: "climate-infra",
};

/**
 * Explicit multi-theme links for series (cross-domain research use).
 * NFHS is health-first but widely used for education and welfare analysis.
 */
export const SERIES_THEME_OVERRIDES: Record<string, ClusterId[]> = {
  nfhs: ["health-demography", "education", "labor-firms"],
  dlhs: ["health-demography", "education"],
  ihds: ["labor-firms", "education", "health-demography"],
  "nss-plfs": ["labor-firms", "education"],
  "nss-hces": ["labor-firms", "agriculture"],
  "nss-tus": ["labor-firms", "health-demography"],
  "nss-sas": ["agriculture", "labor-firms"],
  "nss-asi": ["labor-firms"],
  "nss-asuse": ["labor-firms"],
  lasi: ["health-demography", "labor-firms"],
  "agriculture-census": ["agriculture", "climate-infra"],
  "input-survey": ["agriculture"],
  "access-energy": ["climate-infra", "labor-firms", "health-demography"],
};

/** Standalone datasets that need multi-theme links beyond primary cluster. */
export const DATASET_THEME_OVERRIDES: Record<string, ClusterId[]> = {
  aser: ["education", "labor-firms"],
  "nas-2021": ["education"],
  "udise-plus": ["education", "climate-infra"],
  "census-pca-2011": [
    "health-demography",
    "education",
    "labor-firms",
    "climate-infra",
  ],
  hmis: ["health-demography"],
  "cpcb-aqi": ["climate-infra", "health-demography"],
  "imd-rainfall": ["climate-infra", "agriculture"],
  "lok-dhaba": ["governance-justice"],
  njdg: ["governance-justice"],
  // Academic layer
  "indian-census-collection-1901-2026": [
    "health-demography",
    "climate-infra",
    "governance-justice",
  ],
  "district-pop-estimates-2020": [
    "health-demography",
    "governance-justice",
  ],
  "electoral-criminality-2004-2009": ["governance-justice"],
  "ires-2020": ["climate-infra", "labor-firms"],
  "gender-energy-perception-2021": [
    "climate-infra",
    "health-demography",
    "labor-firms",
  ],
  "tafssa-nalanda-2023": ["agriculture", "health-demography"],
  "replication-bhavnani-lee-2018": ["governance-justice", "health-demography"],
  "replication-kapoor-magesan-2018": ["governance-justice"],
  "replication-aklin-cheng-urpelainen-2021": [
    "climate-infra",
    "governance-justice",
  ],
  "replication-dugoua-liu-urpelainen-2017": ["climate-infra"],
  "replication-besley-burgess-2000": ["agriculture", "labor-firms"],
  "replication-karlan-mullainathan-roth-2019": ["labor-firms"],
  "replication-kyle-sampat-shadlen-2026": ["health-demography", "labor-firms"],
  "replication-stainier-shah-barreca-2026": [
    "climate-infra",
    "health-demography",
    "agriculture",
  ],
  "replication-adbi-agarwal-ghosh-2026": ["education", "climate-infra"],
  "india-renewable-energy-2010-2025": ["climate-infra", "labor-firms"],
  "covid-r-estimates-india": ["health-demography"],
  "asti-india": ["agriculture"],
  "pratham-read-india": ["education"],
  "india-treaty-registry": ["governance-justice"],
  "india-treaty-nesting": ["governance-justice"],
  "health-survey-andhra-2013": ["health-demography"],
};
