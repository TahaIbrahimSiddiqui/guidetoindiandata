import type { Dataset, VariableEntry } from "@/types/dataset";

/** Extra official-style listings for flagship datasets (labels match public docs language). */
const ENRICHED: Record<
  string,
  { entries: VariableEntry[]; source: string; url?: string }
> = {
  "nfhs-5": {
    source:
      "DHS / IIPS NFHS-5 recode documentation and report tables (household, women, men, biomarkers)",
    url: "https://dhsprogram.com/data/",
    entries: [
      { name: "CASEID / HHID", label: "Case and household identifiers", group: "IDs" },
      { name: "V024 / SDIST", label: "State and district codes", group: "Geography" },
      { name: "V201", label: "Total children ever born", group: "Fertility" },
      { name: "V313", label: "Current contraceptive method", group: "Family planning" },
      { name: "M14 / M15", label: "Antenatal care visits and place", group: "Maternal" },
      { name: "H1–H10", label: "Childhood vaccination markers", group: "Child health" },
      { name: "HW70 / HW71 / HW72", label: "Child anthropometry z-scores", group: "Nutrition" },
      { name: "HA40 / HB40", label: "Adult BMI (women / men)", group: "Biomarkers" },
      { name: "HA57 / HB57", label: "Anemia status", group: "Biomarkers" },
      { name: "SHB*", label: "Blood pressure and glucose modules", group: "NCDs" },
    ],
  },
  "nfhs-4": {
    source: "DHS / IIPS NFHS-4 recode documentation (district-level design)",
    url: "https://dhsprogram.com/data/",
    entries: [
      { name: "District IDs", label: "District-level estimate geography", group: "Geography" },
      { name: "Fertility", label: "Birth history and TFR inputs", group: "Fertility" },
      { name: "Child growth", label: "Anthropometry and nutrition", group: "Nutrition" },
      { name: "Sanitation", label: "Toilet and water indicators", group: "WASH" },
      { name: "Biomarkers", label: "Anemia and selected bio measures", group: "Biomarkers" },
    ],
  },
  "plfs-annual-2023-24": {
    source: "NSO / MoSPI PLFS microdata DDI and unit-level data dictionary",
    url: "https://www.mospi.gov.in/",
    entries: [
      { name: "HHID / PERSONID", label: "Household and person identifiers", group: "IDs" },
      { name: "Usual status", label: "Principal and subsidiary activity status", group: "Activity" },
      { name: "CWS", label: "Current weekly status", group: "Activity" },
      { name: "NIC / NCO", label: "Industry and occupation codes", group: "Work" },
      { name: "Earnings", label: "Wage / salary and earnings fields", group: "Earnings" },
      { name: "Hours", label: "Hours worked", group: "Work" },
      { name: "LFPR / WPR / UR", label: "Labour force, worker, unemployment rates (derived)", group: "Indicators" },
    ],
  },
  "hces-2023-24": {
    source: "NSO / MoSPI HCES microdata DDI and item schedules",
    url: "https://www.mospi.gov.in/",
    entries: [
      { name: "HHID", label: "Household identifier", group: "IDs" },
      { name: "MPCE", label: "Monthly per capita expenditure", group: "Welfare" },
      { name: "Fractile class", label: "MPCE fractile / decile class", group: "Welfare" },
      { name: "Food items", label: "Item-wise food quantity and value", group: "Consumption" },
      { name: "Non-food items", label: "Item-wise non-food quantity and value", group: "Consumption" },
      { name: "Sector", label: "Rural / urban sector", group: "Geography" },
    ],
  },
  "asi-2023-24": {
    source: "NSO / MoSPI ASI unit-level schedules and DDI",
    url: "https://www.mospi.gov.in/",
    entries: [
      { name: "Factory ID", label: "Establishment identifiers", group: "IDs" },
      { name: "Ownership", label: "Ownership type", group: "Structure" },
      { name: "Fixed assets", label: "Gross/net fixed capital", group: "Capital" },
      { name: "Working capital", label: "Working capital block", group: "Capital" },
      { name: "Labour cost", label: "Emoluments and employment", group: "Labour" },
      { name: "Inputs / outputs", label: "Input materials and products", group: "Production" },
    ],
  },
  "udise-plus": {
    source: "UDISE+ school data dictionary / dashboard field list (MoE)",
    url: "https://udiseplus.gov.in/",
    entries: [
      { name: "School ID", label: "UDISE school code", group: "IDs" },
      { name: "Infrastructure", label: "Building, toilets, electricity, digital", group: "School" },
      { name: "Teachers", label: "Teacher counts and qualifications", group: "Teachers" },
      { name: "Enrolment", label: "Enrolment by class / gender", group: "Students" },
      { name: "Results", label: "Examination result fields where published", group: "Outcomes" },
    ],
  },
  "cpcb-aqi": {
    source: "CPCB CAAQMS / AQI repository station and pollutant fields",
    url: "https://airquality.cpcb.gov.in/",
    entries: [
      { name: "Station", label: "Monitoring station ID and name", group: "Location" },
      { name: "City / State", label: "City and state of station", group: "Location" },
      { name: "Timestamp", label: "Observation time", group: "Time" },
      { name: "AQI", label: "Air quality index", group: "Pollutants" },
      { name: "PM2.5 / PM10", label: "Particulate matter", group: "Pollutants" },
      { name: "NO2 / O3", label: "Gaseous pollutants", group: "Pollutants" },
    ],
  },
  "census-pca-2011": {
    source: "Census of India PCA 2011 table metadata (ORGI)",
    url: "https://censusindia.gov.in/",
    entries: [
      { name: "State / District / Village codes", label: "Administrative geography codes", group: "Geography" },
      { name: "TOT_P / TOT_M / TOT_F", label: "Total population by sex", group: "Population" },
      { name: "P_LIT / M_LIT / F_LIT", label: "Literates by sex", group: "Literacy" },
      { name: "TOT_WORK_P", label: "Total workers", group: "Work" },
      { name: "SC / ST", label: "Scheduled caste and tribe population", group: "Social" },
      { name: "No_HH", label: "Number of households", group: "Housing" },
    ],
  },
  hmis: {
    source: "MoHFW HMIS portal indicator / facility reporting fields",
    url: "https://hmis.mohfw.gov.in/",
    entries: [
      { name: "Facility / geography", label: "Facility and block–district codes", group: "Location" },
      { name: "Births / deaths", label: "Reported births and deaths", group: "Vital" },
      { name: "Immunization", label: "Vaccination session and dose counts", group: "Service" },
      { name: "Patient counts", label: "OPD / service utilization", group: "Service" },
      { name: "Drug stocks", label: "Essential drug stock fields", group: "Logistics" },
    ],
  },
  "access-2015": {
    source: "ACCESS 2015 Harvard Dataverse / CEEW survey documentation",
    url: "https://doi.org/10.7910/DVN/0NV9LF",
    entries: [
      { name: "Electricity access", label: "Household electricity connection and use", group: "Electricity" },
      { name: "Cooking fuels", label: "Primary cooking fuel and clean cooking access", group: "Cooking" },
      { name: "Service quality", label: "Reliability and quality of energy services", group: "Quality" },
      { name: "Expenditure", label: "Energy and related household expenditure", group: "Economics" },
      { name: "Socio-economic", label: "Household socio-economic characteristics", group: "Background" },
    ],
  },
  "access-2018": {
    source: "ACCESS 2018 Harvard Dataverse / CEEW panel documentation",
    url: "https://doi.org/10.7910/DVN/AHFINM",
    entries: [
      { name: "Panel energy access", label: "Updated electricity and cooking outcomes", group: "Energy" },
      { name: "Electricity outcomes", label: "Connection, hours, quality", group: "Electricity" },
      { name: "Cooking outcomes", label: "Fuel mix and clean cooking", group: "Cooking" },
    ],
  },
  "ires-2020": {
    source: "IRES 2020 Harvard Dataverse documentation",
    url: "https://doi.org/10.7910/DVN/U8NYUP",
    entries: [
      { name: "Access", label: "Energy access indicators", group: "Energy" },
      { name: "Reliability", label: "Electricity reliability", group: "Electricity" },
      { name: "Appliances", label: "Appliance ownership", group: "Demand" },
      { name: "Fuels", label: "Cooking and heating fuel choices", group: "Fuels" },
      { name: "Efficiency", label: "Efficiency-related indicators", group: "Efficiency" },
    ],
  },
};

function humanize(raw: string): string {
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function resolveVariables(dataset: Dataset): {
  entries: VariableEntry[];
  source: string;
  url?: string;
} {
  const rich = ENRICHED[dataset.slug];
  if (rich) return rich;

  if (dataset.variables?.length) {
    return {
      entries: dataset.variables,
      source:
        dataset.variablesSource ??
        `Fields listed from ${dataset.host} public documentation`,
      url: dataset.variablesUrl ?? dataset.docsUrl ?? dataset.accessUrl,
    };
  }

  return {
    entries: dataset.keyVariables.map((k) => ({
      name: k,
      label: humanize(k),
      group: "Representative fields",
    })),
    source: `Representative fields from ${dataset.host} materials (confirm full dictionary on the official portal)`,
    url: dataset.variablesUrl ?? dataset.docsUrl ?? dataset.accessUrl,
  };
}
