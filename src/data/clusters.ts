import type { Cluster } from "@/types/dataset";

export const clusters: Cluster[] = [
  {
    id: "health-demography",
    name: "Health and Demography",
    shortName: "Health",
    description:
      "Household health surveys, vital registration, routine facility reporting, and aging cohorts that anchor fertility, mortality, nutrition, and NCD analysis.",
    color: "#22d3ee",
  },
  {
    id: "education",
    name: "Education and Human Capital",
    shortName: "Education",
    description:
      "School systems, higher education, and learning-outcome assessments spanning administrative and household evidence.",
    color: "#a78bfa",
  },
  {
    id: "labor-firms",
    name: "Labor, Welfare, and Firms",
    shortName: "Labor & Firms",
    description:
      "Employment, consumption, time use, informal enterprises, manufacturing, and high-frequency household panels.",
    color: "#34d399",
  },
  {
    id: "agriculture",
    name: "Agriculture and Rural Economy",
    shortName: "Agriculture",
    description:
      "Farm structure, inputs, mandi prices, soil, irrigation assets, and rural service missions.",
    color: "#fbbf24",
  },
  {
    id: "governance-justice",
    name: "Governance, Justice, and Politics",
    shortName: "Governance",
    description:
      "Crime series, court dashboards, election archives, and candidate transparency datasets.",
    color: "#f472b6",
  },
  {
    id: "climate-infra",
    name: "Climate, Water, Infrastructure, and Space",
    shortName: "Climate & Infra",
    description:
      "Weather grids, air quality, water and energy systems, roads, aviation, sanitation, boundaries, and remote sensing.",
    color: "#60a5fa",
  },
];

export function getCluster(id: string): Cluster | undefined {
  return clusters.find((c) => c.id === id);
}
