import type { Cluster, ClusterId } from "@/types/dataset";

/** 22 domain themes for the full-screen neural graph. */
export const clusters: Cluster[] = [
  {
    id: "population-demography",
    name: "Population & Demography",
    shortName: "Population",
    description: "Census, vital stats, population estimates, and demographic structure.",
    color: "#38bdf8",
  },
  {
    id: "households-living",
    name: "Households & Living Standards",
    shortName: "Households",
    description: "Consumption, poverty, living standards, and household welfare.",
    color: "#2dd4bf",
  },
  {
    id: "labour-employment",
    name: "Labour & Employment",
    shortName: "Labour",
    description: "Employment, wages, time use, and labour force surveys.",
    color: "#34d399",
  },
  {
    id: "firms-industry",
    name: "Firms & Industry",
    shortName: "Firms",
    description: "Manufacturing, MSMEs, firm finance, and industrial structure.",
    color: "#a3e635",
  },
  {
    id: "agriculture-rural",
    name: "Agriculture & Rural Economy",
    shortName: "Agriculture",
    description: "Farms, inputs, mandis, rural services, and agricultural households.",
    color: "#facc15",
  },
  {
    id: "health-nutrition",
    name: "Health & Nutrition",
    shortName: "Health",
    description: "Health surveys, facilities, nutrition, and public health systems.",
    color: "#fb7185",
  },
  {
    id: "education",
    name: "Education",
    shortName: "Education",
    description: "Schools, learning outcomes, higher education, and colleges.",
    color: "#c084fc",
  },
  {
    id: "politics-governance",
    name: "Politics & Governance",
    shortName: "Politics",
    description: "Elections, bureaucracy, representation, and political data.",
    color: "#e879f9",
  },
  {
    id: "public-finance",
    name: "Public Finance",
    shortName: "Public Finance",
    description: "Budgets, fiscal series, and public financial accounts.",
    color: "#f472b6",
  },
  {
    id: "banking-finance",
    name: "Banking & Finance",
    shortName: "Banking",
    description: "Banking, credit, markets, and household finance.",
    color: "#a78bfa",
  },
  {
    id: "markets-prices",
    name: "Markets & Prices",
    shortName: "Prices",
    description: "CPI, WPI, mandi prices, and market integration.",
    color: "#fb923c",
  },
  {
    id: "environment-climate",
    name: "Environment & Climate",
    shortName: "Environment",
    description: "Weather, air quality, energy, water, and climate impacts.",
    color: "#4ade80",
  },
  {
    id: "infrastructure-transport",
    name: "Infrastructure & Transport",
    shortName: "Infrastructure",
    description: "Roads, power, aviation, rural connectivity, and networks.",
    color: "#60a5fa",
  },
  {
    id: "urban-development",
    name: "Urban Development",
    shortName: "Urban",
    description: "Cities, municipal boundaries, wards, and urban amenities.",
    color: "#818cf8",
  },
  {
    id: "social-protection",
    name: "Social Protection",
    shortName: "Social Protection",
    description: "Welfare schemes, service delivery, and social security.",
    color: "#f9a8d4",
  },
  {
    id: "crime-justice",
    name: "Crime & Justice",
    shortName: "Crime & Justice",
    description: "Crime statistics, courts, prisons, and justice dashboards.",
    color: "#f87171",
  },
  {
    id: "geospatial-remote-sensing",
    name: "Geospatial & Remote Sensing",
    shortName: "Geospatial",
    description: "Boundaries, satellite, night lights, and spatial layers.",
    color: "#22d3ee",
  },
  {
    id: "digital-economy",
    name: "Digital Economy",
    shortName: "Digital",
    description: "Digital services, multimodal AI corpora, and tech-economy data.",
    color: "#67e8f9",
  },
  {
    id: "research-replication",
    name: "Research Replication Packages",
    shortName: "Replication",
    description: "Peer-reviewed article data and code archives.",
    color: "#d8b4fe",
  },
  {
    id: "github-community",
    name: "GitHub & Community Data",
    shortName: "GitHub",
    description: "Community-hosted India datasets, mirrors, and packaging repos.",
    color: "#94a3b8",
  },
  {
    id: "international-india",
    name: "International Datasets Covering India",
    shortName: "International",
    description: "Global products with strong India coverage (DHS, Landsat, etc.).",
    color: "#5eead4",
  },
  {
    id: "data-catalogs",
    name: "Data Catalogs & Archives",
    shortName: "Catalogs",
    description: "Portals, archives, and catalogs that index many India sources.",
    color: "#c4b5fd",
  },
];

/** Map legacy 6-cluster IDs → primary new theme. */
export const LEGACY_CLUSTER_MAP: Record<string, ClusterId> = {
  "health-demography": "health-nutrition",
  education: "education",
  "labor-firms": "labour-employment",
  agriculture: "agriculture-rural",
  "governance-justice": "politics-governance",
  "climate-infra": "environment-climate",
};

export function normalizeClusterId(id: string): ClusterId {
  if (LEGACY_CLUSTER_MAP[id]) return LEGACY_CLUSTER_MAP[id];
  return id as ClusterId;
}

export function getCluster(id: string): Cluster | undefined {
  const nid = normalizeClusterId(id);
  return clusters.find((c) => c.id === nid);
}
