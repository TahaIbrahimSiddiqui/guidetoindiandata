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
      "NSO’s continuous labour-force series (from 2017–18), replacing the older quinquennial Employment–Unemployment Survey (EUS) design. Annual July–June microdata, calendar-year extracts, and quarterly urban CWS products sit in one family—always match the release year and product type.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pinned: true,
    pairsWithSeries: ["nss-hces", "nss-tus"],
    designRevisions: [
      {
        yearLabel: "Pre-2017: NSS EUS (quinquennial)",
        summary:
          "Before PLFS, employment–unemployment was measured mainly via large NSS EUS rounds (e.g. 61st 2004–05, 66th 2009–10, 68th 2011–12). Those thick rounds are not continuous and differ in schedule and frequency from PLFS—do not stack without redesign caveats.",
      },
      {
        yearLabel: "2017–18 launch",
        summary:
          "PLFS launched to estimate key indicators quarterly for urban areas in Current Weekly Status (CWS) and annually for rural+urban in usual status (ps+ss) and CWS. First annual microdata: July 2017–June 2018 (NADA catalog/204).",
      },
      {
        yearLabel: "2017–18 → 2023–24 annual stack",
        summary:
          "Seven July–June unit files on NADA: 2017–18 (/204), 2018–19 (/216), 2019–20 (/217), 2020–21 (/206), 2021–22 (/214), 2022–23 (/210), 2023–24 (/213)—including pandemic years.",
      },
      {
        yearLabel: "Calendar / quarterly products",
        summary:
          "Separate NADA products for calendar years (2021–2025 extracts) and quarterly unit files (e.g. 2025). Sampling revamped from Jan 2025 for higher-frequency indicators—match product type to research design.",
      },
    ],
    waves: [
      {
        yearLabel: "2023–24 (annual)",
        yearStart: 2023,
        yearEnd: 2024,
        datasetSlug: "plfs-annual-2023-24",
        designNote:
          "July 2023–June 2024 annual microdata (NADA catalog/213)—seventh full annual wave of PLFS.",
      },
      {
        yearLabel: "2025 (quarterly / calendar)",
        yearStart: 2025,
        yearEnd: 2025,
        datasetSlug: "plfs-quarterly-2025",
        isLatest: true,
        designNote:
          "Calendar-year / quarterly extracts after the 2025 design refresh—not a substitute for July–June annual microdata.",
      },
    ],
  },
  {
    slug: "nss-hces",
    title: "Household Consumption Expenditure Survey (NSS / NSO)",
    shortTitle: "HCES",
    family: "nss",
    description:
      "NSO household consumption / MPCE series. Thick quinquennial Consumer Expenditure Survey (CES) rounds ran for decades through NSS 68th (2011–12); after a long gap and a discarded 2017–18 attempt, MoSPI relaunched as HCES 2022–23 and 2023–24 with a redesigned multi-visit instrument.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pinned: true,
    pairsWithSeries: ["nss-plfs"],
    designRevisions: [
      {
        yearLabel: "Quinquennial CES lineage (to 2011–12)",
        summary:
          "Major CES rounds at roughly five-year intervals: 27th (1972–73), 32nd (1977–78), 38th (1983), 43rd (1987–88), 50th (1993–94), 55th (1999–00), 61st (2004–05), 66th (2009–10), 68th (2011–12 Type 1/2 on NADA). Annual thinner CES schedules filled intervening NSS years; NADA CEXP holds 29 studies total.",
      },
      {
        yearLabel: "2011–12 → 2022 gap",
        summary:
          "No published national CES/HCES after NSS 68th until HCES 2022–23. A 2017–18 consumer expenditure exercise was not released over data-quality concerns—do not treat intermediate years as missing microdata files.",
      },
      {
        yearLabel: "2022–23 redesign return",
        summary:
          "HCES 2022–23 (NADA catalog/224) restarts the series with multi-visit canvassing, updated item baskets, and MPCE constructs not strictly comparable to pre-2010s CES without bridging.",
      },
      {
        yearLabel: "2023–24",
        summary:
          "Second modern HCES (NADA catalog/237; Aug 2023–Jul 2024 fielding in official notes) with fractile classes and refined quantity/value structure.",
      },
    ],
    waves: [
      {
        yearLabel: "2022–23",
        yearStart: 2022,
        yearEnd: 2023,
        datasetSlug: "hces-2022-23",
        designNote:
          "First post-gap HCES—benchmark against 68th round only with methodology caveats.",
      },
      {
        yearLabel: "2023–24",
        yearStart: 2023,
        yearEnd: 2024,
        datasetSlug: "hces-2023-24",
        isLatest: true,
        designNote: "Second consecutive modern HCES; NADA catalog/237.",
      },
    ],
  },
  {
    slug: "nss-tus",
    title: "Time Use Survey (NSS / NSO)",
    shortTitle: "TUS",
    family: "nss",
    description:
      "NSO all-India time-use series for paid work, unpaid care, learning, and leisure. Episodic—not annual. National TUS 2019 was the first full all-India wave; TUS 2024 is the second. A 1998–99 pilot covered six states only.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pairsWithSeries: ["nss-plfs"],
    designRevisions: [
      {
        yearLabel: "1998–99 pilot (six states)",
        summary:
          "Experimental time-use survey in Haryana, Madhya Pradesh, Gujarat, Odisha, Tamil Nadu, and Meghalaya—not nationally representative.",
      },
      {
        yearLabel: "2019 first all-India TUS",
        summary:
          "NSO’s first national Time Use Survey (Jan–Dec 2019; NADA catalog/223, DDI-IND-CSO-TUS-2019-19). Established the unpaid-care / domestic work measurement framework for gender and care-economy analysis.",
      },
      {
        yearLabel: "2024 second all-India TUS",
        summary:
          "Second national TUS (Jan–Dec 2024; NADA catalog/236). Activity classification remains care-economy focused; treat as a successor wave to 2019, not an annual series.",
      },
    ],
    waves: [
      {
        yearLabel: "2024",
        yearStart: 2024,
        datasetSlug: "time-use-survey-2024",
        isLatest: true,
        designNote: "Second all-India TUS after 2019 (NADA /236).",
      },
    ],
  },
  {
    slug: "nss-asi",
    title: "Annual Survey of Industries (NSS / NSO)",
    shortTitle: "ASI",
    family: "nss",
    description:
      "Organized factory / registered manufacturing sector (ASI). Long-running annual establishment survey with block-based schedules (IDs, assets, employment, inputs/outputs). Year labels mark the survey/accounting year of published microdata—not a quinquennial household NSS round.",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pairsWithSeries: ["nss-asuse"],
    designRevisions: [
      {
        yearLabel: "Long annual factory series",
        summary:
          "ASI has been conducted for decades as the official source on registered factories (Factories Act coverage). Schedule layout (blocks A–J style) and industrial classification (e.g. NIC-2008) evolve—always read the wave DDI and block dictionary.",
      },
      {
        yearLabel: "NADA ASI stack (~48 studies)",
        summary:
          "MoSPI NADA ASI collection holds ~48 studies: modern unit-level annual waves 2015–16 through 2023–24, plus older summary/unit releases into the 1980s–1990s. Comparability needs attention to frame, multipliers, and status-of-unit codes.",
      },
      {
        yearLabel: "2023–24 microdata",
        summary:
          "Latest catalogued unit file (NADA catalog/256). Pair with ASUSE for unincorporated manufacturing/trade/services.",
      },
    ],
    waves: [
      {
        yearLabel: "2023–24",
        yearStart: 2023,
        yearEnd: 2024,
        datasetSlug: "asi-2023-24",
        isLatest: true,
        designNote: "NADA ASI 2023–24 data dictionary (blocks A–J).",
      },
    ],
  },
  {
    slug: "nss-asuse",
    title: "Annual Survey of Unincorporated Sector Enterprises",
    shortTitle: "ASUSE",
    family: "nss",
    description:
      "Unincorporated non-agricultural establishments (manufacturing, trade, other services—excluding construction). Annual ASUSE succeeds episodic NSS unincorporated enterprise rounds (notably 67th 2010–11 and 73rd 2015–16).",
    host: "NSO / MoSPI",
    cluster: "labor-firms",
    pairsWithSeries: ["nss-asi", "nss-plfs"],
    designRevisions: [
      {
        yearLabel: "NSS enterprise lineage (pre-ASUSE)",
        summary:
          "NADA ENT collection: 73rd (2015–16), 67th (2010–11), 62nd unorganised manufacturing (2005–06), 56th/55th/51st manufacturing & informal enterprise rounds, and older trade streams (e.g. 46th). These are episodic thick rounds—not annual ASI factory files.",
      },
      {
        yearLabel: "2019 pilot → 2021+ annual ASUSE",
        summary:
          "ASUSE piloted 2019 (six months); full annual unit files from 2021–22 onward (NADA catalog/221, /222, /238, /293 for 2025). Replaces the multi-year gap between 67th/73rd-style rounds.",
      },
      {
        yearLabel: "2023–24 annual wave",
        summary:
          "ASUSE 2023–24 (~500k establishments in official notes); multi-level NADA files for characteristics, employment, receipts, and assets (catalog/238).",
      },
    ],
    waves: [
      {
        yearLabel: "2023–24",
        yearStart: 2023,
        yearEnd: 2024,
        datasetSlug: "asuse-2023-24",
        isLatest: true,
        designNote: "Annual unincorporated sector—not factory ASI.",
      },
    ],
  },
  {
    slug: "nss-sas",
    title: "Situation Assessment of Agricultural Households (NSS)",
    shortTitle: "SAS",
    family: "nss",
    description:
      "NSS situation assessment of agricultural households—income, assets, debt, practices, and schemes. Episodic (roughly decadal): 59th (2003 farmers), 70th (2013 agricultural households), 77th (2019 integrated with land & livestock).",
    host: "NSO / MoSPI",
    cluster: "agriculture",
    pairsWithSeries: ["agriculture-census", "nss-hces"],
    designRevisions: [
      {
        yearLabel: "2003 — 59th round (first SAS of farmers)",
        summary:
          "First integrated Schedule 33 Situation Assessment Survey of Farmers (Jan–Dec 2003): living standards, income/assets, debt, practices, and technology access. Prior NSS rounds had scattered farm items, not this integrated schedule.",
      },
      {
        yearLabel: "2013 — 70th round (agricultural households)",
        summary:
          "Repeat SAS as Situation Assessment of Agricultural Households (Jan–Dec 2013; NADA e.g. catalog/134). Concept shift from “farmer” to agricultural household; related land & livestock visit files also on NADA LLS.",
      },
      {
        yearLabel: "2019 — 77th round (integrated SAS + LLS)",
        summary:
          "Third SAS: integrated Land and Livestock Holdings and Situation Assessment of Agricultural Households (Jan–Dec 2019; NADA catalog/157, Visit 1 & 2). Core modules: income, debt, assets, technology, schemes.",
      },
    ],
    waves: [
      {
        yearLabel: "2019 (77th)",
        yearStart: 2019,
        datasetSlug: "sas-ag-households-2019",
        isLatest: true,
        designNote: "Third SAS wave; pair schedule carefully with 59th/70th.",
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
  {
    slug: "access-energy",
    title: "ACCESS Energy Access Surveys (CEEW / Harvard Dataverse)",
    shortTitle: "ACCESS",
    family: "academic",
    description:
      "Multi-state household energy-access surveys on electricity and clean cooking. Pair with IRES 2020 and related replications for a full energy stack.",
    host: "Harvard Dataverse / CEEW",
    cluster: "climate-infra",
    pinned: true,
    pairsWithSeries: [],
    designRevisions: [
      {
        yearLabel: "2015 (ACCESS 2015)",
        summary: "Baseline multidimensional energy-access survey in six energy-poor states.",
      },
      {
        yearLabel: "2018 (ACCESS 2018)",
        summary: "Panel follow-up wave updating electricity and cooking outcomes.",
      },
    ],
    waves: [
      {
        yearLabel: "2015",
        yearStart: 2015,
        datasetSlug: "access-2015",
        designNote: "Six energy-poor states; electricity and cooking access.",
      },
      {
        yearLabel: "2018",
        yearStart: 2018,
        datasetSlug: "access-2018",
        isLatest: true,
        designNote: "Panel update on energy access and service quality.",
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

export function seriesByFamily(family: DataSeries["family"]): DataSeries[] {
  return seriesList.filter((s) => s.family === family);
}

export const FAMILY_LABELS: Record<DataSeries["family"], string> = {
  nfhs: "NFHS family",
  nss: "NSS / NSO surveys",
  dlhs: "DLHS family",
  other: "Other multi-year series",
  academic: "Academic / Dataverse series",
};
