export type AccessType =
  | "open-download"
  | "public-dashboard"
  | "registration"
  | "data-use-agreement"
  | "request-only"
  | "paid-subscription";

export type SizeTier = "Medium" | "Large" | "Very large";

export type DatasetFlag = "good-starting" | "best-district";

export type ClusterId =
  | "health-demography"
  | "education"
  | "labor-firms"
  | "agriculture"
  | "governance-justice"
  | "climate-infra";

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
  bestFor: string;
  limitations: string;
  pairsWith: string[];
  exampleUses: string;
  flags?: DatasetFlag[];
  cluster: ClusterId;
};

export type Cluster = {
  id: ClusterId;
  name: string;
  shortName: string;
  description: string;
  color: string;
};
