import type { Cluster, ClusterId } from "@/types/dataset";

/**
 * 22 domain themes — colors derived from brand palette:
 * Navy #0A2947 · Cream #F3E4C9 · Sage #D3D4C0 · Brown #8B5E3C
 */
export const clusters: Cluster[] = [
  {
    id: "population-demography",
    name: "Population & Demography",
    shortName: "Population",
    description: "Census, vital stats, population estimates, and demographic structure.",
    color: "#F3E4C9",
  },
  {
    id: "households-living",
    name: "Households & Living Standards",
    shortName: "Households",
    description: "Consumption, poverty, living standards, and household welfare.",
    color: "#D3D4C0",
  },
  {
    id: "labour-employment",
    name: "Labour & Employment",
    shortName: "Labour",
    description: "Employment, wages, time use, and labour force surveys.",
    color: "#8B5E3C",
  },
  {
    id: "firms-industry",
    name: "Firms & Industry",
    shortName: "Firms",
    description: "Manufacturing, MSMEs, firm finance, and industrial structure.",
    color: "#C4A574",
  },
  {
    id: "trade-commerce",
    name: "Trade & Commerce",
    shortName: "Trade",
    description:
      "Merchandise and services trade, tariffs, customs, EXIM partners, and trade policy data.",
    color: "#D4A574",
  },
  {
    id: "agriculture-rural",
    name: "Agriculture & Rural Economy",
    shortName: "Agriculture",
    description: "Farms, inputs, mandis, rural services, and agricultural households.",
    color: "#A67C52",
  },
  {
    id: "health-nutrition",
    name: "Health & Nutrition",
    shortName: "Health",
    description: "Health surveys, facilities, nutrition, and public health systems.",
    color: "#E8D4B0",
  },
  {
    id: "education",
    name: "Education",
    shortName: "Education",
    description: "Schools, learning outcomes, higher education, and colleges.",
    color: "#B8B9A4",
  },
  {
    id: "politics-governance",
    name: "Politics & Governance",
    shortName: "Politics",
    description: "Elections, bureaucracy, representation, and political data.",
    color: "#6B8A9E",
  },
  {
    id: "public-finance",
    name: "Public Finance",
    shortName: "Public Finance",
    description: "Budgets, fiscal series, and public financial accounts.",
    color: "#3D5A73",
  },
  {
    id: "banking-finance",
    name: "Banking & Finance",
    shortName: "Banking",
    description: "Banking, credit, markets, and household finance.",
    color: "#8B5E3C",
  },
  {
    id: "markets-prices",
    name: "Markets & Prices",
    shortName: "Prices",
    description: "CPI, WPI, mandi prices, and market integration.",
    color: "#C49A6C",
  },
  {
    id: "environment-climate",
    name: "Environment & Climate",
    shortName: "Environment",
    description: "Weather, air quality, energy, water, and climate impacts.",
    color: "#9BA88E",
  },
  {
    id: "infrastructure-transport",
    name: "Infrastructure & Transport",
    shortName: "Infrastructure",
    description: "Roads, power, aviation, rural connectivity, and networks.",
    color: "#5A7A94",
  },
  {
    id: "urban-development",
    name: "Urban Development",
    shortName: "Urban",
    description: "Cities, municipal boundaries, wards, and urban amenities.",
    color: "#D3D4C0",
  },
  {
    id: "social-protection",
    name: "Social Protection",
    shortName: "Social Protection",
    description: "Welfare schemes, service delivery, and social security.",
    color: "#F3E4C9",
  },
  {
    id: "crime-justice",
    name: "Crime & Justice",
    shortName: "Crime & Justice",
    description: "Crime statistics, courts, prisons, and justice dashboards.",
    color: "#7A4E35",
  },
  {
    id: "geospatial-remote-sensing",
    name: "Geospatial & Remote Sensing",
    shortName: "Geospatial",
    description: "Boundaries, satellite, night lights, and spatial layers.",
    color: "#4A7A8C",
  },
  {
    id: "digital-economy",
    name: "Digital Economy",
    shortName: "Digital",
    description: "Digital services, multimodal AI corpora, and tech-economy data.",
    color: "#A8A994",
  },
  {
    id: "research-replication",
    name: "Research Replication Packages",
    shortName: "Replication",
    description: "Peer-reviewed article data and code archives.",
    color: "#B8956A",
  },
  {
    id: "github-community",
    name: "GitHub & Community Data",
    shortName: "GitHub",
    description: "Community-hosted India datasets, mirrors, and packaging repos.",
    color: "#8B9A8C",
  },
  {
    id: "international-india",
    name: "International Datasets Covering India",
    shortName: "International",
    description: "Global products with strong India coverage (DHS, Landsat, etc.).",
    color: "#6B8F9E",
  },
  {
    id: "data-catalogs",
    name: "Data Catalogs & Archives",
    shortName: "Catalogs",
    description: "Portals, archives, and catalogs that index many India sources.",
    color: "#C4B8A0",
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
