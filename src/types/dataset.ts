export type AccessType =
  | "open-download"
  | "public-dashboard"
  | "registration"
  | "data-use-agreement"
  | "request-only"
  | "paid-subscription";

type SizeTier = "Medium" | "Large" | "Very large";

type DatasetFlag = "good-starting" | "best-district";

export type SourceKind =
  | "government"
  | "academic-reference"
  | "academic-survey"
  | "academic-project"
  | "replication"
  | "github-community";

export type AcademicBadge =
  | "core-reference"
  | "survey-microdata"
  | "replication"
  | "mixed-restricted"
  | "metadata-incomplete"
  | "github-repo"
  | "historical-archive";

/** Full taxonomy themes for the neural graph (22). */
export type ClusterId =
  | "population-demography"
  | "households-living"
  | "labour-employment"
  | "firms-industry"
  | "trade-commerce"
  | "agriculture-rural"
  | "health-nutrition"
  | "education"
  | "politics-governance"
  | "public-finance"
  | "banking-finance"
  | "markets-prices"
  | "environment-climate"
  | "infrastructure-transport"
  | "urban-development"
  | "social-protection"
  | "crime-justice"
  | "geospatial-remote-sensing"
  | "digital-economy"
  | "research-replication"
  | "github-community"
  | "international-india"
  | "data-catalogs"
  // legacy aliases still accepted on records (normalized at graph time)
  | "health-demography"
  | "labor-firms"
  | "agriculture"
  | "governance-justice"
  | "climate-infra";

export type VariableEntry = {
  name: string;
  label: string;
  group?: string;
};

/** Official or community guide for using a dataset. */
export type GuideLink = {
  title: string;
  url: string;
  kind?: "official" | "user-guide" | "codebook" | "tutorial" | "video" | "portal" | "report";
};

export type Dataset = {
  slug: string;
  title: string;
  shortTitle: string;
  abbreviations: string[];
  categories: string[];
  technicalTags: string[];
  host: string;
  institution: string;
  accessUrl?: string;
  docsUrl?: string;
  accessType: AccessType;
  sizeTier: SizeTier;
  formats: string[];
  updateFrequency: string;
  geographyLevel: string[];
  timeCoverage: string;
  keyVariables: string[];
  variables?: VariableEntry[];
  variablesSource?: string;
  variablesUrl?: string;
  /** How-to guides, codebooks, and tutorials for using this dataset. */
  guides?: GuideLink[];
  /**
   * Plain-language one-liner: what researchers use this data for
   * (e.g. “ASUSE is used to study India’s informal enterprise sector.”).
   */
  summary: string;
  bestFor: string;
  limitations: string;
  /**
   * Survey-family history: previous rounds, redesigns, and how this wave
   * sits in the NSS/NSO lineage (used on dataset detail pages).
   */
  background?: string;
  pairsWith: string[];
  exampleUses: string;
  flags?: DatasetFlag[];
  cluster: ClusterId;
  seriesSlug?: string;
  waveYearLabel?: string;
  sourceKind?: SourceKind;
  academicBadges?: AcademicBadge[];
  paperDoi?: string;
  dataDoi?: string;
  authors?: string;
  publicationYear?: number;
  recommendedCitation?: string;
  repository?: string;
};

/** Catalog input before summary is attached from datasetSummaries.ts */
export type DatasetDraft = Omit<Dataset, "summary"> & { summary?: string };

type SeriesFamily = "nfhs" | "nss" | "dlhs" | "other" | "academic";

type DesignRevision = {
  yearLabel: string;
  summary: string;
};

type SeriesWave = {
  yearLabel: string;
  yearStart: number;
  yearEnd?: number;
  datasetSlug: string;
  isLatest?: boolean;
  designNote?: string;
};

export type DataSeries = {
  slug: string;
  title: string;
  shortTitle: string;
  family: SeriesFamily;
  description: string;
  host: string;
  cluster: ClusterId;
  designRevisions: DesignRevision[];
  waves: SeriesWave[];
  pairsWithSeries?: string[];
  pinned?: boolean;
};

export type Cluster = {
  id: ClusterId;
  name: string;
  shortName: string;
  description: string;
  color: string;
};
