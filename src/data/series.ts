import type { DataSeries } from "@/types/dataset";

/**
 * Multi-year series hubs (NFHS, NSS products, DLHS, etc.).
 * Wave datasetSlug values must match datasets.ts.
 */
export const seriesList: DataSeries[] = [
  {
    slug: "nfhs",
    title: "National Family Health Survey",
    shortTitle: "NFHS",
    family: "nfhs",
    description:
      "India’s flagship DHS-style household health survey. One series, multiple waves—use this hub to pick the year/wave you need, then open the wave record for access and variables.",
    host: "IIPS / MoHFW / DHS Program",
    cluster: "health-demography",
    pinned: true,
    pairsWithSeries: ["dlhs", "nss-hces"],
    designRevisions: [
      {
        yearLabel: "1992–93 (NFHS-1)",
        summary: "Foundational national design; state-focused; no district estimates.",
      },
      {
        yearLabel: "2005–06 (NFHS-3)",
        summary: "Expanded modules including HIV testing and women’s status.",
      },
      {
        yearLabel: "2015–16 (NFHS-4)",
        summary:
          "Major design revision: district-level estimates and biomarker modules become central.",
      },
      {
        yearLabel: "2019–21 (NFHS-5)",
        summary:
          "Current multi-year wave design with district coverage and expanded NCD biomarkers (BP, glucose, anemia).",
      },
    ],
    waves: [
      {
        yearLabel: "1992–93",
        yearStart: 1992,
        yearEnd: 1993,
        datasetSlug: "nfhs-1",
        designNote: "Baseline wave; 24 states + Delhi.",
      },
      {
        yearLabel: "1998–99",
        yearStart: 1998,
        yearEnd: 1999,
        datasetSlug: "nfhs-2",
        designNote: "Expanded nutrition and RCH content.",
      },
      {
        yearLabel: "2005–06",
        yearStart: 2005,
        yearEnd: 2006,
        datasetSlug: "nfhs-3",
        designNote: "HIV and women’s status modules.",
      },
      {
        yearLabel: "2015–16",
        yearStart: 2015,
        yearEnd: 2016,
        datasetSlug: "nfhs-4",
        designNote: "District estimates introduced at scale.",
      },
      {
        yearLabel: "2019–21",
        yearStart: 2019,
        yearEnd: 2021,
        datasetSlug: "nfhs-5",
        isLatest: true,
        designNote: "Latest published wave; 707 districts.",
      },
    ],
  },
  {
    slug: "dlhs",
    title: "District Level Household Survey",
    shortTitle: "DLHS",
    family: "dlhs",
    description:
      "District-oriented reproductive and child health surveys. Useful historical counterpart to NFHS for district program monitoring.",
    host: "MoHFW / IIPS",
    cluster: "health-demography",
    pairsWithSeries: ["nfhs"],
    designRevisions: [
      {
        yearLabel: "1998–99 (DLHS-1)",
        summary: "Program-oriented district RCH design.",
      },
      {
        yearLabel: "2012–13 (DLHS-4)",
        summary: "Facility-linked measures alongside household indicators.",
      },
    ],
    waves: [
      {
        yearLabel: "1998–99",
        yearStart: 1998,
        yearEnd: 1999,
        datasetSlug: "dlhs-1",
      },
      {
        yearLabel: "2002–04",
        yearStart: 2002,
        yearEnd: 2004,
        datasetSlug: "dlhs-2",
      },
      {
        yearLabel: "2007–08",
        yearStart: 2007,
        yearEnd: 2008,
        datasetSlug: "dlhs-3",
      },
      {
        yearLabel: "2012–13",
        yearStart: 2012,
        yearEnd: 2013,
        datasetSlug: "dlhs-4",
        isLatest: true,
        designNote: "Often paired with AHS/NFHS for district triangulation.",
      },
    ],
  },
  {
    slug: "nss-plfs",
    title: "Periodic Labour Force Survey (NSS / NSO)",
    shortTitle: "PLFS",
    family: "nss",
    description:
      "NSO’s labour force series that replaced the older Employment–Unemployment Survey design. Annual and quarterly/calendar releases are listed by year of data availability.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pinned: true,
    pairsWithSeries: ["nss-hces", "nss-tus"],
    designRevisions: [
      {
        yearLabel: "2017–18 launch",
        summary:
          "PLFS design replaces legacy EUS rounds with continuous labour-force monitoring (CWS and related indicators).",
      },
      {
        yearLabel: "Calendar / quarterly products",
        summary:
          "Design supports annual (July–June) and calendar/quarterly urban-focused monitoring products—use the matching release year.",
      },
    ],
    waves: [
      {
        yearLabel: "2023–24 (annual)",
        yearStart: 2023,
        yearEnd: 2024,
        datasetSlug: "plfs-annual-2023-24",
        designNote: "July 2023–June 2024 annual microdata.",
      },
      {
        yearLabel: "2025 (quarterly / calendar)",
        yearStart: 2025,
        yearEnd: 2025,
        datasetSlug: "plfs-quarterly-2025",
        isLatest: true,
        designNote: "Short-term labour turning points.",
      },
    ],
  },
  {
    slug: "nss-hces",
    title: "Household Consumption Expenditure Survey (NSS / NSO)",
    shortTitle: "HCES",
    family: "nss",
    description:
      "NSO consumption / MPCE series (successor framing to CES). Each listed year is a published round after the long gap and redesign of the household expenditure instrument.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pinned: true,
    pairsWithSeries: ["nss-plfs"],
    designRevisions: [
      {
        yearLabel: "2022–23 redesign return",
        summary:
          "New HCES design after a long break from older CES rounds—item baskets and MPCE constructs differ from pre-2010s CES.",
      },
      {
        yearLabel: "2023–24",
        summary:
          "Follow-on annualized release with fractile classes and refined item-level quantity/value structure.",
      },
    ],
    waves: [
      {
        yearLabel: "2022–23",
        yearStart: 2022,
        yearEnd: 2023,
        datasetSlug: "hces-2022-23",
        designNote: "Post-pandemic consumption benchmark round.",
      },
      {
        yearLabel: "2023–24",
        yearStart: 2023,
        yearEnd: 2024,
        datasetSlug: "hces-2023-24",
        isLatest: true,
        designNote: "Latest policy-relevant HCES release in the catalog.",
      },
    ],
  },
  {
    slug: "nss-tus",
    title: "Time Use Survey (NSS / NSO)",
    shortTitle: "TUS",
    family: "nss",
    description:
      "NSO time-use series for paid work, unpaid care, learning, and leisure. Episodic design—years below are published availability in this catalog.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pairsWithSeries: ["nss-plfs"],
    designRevisions: [
      {
        yearLabel: "2024 instrument",
        summary:
          "Care-economy focused activity classification; strongest official unpaid-work measurement in current NSO lineup.",
      },
    ],
    waves: [
      {
        yearLabel: "2024",
        yearStart: 2024,
        datasetSlug: "time-use-survey-2024",
        isLatest: true,
        designNote: "Current catalog wave.",
      },
    ],
  },
  {
    slug: "nss-asi",
    title: "Annual Survey of Industries (NSS / NSO)",
    shortTitle: "ASI",
    family: "nss",
    description:
      "Organized factory / registered manufacturing sector. Year labels mark the survey year of published microdata.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pairsWithSeries: ["nss-asuse"],
    designRevisions: [
      {
        yearLabel: "Ongoing annual factory design",
        summary:
          "Establishment schedule for registered factories (assets, labour, inputs/outputs). Base-year and schedule tweaks occur over decades—always check the wave DDI.",
      },
    ],
    waves: [
      {
        yearLabel: "2023–24",
        yearStart: 2023,
        yearEnd: 2024,
        datasetSlug: "asi-2023-24",
        isLatest: true,
      },
    ],
  },
  {
    slug: "nss-asuse",
    title: "Annual Survey of Unincorporated Sector Enterprises",
    shortTitle: "ASUSE",
    family: "nss",
    description:
      "Unincorporated non-agricultural enterprises (informal MSMEs, services, trade). Separate design from ASI.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pairsWithSeries: ["nss-asi", "nss-plfs"],
    designRevisions: [
      {
        yearLabel: "ASUSE annual framing",
        summary:
          "Enterprise-level unincorporated sector design (not factory ASI). Treat as successor framing to older enterprise survey streams.",
      },
    ],
    waves: [
      {
        yearLabel: "2023–24",
        yearStart: 2023,
        yearEnd: 2024,
        datasetSlug: "asuse-2023-24",
        isLatest: true,
      },
    ],
  },
  {
    slug: "nss-sas",
    title: "Situation Assessment of Agricultural Households (NSS)",
    shortTitle: "SAS",
    family: "nss",
    description:
      "NSS situation assessment of farm households—income, debt, practices, schemes. Year = survey reference period.",
    host: "NSO / MoSPI",
    cluster: "agriculture",
    pairsWithSeries: ["agriculture-census", "nss-hces"],
    designRevisions: [
      {
        yearLabel: "2019 (77th round)",
        summary:
          "77th-round situation assessment design for agricultural households (assets, income, indebtedness, technology).",
      },
    ],
    waves: [
      {
        yearLabel: "2019",
        yearStart: 2019,
        datasetSlug: "sas-ag-households-2019",
        isLatest: true,
        designNote: "Jan–Dec 2019 reference year.",
      },
    ],
  },
  {
    slug: "ihds",
    title: "India Human Development Survey",
    shortTitle: "IHDS",
    family: "other",
    description:
      "Academic multi-topic panel. Years mark interview waves—use as a panel pair (I → II).",
    host: "UMD / NCAER",
    cluster: "labor-firms",
    pinned: true,
    designRevisions: [
      {
        yearLabel: "2004–05 → 2011–12",
        summary: "Panel re-interview design across two waves with broad topical modules.",
      },
    ],
    waves: [
      {
        yearLabel: "2004–05",
        yearStart: 2004,
        yearEnd: 2005,
        datasetSlug: "ihds-i",
        designNote: "Panel baseline.",
      },
      {
        yearLabel: "2011–12",
        yearStart: 2011,
        yearEnd: 2012,
        datasetSlug: "ihds-ii",
        isLatest: true,
        designNote: "Re-interview wave.",
      },
    ],
  },
  {
    slug: "agriculture-census",
    title: "Agriculture Census",
    shortTitle: "Ag Census",
    family: "other",
    description:
      "Quintennial farm-structure census. Years are reference agricultural years when tables/reports are available.",
    host: "Agriculture Census Division",
    cluster: "agriculture",
    pairsWithSeries: ["input-survey", "nss-sas"],
    designRevisions: [
      {
        yearLabel: "Quintennial cycle",
        summary:
          "Operational holdings, size class, irrigation, tenancy—table packages roll out after each census year.",
      },
    ],
    waves: [
      {
        yearLabel: "2015–16",
        yearStart: 2015,
        yearEnd: 2016,
        datasetSlug: "agriculture-census-2015-16",
      },
      {
        yearLabel: "2021–22",
        yearStart: 2021,
        yearEnd: 2022,
        datasetSlug: "agriculture-census-2021-22",
        isLatest: true,
        designNote: "Newest cycle as public tables complete.",
      },
    ],
  },
  {
    slug: "input-survey",
    title: "Input Survey (Agriculture)",
    shortTitle: "Input Survey",
    family: "other",
    description:
      "Follow-on to Agriculture Census on fertilizers, seeds, pesticides, and irrigation-linked use—by reference year.",
    host: "Agriculture Census Division",
    cluster: "agriculture",
    pairsWithSeries: ["agriculture-census"],
    designRevisions: [
      {
        yearLabel: "Linked to Ag Census cycles",
        summary: "Input schedules tied to the corresponding Agriculture Census reference year.",
      },
    ],
    waves: [
      {
        yearLabel: "2016–17",
        yearStart: 2016,
        yearEnd: 2017,
        datasetSlug: "input-survey-2016-17",
      },
      {
        yearLabel: "2022–23",
        yearStart: 2022,
        yearEnd: 2023,
        datasetSlug: "input-survey-2022-23",
        isLatest: true,
      },
    ],
  },
  {
    slug: "lasi",
    title: "Longitudinal Ageing Study in India",
    shortTitle: "LASI",
    family: "other",
    description:
      "National ageing cohort (45+). Wave years mark fieldwork periods; specialized follow-ons (e.g. LASI-DAD) share the family.",
    host: "IIPS / Harvard / USC",
    cluster: "health-demography",
    designRevisions: [
      {
        yearLabel: "Wave 1 (2017–19)",
        summary: "Baseline multi-module ageing design; multi-year planned waves.",
      },
    ],
    waves: [
      {
        yearLabel: "2017–19 (Wave 1)",
        yearStart: 2017,
        yearEnd: 2019,
        datasetSlug: "lasi-wave-1",
        isLatest: true,
      },
      {
        yearLabel: "LASI-DAD (60+ subsample)",
        yearStart: 2017,
        datasetSlug: "lasi-dad",
        designNote: "Dementia/cognition follow-on with DUA.",
      },
    ],
  },
];

export function getSeriesBySlug(slug: string): DataSeries | undefined {
  return seriesList.find((s) => s.slug === slug);
}

export function getSeriesForDataset(datasetSlug: string): DataSeries | undefined {
  return seriesList.find((s) =>
    s.waves.some((w) => w.datasetSlug === datasetSlug)
  );
}

export function getWaveForDataset(datasetSlug: string) {
  for (const s of seriesList) {
    const wave = s.waves.find((w) => w.datasetSlug === datasetSlug);
    if (wave) return { series: s, wave };
  }
  return undefined;
}

export function getPinnedSeries(): DataSeries[] {
  return seriesList.filter((s) => s.pinned);
}

export function seriesByFamily(family: DataSeries["family"]): DataSeries[] {
  return seriesList.filter((s) => s.family === family);
}

export const FAMILY_LABELS: Record<DataSeries["family"], string> = {
  nfhs: "NFHS family",
  nss: "NSS / NSO surveys",
  dlhs: "DLHS family",
  other: "Other multi-year series",
};
