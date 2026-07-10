import type { Dataset, VariableEntry } from "@/types/dataset";
import { LIVE_VARIABLES } from "@/data/liveVariables";

/** Official-style variable listings (labels match public docs language). */
const ENRICHED: Record<
  string,
  { entries: VariableEntry[]; source: string; url?: string }
> = {
  // ── NFHS ────────────────────────────────────────────────────────
  "nfhs-1": {
    source: "DHS / IIPS NFHS-1 recode documentation (household & individual modules)",
    url: "https://dhsprogram.com/data/Data-Variables-and-Definitions.cfm",
    entries: [
      { name: "CASEID / HHID", label: "Case and household identifiers", group: "IDs" },
      { name: "V024", label: "State / region code", group: "Geography" },
      { name: "V201", label: "Children ever born", group: "Fertility" },
      { name: "V313", label: "Current contraceptive method", group: "Family planning" },
      { name: "Maternal care", label: "Antenatal and delivery care fields", group: "Maternal" },
      { name: "Child mortality", label: "Birth history and child survival", group: "Mortality" },
    ],
  },
  "nfhs-2": {
    source: "DHS / IIPS NFHS-2 recode documentation",
    url: "https://dhsprogram.com/data/Data-Variables-and-Definitions.cfm",
    entries: [
      { name: "CASEID / HHID", label: "Case and household identifiers", group: "IDs" },
      { name: "Fertility", label: "Birth history and TFR inputs", group: "Fertility" },
      { name: "Nutrition", label: "Anthropometry and feeding practices", group: "Nutrition" },
      { name: "Family planning", label: "Contraceptive use and knowledge", group: "Family planning" },
      { name: "Health care", label: "Care-seeking and service use", group: "Health care" },
    ],
  },
  "nfhs-3": {
    source: "DHS / IIPS NFHS-3 recode documentation (includes HIV module)",
    url: "https://dhsprogram.com/data/Data-Variables-and-Definitions.cfm",
    entries: [
      { name: "CASEID / HHID", label: "Case and household identifiers", group: "IDs" },
      { name: "HIV", label: "HIV testing and prevalence fields", group: "Biomarkers" },
      { name: "V201", label: "Children ever born", group: "Fertility" },
      { name: "Nutrition", label: "Child and adult nutrition measures", group: "Nutrition" },
      { name: "Women’s status", label: "Decision-making and autonomy modules", group: "Gender" },
      { name: "Health care use", label: "Service utilization fields", group: "Health care" },
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
      { name: "Women’s health", label: "Maternal and reproductive health", group: "Maternal" },
    ],
  },
  "nfhs-5": {
    source:
      "Scraped DHS Data Variables & Definitions + India Standard DHS 2019–21 recode file list (household, women, men, biomarkers)",
    url: "https://dhsprogram.com/data/Data-Variables-and-Definitions.cfm",
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
      { name: "HV005 / V005", label: "Household and women sample weights", group: "Weights" },
      { name: "Recode files", label: "IR/MR/HR/PR/KR/BR standardized recode datasets", group: "Files" },
    ],
  },

  // ── DLHS ────────────────────────────────────────────────────────
  "dlhs-1": {
    source: "IIPS / MoHFW DLHS-1 district RCH documentation",
    url: "https://www.iipsindia.ac.in/",
    entries: [
      { name: "District ID", label: "District geography code", group: "Geography" },
      { name: "Reproductive health", label: "RCH service and outcome indicators", group: "RCH" },
      { name: "Family planning", label: "Contraceptive use and unmet need", group: "Family planning" },
      { name: "ANC / delivery", label: "Maternal care markers", group: "Maternal" },
    ],
  },
  "dlhs-2": {
    source: "IIPS / GHDx DLHS-2 metadata and schedules",
    url: "https://ghdx.healthdata.org/",
    entries: [
      { name: "Household health use", label: "Service utilization fields", group: "Service" },
      { name: "RCH indicators", label: "Reproductive and child health", group: "RCH" },
      { name: "District comparisons", label: "District-level program indicators", group: "Geography" },
    ],
  },
  "dlhs-3": {
    source: "IIPS / MoHFW DLHS-3 all-district documentation",
    url: "https://www.iipsindia.ac.in/",
    entries: [
      { name: "MCH indicators", label: "Maternal and child health measures", group: "MCH" },
      { name: "Family planning", label: "Contraception and spacing", group: "Family planning" },
      { name: "Service quality", label: "Facility and service quality items", group: "Quality" },
      { name: "District ID", label: "All-district coverage codes", group: "Geography" },
    ],
  },
  "dlhs-4": {
    source: "IIPS / GHDx DLHS-4 district and facility survey docs",
    url: "https://ghdx.healthdata.org/",
    entries: [
      { name: "District health indicators", label: "District RCH outcome set", group: "District" },
      { name: "Facility measures", label: "Facility-linked service capacity", group: "Facility" },
      { name: "Household modules", label: "Household health and service use", group: "Household" },
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
      { name: "Infrastructure", label: "Facility infrastructure markers", group: "Facility" },
    ],
  },
  "srs-statistical-reports": {
    source: "ORGI Sample Registration System report tables",
    url: "https://censusindia.gov.in/",
    entries: [
      { name: "CBR", label: "Crude birth rate", group: "Fertility" },
      { name: "CDR", label: "Crude death rate", group: "Mortality" },
      { name: "IMR", label: "Infant mortality rate", group: "Mortality" },
      { name: "Age composition", label: "Age-structure of sample population", group: "Demography" },
      { name: "State / UT", label: "State and larger UT estimates", group: "Geography" },
    ],
  },
  "crs-vital-statistics": {
    source: "ORGI Civil Registration System vital statistics reports",
    url: "https://censusindia.gov.in/",
    entries: [
      { name: "Registered births", label: "Birth registrations by geography", group: "Births" },
      { name: "Registered deaths", label: "Death registrations by geography", group: "Deaths" },
      { name: "Infant deaths", label: "Registered infant deaths", group: "Mortality" },
      { name: "Sex ratio at birth", label: "Sex ratio of registered births", group: "Gender" },
      { name: "State / UT", label: "Registration-system geography", group: "Geography" },
    ],
  },
  "lasi-wave-1": {
    source: "IIPS / Harvard / USC LASI Wave 1 data user guide and codebook",
    url: "https://www.iipsindia.ac.in/lasi/",
    entries: [
      { name: "HHID / PID", label: "Household and person identifiers", group: "IDs" },
      { name: "Health modules", label: "Self-reported health and chronic conditions", group: "Health" },
      { name: "Cognition", label: "Cognitive test batteries", group: "Cognition" },
      { name: "Work / income", label: "Employment and economic status", group: "Economics" },
      { name: "Family support", label: "Family and social support", group: "Social" },
      { name: "Community module", label: "Village / urban community context", group: "Community" },
      { name: "Biomarkers", label: "Selected physical measures where collected", group: "Biomarkers" },
    ],
  },
  "lasi-dad": {
    source: "LASI-DAD data products overview (cognition, informant, geriatric)",
    url: "https://www.lasi-dad.org/data/overview",
    entries: [
      { name: "Cognition tests", label: "Raw cognitive test scores", group: "Cognition" },
      { name: "Informant interview", label: "Informant report items", group: "Informant" },
      { name: "Geriatric assessment", label: "Geriatric evaluation fields", group: "Clinical" },
      { name: "Biomarkers", label: "Biomarker subsample measures", group: "Biomarkers" },
      { name: "Age 60+", label: "LASI subsample aged 60+", group: "Sample" },
    ],
  },

  // ── Education ───────────────────────────────────────────────────
  "udise-plus": {
    source: "UDISE+ school data dictionary / dashboard field list (MoE)",
    url: "https://udiseplus.gov.in/",
    entries: [
      { name: "School ID", label: "UDISE school code", group: "IDs" },
      { name: "Infrastructure", label: "Building, toilets, electricity, digital", group: "School" },
      { name: "Teachers", label: "Teacher counts and qualifications", group: "Teachers" },
      { name: "Enrolment", label: "Enrolment by class / gender", group: "Students" },
      { name: "Results", label: "Examination result fields where published", group: "Outcomes" },
      { name: "Management", label: "School management type", group: "School" },
    ],
  },
  aishe: {
    source: "AISHE portal institution and programme field lists (MoE)",
    url: "https://aishe.gov.in/",
    entries: [
      { name: "Institution ID", label: "Higher education institution code", group: "IDs" },
      { name: "Teachers", label: "Faculty counts and ranks", group: "Faculty" },
      { name: "Student enrolment", label: "Enrolment by programme and gender", group: "Students" },
      { name: "Programmes", label: "Programme offerings and levels", group: "Programmes" },
      { name: "Exam results", label: "Examination outcome fields", group: "Outcomes" },
      { name: "Finance", label: "Institution finance items", group: "Finance" },
      { name: "Infrastructure", label: "Campus infrastructure", group: "Infrastructure" },
    ],
  },
  "nas-2021": {
    source: "NAS 2021 / PARAKH report card and questionnaire documentation",
    url: "https://www.education.gov.in/",
    entries: [
      { name: "Test scores", label: "Learning outcome assessment scores", group: "Outcomes" },
      { name: "Pupil questionnaire", label: "Student background items", group: "Students" },
      { name: "School questionnaire", label: "School context items", group: "School" },
      { name: "Teacher questionnaire", label: "Teacher background items", group: "Teachers" },
      { name: "District", label: "District assessment geography", group: "Geography" },
    ],
  },
  aser: {
    source: "ASER Centre survey tools and rural learning report fields",
    url: "https://asercentre.org/aser-survey/",
    entries: [
      { name: "School enrolment", label: "Whether child is enrolled / type of school", group: "Schooling" },
      { name: "Reading", label: "Reading assessment levels", group: "Learning" },
      { name: "Arithmetic", label: "Arithmetic assessment levels", group: "Learning" },
      { name: "School report card", label: "School observation items (where collected)", group: "School" },
      { name: "Village / district", label: "Rural sample geography", group: "Geography" },
    ],
  },

  // ── NSO labour / consumption / firms ────────────────────────────
  "plfs-annual-2023-24": {
    source:
      "Chrome-scraped MoSPI NADA data dictionary PLFS 2023–24 (files hhrv/hhv1/perrv/perv1; DDI-IND-CSO-PLFS-2023-24)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/213/data-dictionary",
    entries: [
      { name: "b1q15 / b4q1", label: "Sample household number / person serial no.", group: "IDs" },
      { name: "state_* / distcode_*", label: "State/UT and district codes", group: "Geography" },
      { name: "b1q3_*", label: "Sector (rural / urban)", group: "Geography" },
      { name: "b3q1 / b3q2", label: "Household size and household type", group: "Household" },
      { name: "b3q3 / b3q4", label: "Religion and social group", group: "Household" },
      { name: "b3q5", label: "Usual monthly consumer expenditure (Rs.)", group: "Welfare" },
      { name: "b4q5 / b4q6", label: "Gender and age", group: "Demography" },
      { name: "b4q8 / b4q9", label: "General and technical education level", group: "Education" },
      { name: "b5pt1q3", label: "Usual principal status code", group: "Activity" },
      { name: "b5pt1q5 / b5pt1q6", label: "Industry code (NIC) and occupation code (NCO)", group: "Work" },
      { name: "b5pt1q7", label: "Whether engaged in any work in subsidiary capacity", group: "Activity" },
      { name: "b5pt2q3 / b5pt2q5 / b5pt2q6", label: "Subsidiary status, NIC, NCO", group: "Activity" },
      { name: "mult_*", label: "Sub-sample wise multiplier", group: "Weights" },
      { name: "Data files", label: "hhrv (32 vars), hhv1 (37), perrv (104), perv1 (139)", group: "Files" },
    ],
  },
  "plfs-quarterly-2025": {
    source:
      "Chrome-scraped MoSPI NADA PLFS collection (same unit-level schema family as annual microdata)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/PLFS",
    entries: [
      { name: "state / distcode", label: "State/UT and district codes", group: "Geography" },
      { name: "Sector", label: "Rural / urban sector", group: "Geography" },
      { name: "Person serial / HH no.", label: "Person and household identifiers", group: "IDs" },
      { name: "Status code", label: "Activity status (principal / CWS-style)", group: "Activity" },
      { name: "NIC / NCO", label: "Industry and occupation codes", group: "Work" },
      { name: "Subsidiary status", label: "Subsidiary capacity work fields", group: "Activity" },
      { name: "Multiplier", label: "Survey weight / multiplier", group: "Weights" },
    ],
  },
  "time-use-survey-2024": {
    source: "NSO / MoSPI Time Use Survey schedules and DDI",
    url: "https://www.mospi.gov.in/",
    entries: [
      { name: "Paid work", label: "Time in employment / paid work", group: "Work" },
      { name: "Unpaid care", label: "Unpaid caregiving time", group: "Care" },
      { name: "Domestic services", label: "Unpaid domestic work", group: "Care" },
      { name: "Learning", label: "Education and learning time", group: "Learning" },
      { name: "Leisure / self-care", label: "Leisure and personal care", group: "Personal" },
      { name: "Person ID", label: "Household and person identifiers", group: "IDs" },
    ],
  },
  "hces-2022-23": {
    source:
      "MoSPI NADA HCES 2022–23 collection (same multi-level unit files family as 2023–24)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/224",
    entries: [
      { name: "HHID", label: "Household identifier", group: "IDs" },
      { name: "MPCE", label: "Monthly per capita expenditure", group: "Welfare" },
      { name: "Food items", label: "Item-wise food quantity and value", group: "Consumption" },
      { name: "Non-food items", label: "Item-wise non-food quantity and value", group: "Consumption" },
      { name: "Sector / state", label: "Rural-urban and state codes", group: "Geography" },
      { name: "Level files", label: "Multi-section unit-level files (household + item blocks)", group: "Files" },
    ],
  },
  "hces-2023-24": {
    source:
      "Chrome/Playwright-scraped MoSPI NADA HCES 2023–24 data dictionary (DDI-IND-MOSPI-NSS-HCES23-24; 15 level files)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/237/data-dictionary",
    entries: [
      { name: "LEVEL-01 (Sec 1/1_1)", label: "Household identification block (21 variables, 261,953 cases)", group: "Household" },
      { name: "LEVEL-02 (Sec 3)", label: "Person-level demographic block (36 variables)", group: "Persons" },
      { name: "LEVEL-03 / 04 / 07 / 11", label: "Household characteristics and expenditure summary sections", group: "Household" },
      { name: "LEVEL-05 (Sec 5–6)", label: "Item-level food/consumption detail (12.7M cases, 25 vars)", group: "Consumption" },
      { name: "LEVEL-09 (Sec 9–11)", label: "Additional item blocks (8.3M cases)", group: "Consumption" },
      { name: "LEVEL-12 / 13", label: "Further item / durable sections (millions of cases)", group: "Consumption" },
      { name: "MPCE / fractiles", label: "Monthly per capita expenditure constructs in reports + unit files", group: "Welfare" },
      { name: "Sector / state", label: "Rural–urban and state geography", group: "Geography" },
    ],
  },
  "asuse-2023-24": {
    source: "NSO / MoSPI ASUSE unit-level DDI and establishment schedules",
    url: "https://microdata.gov.in/NADA/index.php/catalog/ENT",
    entries: [
      { name: "Establishment ID", label: "Unincorporated enterprise identifier", group: "IDs" },
      { name: "Characteristics", label: "Establishment type and sector", group: "Structure" },
      { name: "Output", label: "Gross output / receipts", group: "Production" },
      { name: "Value added", label: "GVA constructs", group: "Production" },
      { name: "Employment", label: "Workers and emoluments", group: "Labour" },
      { name: "Operating variables", label: "Inputs, expenses, assets", group: "Operations" },
    ],
  },
  "asi-2023-24": {
    source:
      "Chrome-scraped MoSPI NADA ASI 2023–24 data dictionary (DDI-IND-NSO-ASI-2023-24; blocks A–J)",
    url: "https://microdata.gov.in/NADA/index.php/catalog/256/data-dictionary",
    entries: [
      { name: "a1 / a2", label: "DSL and PSL establishment IDs (Block A)", group: "IDs" },
      { name: "a4 / a5", label: "Industry code frame (NIC-2008 class) and return (sub-class)", group: "Industry" },
      { name: "a7 / a8 / a9", label: "State, district, sector (rural/urban)", group: "Geography" },
      { name: "a3 / a12", label: "Scheme code (census/sample) and status of unit", group: "Structure" },
      { name: "bonus / pf / welfare", label: "Bonus, PF/other funds, staff welfare expenses (Rs.)", group: "Labour cost" },
      { name: "mwdays / nwdays / wdays", label: "Manufacturing, non-manufacturing, and total working days", group: "Operations" },
      { name: "costop", label: "Total cost of production", group: "Production" },
      { name: "expshare", label: "Share of products/by-products directly exported (%)", group: "Trade" },
      { name: "mult", label: "Multiplier (survey weight)", group: "Weights" },
      { name: "Blocks B–J", label: "Ownership, fixed assets, working capital, employment, inputs/outputs files", group: "Files" },
    ],
  },
  "sas-ag-households-2019": {
    source: "NSO 77th round Situation Assessment DDI and schedules",
    url: "https://www.mospi.gov.in/",
    entries: [
      { name: "HHID", label: "Agricultural household identifier", group: "IDs" },
      { name: "Assets", label: "Household assets", group: "Wealth" },
      { name: "Income", label: "Income from farming and other sources", group: "Income" },
      { name: "Consumption", label: "Household consumption", group: "Welfare" },
      { name: "Indebtedness", label: "Debt and credit fields", group: "Credit" },
      { name: "Farming practices", label: "Crop and technology practices", group: "Agriculture" },
      { name: "Scheme access", label: "Welfare and farm scheme participation", group: "Programs" },
    ],
  },

  // ── IHDS / CMIE ─────────────────────────────────────────────────
  "ihds-i": {
    source: "IHDS-I ICPSR codebook and topic index",
    url: "https://ihds.umd.edu/ihds-1-codebook-topic-index",
    entries: [
      { name: "HHID / PERSONID", label: "Household and member IDs", group: "IDs" },
      { name: "Health", label: "Health and morbidity modules", group: "Health" },
      { name: "Education", label: "Schooling and learning", group: "Education" },
      { name: "Employment", label: "Work and wages", group: "Labour" },
      { name: "Assets", label: "Household assets and housing", group: "Wealth" },
      { name: "Marriage / fertility", label: "Marriage and fertility histories", group: "Family" },
      { name: "Social capital", label: "Networks and social capital", group: "Social" },
    ],
  },
  "ihds-ii": {
    source: "IHDS-II ICPSR data guide and codebooks",
    url: "https://www.icpsr.umich.edu/web/pages/DSDR/idhs-II-data-guide.html",
    entries: [
      { name: "Panel link", label: "Re-interview links to IHDS-I", group: "Panel" },
      { name: "Income", label: "Income modules", group: "Economics" },
      { name: "Consumption", label: "Consumption modules", group: "Welfare" },
      { name: "Agriculture", label: "Farm and land modules", group: "Agriculture" },
      { name: "Education", label: "Education and child tests", group: "Education" },
      { name: "Government programs", label: "Scheme participation", group: "Programs" },
    ],
  },
  "cmie-cphs": {
    source: "CMIE Consumer Pyramids handbook and member/household field lists",
    url: "https://consumerpyramidsdx.cmie.com/",
    entries: [
      { name: "HHID / member ID", label: "Anonymized household and member IDs", group: "IDs" },
      { name: "Panel wave", label: "Survey wave / visit identifiers", group: "Panel" },
      { name: "Employment", label: "Labour status fields", group: "Labour" },
      { name: "Income", label: "Income constructs", group: "Income" },
      { name: "Consumption", label: "Consumption and expenditure", group: "Welfare" },
    ],
  },
  "cmie-prowessdx": {
    source: "CMIE ProwessDX company financial field dictionary",
    url: "https://prowessdx.cmie.com/",
    entries: [
      { name: "Company ID", label: "Firm identifiers", group: "IDs" },
      { name: "P&L", label: "Profit and loss items", group: "Financials" },
      { name: "Balance sheet", label: "Assets and liabilities", group: "Financials" },
      { name: "Ratios", label: "Financial ratios", group: "Financials" },
      { name: "Cash flow", label: "Cash flow statement fields", group: "Financials" },
      { name: "Share prices", label: "Market price series", group: "Markets" },
      { name: "Corporate actions", label: "Dividends, splits, actions", group: "Markets" },
    ],
  },

  // ── Macro ───────────────────────────────────────────────────────
  "national-accounts-statistics": {
    source: "MoSPI National Accounts Statistics table metadata",
    url: "https://www.mospi.gov.in/",
    entries: [
      { name: "GDP", label: "Gross domestic product aggregates", group: "Macro" },
      { name: "GVA", label: "Gross value added by sector", group: "Macro" },
      { name: "National income", label: "National income aggregates", group: "Macro" },
      { name: "Sectoral aggregates", label: "Industry and institutional sector totals", group: "Structure" },
    ],
  },
  iip: {
    source: "MoSPI Index of Industrial Production series metadata",
    url: "https://www.mospi.gov.in/",
    entries: [
      { name: "Base year", label: "IIP base year reference", group: "Meta" },
      { name: "Category", label: "Industry category / use-based class", group: "Structure" },
      { name: "Index", label: "Index level", group: "Indicators" },
      { name: "Growth rate", label: "Year-on-year / sequential growth", group: "Indicators" },
    ],
  },
  "cpi-combined": {
    source: "MoSPI CPI Combined press-release and portal field list",
    url: "https://www.mospi.gov.in/",
    entries: [
      { name: "Rural CPI", label: "Rural consumer price index", group: "Prices" },
      { name: "Urban CPI", label: "Urban consumer price index", group: "Prices" },
      { name: "Combined CPI", label: "All-India combined CPI", group: "Prices" },
      { name: "Groups / sub-groups", label: "Item group and sub-group indices", group: "Structure" },
      { name: "State-wise", label: "State / UT CPI where published", group: "Geography" },
    ],
  },
  wpi: {
    source: "Office of Economic Adviser WPI series documentation",
    url: "https://eaindustry.nic.in/",
    entries: [
      { name: "WPI / PPI", label: "Wholesale / producer price indices", group: "Prices" },
      { name: "Commodity groups", label: "Commodity group indices", group: "Structure" },
      { name: "Base year", label: "Linked base-year series", group: "Meta" },
    ],
  },
  "rbi-dbie": {
    source: "RBI DBIE series browser metadata",
    url: "https://dbie.rbi.org.in/",
    entries: [
      { name: "Real sector", label: "Real-economy time series", group: "Macro" },
      { name: "Financial sector", label: "Banking and financial series", group: "Finance" },
      { name: "Financial markets", label: "Market rate and volume series", group: "Markets" },
      { name: "External sector", label: "BoP and external indicators", group: "External" },
      { name: "Public finance", label: "Fiscal series", group: "Fiscal" },
    ],
  },

  // ── Agriculture ─────────────────────────────────────────────────
  "agriculture-census-2015-16": {
    source: "Agriculture Census Division table metadata (2015–16)",
    url: "https://agcensus.nic.in/",
    entries: [
      { name: "Operational holdings", label: "Number of operational holdings", group: "Structure" },
      { name: "Area operated", label: "Area of holdings", group: "Land" },
      { name: "Size class", label: "Size-class of holdings", group: "Structure" },
      { name: "Irrigation status", label: "Irrigated vs unirrigated", group: "Irrigation" },
      { name: "Tenancy / land use", label: "Tenancy and land-use categories", group: "Land" },
    ],
  },
  "agriculture-census-2021-22": {
    source: "Agriculture Census 2021–22 operational guidelines and portal fields",
    url: "https://agcensus.nic.in/",
    entries: [
      { name: "Operational holdings", label: "Holdings count and area (rolling release)", group: "Structure" },
      { name: "Census process fields", label: "Reference-year process variables", group: "Meta" },
      { name: "State / district", label: "Administrative geography", group: "Geography" },
    ],
  },
  "input-survey-2016-17": {
    source: "Input Survey 2016–17 manuals and schedules",
    url: "https://agcensus.nic.in/",
    entries: [
      { name: "Holder ID", label: "Operational holder identifiers", group: "IDs" },
      { name: "Crops", label: "Irrigated / unirrigated crop area", group: "Crops" },
      { name: "Fertilizers", label: "Fertilizer use", group: "Inputs" },
      { name: "Manures / pesticides", label: "Organic and chemical inputs", group: "Inputs" },
    ],
  },
  "input-survey-2022-23": {
    source: "Input Survey 2022–23 manuals and schedules",
    url: "https://agcensus.nic.in/",
    entries: [
      { name: "Fertilizers", label: "Fertilizer use quantities", group: "Inputs" },
      { name: "HYV / hybrid seeds", label: "Seed type adoption", group: "Technology" },
      { name: "Pesticides / bio-inputs", label: "Plant protection and bio-inputs", group: "Inputs" },
      { name: "Irrigation-linked use", label: "Inputs by irrigation status", group: "Irrigation" },
    ],
  },
  "cost-of-cultivation": {
    source: "DES / DACFW Cost of Cultivation scheme notes",
    url: "https://desagri.gov.in/",
    entries: [
      { name: "Crop", label: "Principal crop identity", group: "Crop" },
      { name: "Labour", label: "Human and animal labour cost", group: "Costs" },
      { name: "Machinery", label: "Machine labour cost", group: "Costs" },
      { name: "Fertilizer", label: "Fertilizer and seed costs", group: "Costs" },
      { name: "A2+FL / C2", label: "Cost constructs used in MSP analysis", group: "Constructs" },
    ],
  },
  agmarknet: {
    source: "Agmarknet portal commodity arrival and price fields",
    url: "https://agmarknet.gov.in/",
    entries: [
      { name: "State / District", label: "Market geography", group: "Location" },
      { name: "Mandi", label: "Market / APMC name", group: "Location" },
      { name: "Commodity", label: "Commodity name", group: "Product" },
      { name: "Arrivals", label: "Market arrivals", group: "Quantity" },
      { name: "Min / Modal / Max price", label: "Wholesale price range", group: "Prices" },
      { name: "Date", label: "Observation date", group: "Time" },
    ],
  },
  "enam-dashboard": {
    source: "eNAM trade dashboard field list",
    url: "https://www.enam.gov.in/",
    entries: [
      { name: "State / APMC", label: "State and market identity", group: "Location" },
      { name: "Commodity", label: "Traded commodity", group: "Product" },
      { name: "Min / Modal / Max", label: "Price band", group: "Prices" },
      { name: "Arrivals / traded qty", label: "Quantity fields", group: "Quantity" },
      { name: "Unit / date", label: "Unit of trade and date", group: "Meta" },
    ],
  },
  "soil-health-card": {
    source: "Soil Health Card portal nutrient field list",
    url: "https://www.soilhealth.dac.gov.in/",
    entries: [
      { name: "N / P / K", label: "Macronutrients", group: "Nutrients" },
      { name: "S / micronutrients", label: "Sulphur and micronutrients", group: "Nutrients" },
      { name: "Organic carbon", label: "Soil organic carbon", group: "Soil" },
      { name: "pH / EC", label: "Acidity and electrical conductivity", group: "Soil" },
      { name: "Holding / farmer", label: "Farmer-holding identifiers", group: "IDs" },
    ],
  },
  "minor-irrigation-census-6": {
    source: "6th Minor Irrigation Census OGD variable descriptions",
    url: "https://data.gov.in/",
    entries: [
      { name: "Village", label: "Village geography", group: "Location" },
      { name: "Scheme type", label: "Type of minor irrigation scheme", group: "Scheme" },
      { name: "Ownership", label: "Ownership of scheme", group: "Structure" },
      { name: "Social status / holding size", label: "Holder social and size class", group: "Holders" },
      { name: "Maintenance / utilization", label: "Maintenance and use status", group: "Operations" },
    ],
  },

  // ── Crime / justice / elections ─────────────────────────────────
  "crime-in-india": {
    source: "NCRB Crime in India annual report table structure",
    url: "https://ncrb.gov.in/",
    entries: [
      { name: "IPC / SLL cases", label: "Offences by legal category", group: "Crime type" },
      { name: "Victims", label: "Victim counts and categories", group: "Victims" },
      { name: "State / UT", label: "State and UT tables", group: "Geography" },
      { name: "City tables", label: "City-level crime tables", group: "Geography" },
      { name: "Police categories", label: "Police-reported classifications", group: "System" },
    ],
  },
  "prison-statistics-india": {
    source: "NCRB Prison Statistics India report fields",
    url: "https://ncrb.gov.in/",
    entries: [
      { name: "Capacity / occupancy", label: "Prison capacity and occupancy", group: "Capacity" },
      { name: "Prisoner composition", label: "Demographics of prisoners", group: "Prisoners" },
      { name: "Prison type", label: "Central / district / other prison types", group: "Structure" },
      { name: "Staff", label: "Prison staff counts", group: "Staff" },
    ],
  },
  adsi: {
    source: "NCRB Accidental Deaths & Suicides in India tables",
    url: "https://ncrb.gov.in/",
    entries: [
      { name: "Suicides", label: "Suicide counts by cause / demography", group: "Mortality" },
      { name: "Accidental deaths", label: "Accident death counts", group: "Mortality" },
      { name: "Causes", label: "Cause categories", group: "Causes" },
      { name: "State / UT", label: "Geography of events", group: "Geography" },
      { name: "Occupation", label: "Occupation categories of deceased", group: "Socioeconomic" },
    ],
  },
  njdg: {
    source: "NJDG / eCourts dashboard case-status fields",
    url: "https://njdg.ecourts.gov.in/",
    entries: [
      { name: "Instituted", label: "Cases instituted", group: "Caseload" },
      { name: "Pending", label: "Pending caseload", group: "Caseload" },
      { name: "Disposed", label: "Cases disposed", group: "Caseload" },
      { name: "Civil / criminal", label: "Case nature", group: "Type" },
      { name: "Case type / delay reasons", label: "Type and pendency reason codes", group: "Type" },
    ],
  },
  "eci-general-election-reports": {
    source: "ECI general election statistical report components",
    url: "https://eci.gov.in/",
    entries: [
      { name: "Electors", label: "Registered electors", group: "Electorate" },
      { name: "Voters / turnout", label: "Votes polled and turnout", group: "Turnout" },
      { name: "Candidates", label: "Candidate lists", group: "Candidates" },
      { name: "Party-wise votes", label: "Votes by party", group: "Results" },
      { name: "Winners", label: "Successful candidates by constituency", group: "Results" },
    ],
  },
  "eci-assembly-election-reports": {
    source: "ECI assembly election statistical report components",
    url: "https://eci.gov.in/",
    entries: [
      { name: "AC electors", label: "Assembly constituency electors", group: "Electorate" },
      { name: "Voters / turnout", label: "Votes and turnout", group: "Turnout" },
      { name: "Parties / candidates", label: "Contestants and parties", group: "Candidates" },
      { name: "Winners", label: "AC winners", group: "Results" },
    ],
  },
  myneta: {
    source: "ADR / MyNeta affidavit-derived field list",
    url: "https://myneta.info/",
    entries: [
      { name: "Assets", label: "Declared assets", group: "Affidavit" },
      { name: "Liabilities", label: "Declared liabilities", group: "Affidavit" },
      { name: "Education", label: "Educational qualification", group: "Profile" },
      { name: "Criminal cases", label: "Pending / convicted cases", group: "Criminality" },
      { name: "Constituency / party", label: "Contest details", group: "Election" },
    ],
  },
  "lok-dhaba": {
    source: "TCPD Lok Dhaba data dictionary",
    url: "https://lokdhaba.ashoka.edu.in/",
    entries: [
      { name: "Election results", label: "Constituency results over time", group: "Results" },
      { name: "Constituency history", label: "Historical constituency identity", group: "Geography" },
      { name: "Candidate / party trajectories", label: "Candidate and party careers", group: "Politics" },
    ],
  },

  // ── Climate / infra ─────────────────────────────────────────────
  "imd-rainfall": {
    source: "IMD Pune gridded rainfall product documentation",
    url: "https://www.imdpune.gov.in/",
    entries: [
      { name: "Daily rainfall", label: "Rainfall in mm", group: "Climate" },
      { name: "Lat / Lon", label: "0.25° grid coordinates", group: "Geography" },
      { name: "Date", label: "Daily time index (1901–present)", group: "Time" },
    ],
  },
  "imd-temperature": {
    source: "IMD Pune gridded temperature product documentation",
    url: "https://www.imdpune.gov.in/",
    entries: [
      { name: "Tmax / Tmin", label: "Daily maximum and minimum temperature", group: "Climate" },
      { name: "Lat / Lon", label: "1° grid coordinates", group: "Geography" },
      { name: "Date", label: "Daily time index (1951–present)", group: "Time" },
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
  "india-wris-reservoirs": {
    source: "India-WRIS reservoir module fields",
    url: "https://indiawris.gov.in/",
    entries: [
      { name: "Reservoir name", label: "Dam / reservoir identity", group: "IDs" },
      { name: "Storage", label: "Live / gross storage", group: "Hydrology" },
      { name: "Level", label: "Water level", group: "Hydrology" },
      { name: "Inflow / outflow", label: "Flow fields where available", group: "Hydrology" },
      { name: "Date / location", label: "Observation date and coordinates", group: "Meta" },
    ],
  },
  "cgwb-groundwater": {
    source: "CGWB / WRIS groundwater monitoring fields",
    url: "https://cgwb.gov.in/",
    entries: [
      { name: "Station", label: "Monitoring well / station ID", group: "Location" },
      { name: "Quarter / season", label: "Pre / post monsoon and quarterly reads", group: "Time" },
      { name: "Groundwater level", label: "Depth to water / level", group: "Hydrology" },
    ],
  },
  "cea-installed-capacity": {
    source: "CEA installed capacity report tables",
    url: "https://cea.nic.in/",
    entries: [
      { name: "Source", label: "Generation source (thermal, hydro, RE…)", group: "Energy" },
      { name: "Sector", label: "Ownership sector", group: "Structure" },
      { name: "State / region", label: "Geography of capacity", group: "Geography" },
      { name: "Installed MW", label: "Installed capacity in MW", group: "Capacity" },
      { name: "Month", label: "Report month", group: "Time" },
    ],
  },
  "npp-grid-india": {
    source: "NPP / GRID-INDIA daily generation dashboard fields",
    url: "https://npp.gov.in/",
    entries: [
      { name: "Daily generation", label: "Energy generated", group: "Operations" },
      { name: "Demand", label: "System demand", group: "Operations" },
      { name: "Transmission", label: "Transmission-related measures", group: "Grid" },
      { name: "Source-wise splits", label: "Generation by source", group: "Energy" },
    ],
  },
  "road-accidents-india": {
    source: "MoRTH Road Accidents in India report appendix structure",
    url: "https://morth.nic.in/",
    entries: [
      { name: "Accidents", label: "Accident counts", group: "Events" },
      { name: "Deaths / injuries", label: "Fatalities and injuries", group: "Outcomes" },
      { name: "Road category", label: "Road type classification", group: "Roads" },
      { name: "Weather / violation", label: "Contributing factors", group: "Causes" },
      { name: "Road user type", label: "Victim / user categories", group: "Users" },
    ],
  },
  "pmgsy-dashboard": {
    source: "PMGSY / OMMS dashboard progress fields",
    url: "https://omms.nic.in/",
    entries: [
      { name: "Roads sanctioned / completed", label: "Project road counts", group: "Progress" },
      { name: "Kilometers", label: "Length sanctioned / completed", group: "Progress" },
      { name: "Habitations", label: "Habitations covered", group: "Access" },
      { name: "Financial progress", label: "Expenditure vs sanction", group: "Finance" },
      { name: "State performance", label: "State-wise status", group: "Geography" },
    ],
  },
  "dgca-monthly-traffic": {
    source: "DGCA monthly traffic statistics tables",
    url: "https://www.dgca.gov.in/",
    entries: [
      { name: "City-pair passengers", label: "Passenger traffic by city pair", group: "Passengers" },
      { name: "Freight / mail", label: "Cargo and mail volumes", group: "Cargo" },
      { name: "Carrier-wise traffic", label: "Airline-level traffic", group: "Carriers" },
      { name: "Month", label: "Report month", group: "Time" },
    ],
  },
  "jjm-dashboard": {
    source: "Jal Jeevan Mission dashboard service-delivery fields",
    url: "https://jaljeevanmission.gov.in/",
    entries: [
      { name: "State / scheme", label: "State and scheme identity", group: "Geography" },
      { name: "Panchayat / village", label: "Local body geography", group: "Geography" },
      { name: "Households", label: "Household counts", group: "Coverage" },
      { name: "Tap connections", label: "Functional household tap connections", group: "Coverage" },
      { name: "Har Ghar Jal status", label: "Certification / coverage status", group: "Status" },
    ],
  },
  "sbm-g-dashboard": {
    source: "SBM-G dashboard ODF monitoring fields",
    url: "https://sbm.gov.in/",
    entries: [
      { name: "Villages / GPs / blocks", label: "Administrative units", group: "Geography" },
      { name: "Districts", label: "District coverage units", group: "Geography" },
      { name: "ODF Plus status", label: "ODF Plus stage", group: "Status" },
      { name: "Verification stages", label: "Verification progress", group: "Status" },
    ],
  },

  // ── Census / geospatial ─────────────────────────────────────────
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
  "district-census-handbook": {
    source: "District Census Handbook / Village Directory content description",
    url: "https://censusindia.gov.in/",
    entries: [
      { name: "Village area", label: "Village area measures", group: "Geography" },
      { name: "Households", label: "Household counts", group: "Housing" },
      { name: "Amenities", label: "Education, medical, water amenities", group: "Amenities" },
      { name: "Roads / power", label: "Connectivity and electricity", group: "Infrastructure" },
      { name: "Demographics", label: "Small-area demographic tables", group: "Population" },
    ],
  },
  "bhuvan-thematic": {
    source: "Bhuvan thematic product catalog (NRSC / ISRO)",
    url: "https://bhuvan.nrsc.gov.in/",
    entries: [
      { name: "LULC", label: "Land use / land cover classes", group: "Land" },
      { name: "Urban land use", label: "Urban thematic classes", group: "Urban" },
      { name: "Wasteland / water bodies", label: "Degraded land and water layers", group: "Environment" },
      { name: "Flood / geomorphology", label: "Hazard and terrain layers", group: "Hazards" },
      { name: "OGC services", label: "WMS/WFS service endpoints", group: "Access" },
    ],
  },
  "wastelands-atlas-2019": {
    source: "Wastelands Atlas 2019 class legend (DoLR / NRSC)",
    url: "https://dolr.gov.in/",
    entries: [
      { name: "Wasteland class", label: "23 wasteland classes", group: "Land" },
      { name: "State / district", label: "State and district aggregates", group: "Geography" },
      { name: "Area", label: "Class-wise area estimates", group: "Measures" },
    ],
  },
  "geoboundaries-india": {
    source: "geoBoundaries metadata (ADM levels, license)",
    url: "https://www.geoboundaries.org/",
    entries: [
      { name: "ADM0–ADMn", label: "Administrative boundary geometries", group: "Boundaries" },
      { name: "Metadata", label: "Source and version metadata", group: "Meta" },
      { name: "License", label: "CC BY 4.0 / ODbL variants", group: "License" },
    ],
  },
  "osm-india": {
    source: "OpenStreetMap data model / Geofabrik India extract",
    url: "https://download.geofabrik.de/asia/india.html",
    entries: [
      { name: "Roads / rail", label: "Transport network ways", group: "Transport" },
      { name: "Water / forests", label: "Natural features", group: "Environment" },
      { name: "POIs", label: "Points of interest", group: "Places" },
      { name: "Tags", label: "OSM key=value attributes", group: "Attributes" },
      { name: "Geometry", label: "Nodes, ways, relations", group: "Geometry" },
    ],
  },
  "landsat-collection-2": {
    source: "USGS Landsat Collection 2 product guide",
    url: "https://www.usgs.gov/landsat-missions/landsat-collection-2",
    entries: [
      { name: "Multispectral bands", label: "Surface reflectance / radiance bands", group: "Bands" },
      { name: "QA bands", label: "Quality assessment masks", group: "QA" },
      { name: "Geometry", label: "Scene footprint and projection", group: "Geometry" },
      { name: "Scene metadata", label: "Acquisition time and satellite IDs", group: "Meta" },
    ],
  },
  "sentinel-2-l2a": {
    source: "ESA Sentinel-2 L2A product specifications",
    url: "https://sentinels.copernicus.eu/web/sentinel/user-guides/sentinel-2-msi",
    entries: [
      { name: "10m / 20m / 60m bands", label: "13 spectral bands at native resolutions", group: "Bands" },
      { name: "Scene metadata", label: "Tile / sensing time / orbit", group: "Meta" },
      { name: "Geometry", label: "Tile footprint and CRS", group: "Geometry" },
      { name: "SCL / QA", label: "Scene classification and QA layers", group: "QA" },
    ],
  },

  // ── Academic energy surveys (already had partial) ───────────────
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

  // ── Academic / Dataverse (remaining) ────────────────────────────
  "indian-census-collection-1901-2026": {
    source:
      "Harvard Dataverse deposit description (Jolad & Singh): digitised subnational census & admin identifiers",
    url: "https://doi.org/10.7910/DVN/ON8CP8",
    entries: [
      { name: "State population", label: "State-level population by census round", group: "Population" },
      { name: "District population", label: "District-level population series", group: "Population" },
      { name: "Subdistrict population", label: "Subdistrict / tehsil population", group: "Population" },
      { name: "Admin identifiers", label: "Harmonized administrative codes over time", group: "Geography" },
      { name: "Census year", label: "Census round / reference year", group: "Time" },
      { name: "Codebook / changelog", label: "PDF codebook and change documentation", group: "Docs" },
    ],
  },
  "district-pop-estimates-2020": {
    source: "Harvard Dataverse: Population Estimates for Districts and PCs in India, 2020",
    url: "https://doi.org/10.7910/DVN/RXYJR6",
    entries: [
      { name: "District population", label: "Estimated district population 2020", group: "Population" },
      { name: "PC population", label: "Parliamentary constituency population 2020", group: "Population" },
      { name: "District ID", label: "District geography key", group: "Geography" },
      { name: "PC ID", label: "Parliamentary constituency key", group: "Geography" },
    ],
  },
  "electoral-criminality-2004-2009": {
    source: "Golden ICPSR / Harvard Dataverse candidate criminality documentation",
    url: "https://doi.org/10.3886/ICPSR35512.v1",
    entries: [
      { name: "Candidate ID / name", label: "Lok Sabha candidate identity", group: "Candidates" },
      { name: "Election results", label: "Votes and election outcome fields", group: "Results" },
      { name: "Criminal charges", label: "Declared / recorded criminal case status", group: "Criminality" },
      { name: "Party / constituency", label: "Party and parliamentary constituency", group: "Election" },
      { name: "Year", label: "2004 or 2009 Lok Sabha election", group: "Time" },
    ],
  },
  "gender-energy-perception-2021": {
    source: "Gender Perception Survey for Energy Access and Use (Dataverse / Nature Energy)",
    url: "https://doi.org/10.7910/DVN/GV85BL",
    entries: [
      { name: "Gendered energy perceptions", label: "Perceptions of energy access and use by gender", group: "Gender" },
      { name: "Empowerment dimensions", label: "Empowerment and agency measures", group: "Gender" },
      { name: "Household energy use", label: "Electricity and cooking energy use", group: "Energy" },
      { name: "Rural / urban-slum", label: "Settlement type of household", group: "Sample" },
      { name: "State", label: "Six-state survey geography", group: "Geography" },
    ],
  },
  "tafssa-nalanda-2023": {
    source: "TAFSSA District Agrifood Systems Assessment (Nalanda 2023) Dataverse modules",
    url: "https://doi.org/10.7910/DVN/5MAC6B",
    entries: [
      { name: "Household module", label: "Household questionnaire fields", group: "Modules" },
      { name: "Adolescent module", label: "Adolescent respondent fields", group: "Modules" },
      { name: "Male / female respondents", label: "Sex-specific respondent modules", group: "Modules" },
      { name: "Community questionnaire", label: "Village / community context", group: "Community" },
      { name: "Food systems / markets", label: "Production, markets, and food systems", group: "Food systems" },
      { name: "Diets", label: "Dietary intake and diversity", group: "Nutrition" },
      { name: "Climate risk / natural resources", label: "Climate risk and resource access", group: "Climate" },
      { name: "Gender", label: "Gender and intra-household roles", group: "Gender" },
    ],
  },
  "replication-bhavnani-lee-2018": {
    source: "Bhavnani & Lee 2018 JOP replication package description",
    url: "https://doi.org/10.7910/DVN/TWDSBW",
    entries: [
      { name: "District public goods", label: "District-level public-goods outcomes", group: "Outcomes" },
      { name: "IAS embeddedness", label: "Local embeddedness of IAS officers", group: "Bureaucracy" },
      { name: "Postings", label: "Officer posting assignments", group: "Bureaucracy" },
      { name: "Career history", label: "IAS career trajectory variables", group: "Bureaucracy" },
      { name: "District / year", label: "District panel identifiers", group: "IDs" },
    ],
  },
  "replication-kapoor-magesan-2018": {
    source: "Kapoor & Magesan 2018 APSR replication / appendix fields",
    url: "https://doi.org/10.7910/DVN/AJHFHU",
    entries: [
      { name: "Independent candidates", label: "Counts of independent contestants", group: "Candidates" },
      { name: "Turnout", label: "Constituency voter turnout", group: "Electorate" },
      { name: "Vote shares", label: "Party and candidate vote shares", group: "Results" },
      { name: "Coalition outcomes", label: "Coalition-related election outcomes", group: "Results" },
      { name: "Ethnic-party outcomes", label: "Ethnic party performance measures", group: "Parties" },
      { name: "Constituency", label: "Parliamentary constituency identity", group: "Geography" },
    ],
  },
  "replication-aklin-cheng-urpelainen-2021": {
    source: "Aklin, Cheng & Urpelainen 2021 JPP replication (ACCESS-linked)",
    url: "https://doi.org/10.7910/DVN/KBTHZH",
    entries: [
      { name: "Electrification outcomes", label: "Household / village electrification status", group: "Energy" },
      { name: "Caste identifiers", label: "Caste group or proxy identifiers", group: "Social" },
      { name: "Rural household variables", label: "Household and service-use fields", group: "Household" },
      { name: "Implementation measures", label: "Policy implementation indicators", group: "Policy" },
    ],
  },
  "replication-dugoua-liu-urpelainen-2017": {
    source: "Dugoua, Liu & Urpelainen 2017 Energy Policy village electrification data",
    url: "https://doi.org/10.7910/DVN/K1IUNQ",
    entries: [
      { name: "Village electrification status", label: "Whether village is electrified", group: "Energy" },
      { name: "Geographic barriers", label: "Terrain and distance barriers", group: "Geography" },
      { name: "Socio-economic indicators", label: "Village socio-economic context", group: "Socioeconomic" },
      { name: "Political participation", label: "Local political participation measures", group: "Politics" },
    ],
  },
  "replication-besley-burgess-2000": {
    source: "Besley & Burgess 2000 QJE land-reform state panel archive",
    url: "https://doi.org/10.7910/DVN/JWRHCK",
    entries: [
      { name: "Land-reform measures", label: "State land-reform legislation indicators", group: "Policy" },
      { name: "Poverty", label: "State poverty outcomes", group: "Welfare" },
      { name: "Growth", label: "State growth outcomes", group: "Macro" },
      { name: "State controls", label: "State-level control variables", group: "Controls" },
      { name: "State / year", label: "State panel identifiers", group: "IDs" },
    ],
  },
  "replication-karlan-mullainathan-roth-2019": {
    source: "Karlan et al. 2019 AER: Insights OpenICPSR India merged file fields",
    url: "https://doi.org/10.3886/E116321V1",
    entries: [
      { name: "Vendor debt", label: "Market-vendor debt balances", group: "Debt" },
      { name: "Borrowing", label: "Borrowing behavior and amounts", group: "Debt" },
      { name: "Loan sources", label: "Moneylender and other loan sources", group: "Credit" },
      { name: "Vendor outcomes", label: "Market-vendor business outcomes", group: "Outcomes" },
      { name: "1_India_merged.dta", label: "India merged Stata analysis file (~4.2 MB)", group: "Files" },
    ],
  },
  "replication-kyle-sampat-shadlen-2026": {
    source: "Kyle, Sampat & Shadlen 2026 TRIPS / pharma patents replication package",
    url: "https://doi.org/10.7910/DVN/5V5UOO",
    entries: [
      { name: "Pharmaceutical patents", label: "Patent grant and status fields", group: "IP" },
      { name: "Generic competition", label: "Generic entry and competition measures", group: "Markets" },
      { name: "Market outcomes", label: "Price / quantity / market share outcomes", group: "Markets" },
      { name: "Restricted commercial inputs", label: "IQVIA Ark/MIDAS components (restricted)", group: "Access" },
    ],
  },
  "replication-stainier-shah-barreca-2026": {
    source: "Stainier, Shah & Barreca 2026 JAERE heat–nutrition replication fields",
    url: "https://doi.org/10.7910/DVN/MCUQWV",
    entries: [
      { name: "Nutrition", label: "Rural household nutrition outcomes", group: "Nutrition" },
      { name: "Weather shocks", label: "Heat and weather shock measures", group: "Climate" },
      { name: "Adaptation behavior", label: "Household adaptation responses", group: "Behavior" },
      { name: "Agricultural season", label: "Season and agricultural timing variables", group: "Agriculture" },
    ],
  },
  "replication-adbi-agarwal-ghosh-2026": {
    source: "Adbi, Agarwal & Ghosh 2026 noise and learning replication package",
    url: "https://doi.org/10.7910/DVN/0UVLWW",
    entries: [
      { name: "Noise pollution", label: "Noise exposure measures", group: "Environment" },
      { name: "Student outcomes", label: "Academic / learning performance", group: "Education" },
      { name: "School / location", label: "School or location identifiers", group: "IDs" },
    ],
  },
  "india-renewable-energy-2010-2025": {
    source: "India Renewable Energy Dataset (solar PV & wind) Dataverse title fields",
    url: "https://doi.org/10.7910/DVN/GJNVJE",
    entries: [
      { name: "Solar PV capacity", label: "Installed solar PV capacity", group: "Capacity" },
      { name: "Wind capacity", label: "Installed wind capacity", group: "Capacity" },
      { name: "Costs", label: "Cost / tariff related series", group: "Economics" },
      { name: "Policy variables", label: "Policy regime and program indicators", group: "Policy" },
      { name: "Year", label: "2010–2025 time index", group: "Time" },
      { name: "State / national", label: "Geographic aggregation level", group: "Geography" },
    ],
  },
  "covid-r-estimates-india": {
    source: "National and subnational Covid-19 R estimates (test-based) Dataverse",
    url: "https://doi.org/10.7910/DVN/PLLOXR",
    entries: [
      { name: "R (reproduction number)", label: "Estimated effective reproduction number", group: "Epidemiology" },
      { name: "Test-based estimates", label: "Estimates derived from test results", group: "Method" },
      { name: "National series", label: "All-India R time series", group: "Geography" },
      { name: "Subnational series", label: "State / subnational R estimates", group: "Geography" },
      { name: "Date", label: "Calendar date of estimate", group: "Time" },
    ],
  },
  "asti-india": {
    source: "ASTI India database — agricultural R&D system indicators",
    url: "https://doi.org/10.7910/DVN/MDNRRV",
    entries: [
      { name: "Research spending", label: "Agricultural R&D expenditure indicators", group: "R&D" },
      { name: "Research staff", label: "Researcher and human-resource indicators", group: "R&D" },
      { name: "Institutional structure", label: "Public / private research system structure", group: "Institutions" },
      { name: "Country: India", label: "India-focused ASTI series", group: "Geography" },
    ],
  },
  "pratham-read-india": {
    source: "Pratham Information Project — Read India Dataverse deposit",
    url: "https://doi.org/10.7910/DVN/CHDLPN",
    entries: [
      { name: "Literacy program indicators", label: "Read India program outcome fields", group: "Education" },
      { name: "Learning measures", label: "Reading / literacy assessment items", group: "Learning" },
      { name: "Program geography", label: "Program coverage geography", group: "Geography" },
      { name: "Round / year", label: "Program wave identifiers", group: "Time" },
    ],
  },
  "india-treaty-registry": {
    source: "Nested Treaties Database: India Treaty Registry v2.0 fields",
    url: "https://doi.org/10.7910/DVN/1YHDXE",
    entries: [
      { name: "Treaty ID", label: "Treaty instrument identifier", group: "IDs" },
      { name: "Dates", label: "Signature, entry-into-force, and related dates", group: "Time" },
      { name: "Subject matter", label: "Treaty topic / subject classification", group: "Content" },
      { name: "Linkage fields", label: "Links to related instruments", group: "Relations" },
      { name: "Coverage 1948–2026", label: "Temporal span of the registry", group: "Meta" },
    ],
  },
  "india-treaty-nesting": {
    source: "Nested Treaties Database: India Nesting Dataset v1.0",
    url: "https://doi.org/10.7910/DVN/Q5WP09",
    entries: [
      { name: "Parent treaty", label: "Parent / umbrella instrument ID", group: "Relations" },
      { name: "Child treaty", label: "Nested / related instrument ID", group: "Relations" },
      { name: "Nesting type", label: "Type of nesting relationship", group: "Relations" },
      { name: "Linkage metadata", label: "Relationship attributes", group: "Meta" },
    ],
  },
  "health-survey-andhra-2013": {
    source: "Health Survey of Andhra Pradesh, India, 2013 Dataverse deposit",
    url: "https://doi.org/10.7910/DVN/26302",
    entries: [
      { name: "Household / family ID", label: "Household identifiers", group: "IDs" },
      { name: "Health status", label: "Self-reported health and morbidity", group: "Health" },
      { name: "Care utilization", label: "Health-care use fields", group: "Service" },
      { name: "Socio-economic", label: "Household background characteristics", group: "Background" },
      { name: "Andhra Pradesh", label: "State survey geography (2013)", group: "Geography" },
    ],
  },

  // ── GitHub community ────────────────────────────────────────────
  "gh-datameet-maps": {
    source: "DataMeet maps project site / repo (shapefile attributes & field docs)",
    url: "https://projects.datameet.org/maps/",
    entries: [
      { name: "Admin boundaries", label: "Country, state, district and related polygons", group: "Boundaries" },
      { name: "Electoral maps", label: "Constituency boundary layers", group: "Elections" },
      { name: "Attribute fields", label: "DBF attributes documented per project layer", group: "Attributes" },
      { name: "Geometry", label: "Shapefile geometry (shp/shx/prj)", group: "Geometry" },
      { name: "References", label: "Source and field documentation on project site", group: "Docs" },
    ],
  },
  "gh-datameet-municipal": {
    source: "DataMeet Municipal Spatial Data repo structure",
    url: "https://github.com/datameet/Municipal_Spatial_Data",
    entries: [
      { name: "Ward boundaries", label: "Municipal ward polygons", group: "Urban" },
      { name: "Municipal polygons", label: "City / municipality extents", group: "Urban" },
      { name: "City name", label: "City-level dataset partitions", group: "Geography" },
      { name: "Geometry attributes", label: "Layer attribute tables", group: "Attributes" },
    ],
  },
  "gh-india-geodata": {
    source: "india-geodata portal / release catalog (55+ India datasets)",
    url: "https://github.com/yashveeeeeeer/india-geodata",
    entries: [
      { name: "Boundaries", label: "Admin boundary layers", group: "Geospatial" },
      { name: "Census layers", label: "Census-derived spatial products", group: "Demography" },
      { name: "Electoral layers", label: "Election-related geometries", group: "Elections" },
      { name: "Environment layers", label: "Environment and land-use products", group: "Environment" },
      { name: "PMTiles / GeoJSON", label: "Delivery formats and release assets", group: "Formats" },
      { name: "Per-dataset license", label: "Asset-level license annotations on portal", group: "License" },
    ],
  },
  "gh-indian-admin-boundaries": {
    source: "ramSeraph/indian_admin_boundaries release tags (README inventory)",
    url: "https://github.com/ramSeraph/indian_admin_boundaries",
    entries: [
      { name: "States / Districts / SubDistricts", label: "Admin boundary hierarchy", group: "Admin" },
      { name: "Blocks / Panchayats / Villages", label: "Rural local-body boundaries", group: "Admin" },
      { name: "Habitations / Urban", label: "Habitation and urban extents", group: "Settlement" },
      { name: "Forests / Coastal", label: "Forest and coastal regulation layers", group: "Environment" },
      { name: "Postal / Police", label: "Postal and police jurisdiction layers", group: "Services" },
      { name: "Constituencies", label: "Electoral constituency boundaries", group: "Elections" },
      { name: "Census 2011 / Historical districts", label: "Census and historical admin layers", group: "History" },
    ],
  },
  "gh-indian-shapefiles": {
    source: "datta07/INDIAN-SHAPEFILES README coverage",
    url: "https://github.com/datta07/INDIAN-SHAPEFILES",
    entries: [
      { name: "Admin polygons", label: "State / district administrative polygons", group: "Admin" },
      { name: "Highways", label: "Highway network geometries", group: "Transport" },
      { name: "Railways", label: "Railway network geometries", group: "Transport" },
      { name: "Metros", label: "Metro network geometries", group: "Transport" },
      { name: "GeoJSON attributes", label: "Feature properties in GeoJSON files", group: "Attributes" },
    ],
  },
  "gh-india-votes-data": {
    source:
      "Scraped SCHEMA.md from thecont1/india-votes-data (rounds_ac core table + parties/states)",
    url: "https://github.com/thecont1/india-votes-data/blob/main/docs/SCHEMA.md",
    entries: [
      { name: "state_code", label: "ECI state/UT code (e.g. S11)", group: "Geography" },
      { name: "ac_no / pc_no", label: "Assembly or parliamentary constituency number", group: "Geography" },
      { name: "ac_name / pc_name", label: "Constituency name", group: "Geography" },
      { name: "round_no", label: "Counting round (time axis)", group: "Time" },
      { name: "candidate", label: "Candidate name", group: "Candidates" },
      { name: "party_abv", label: "Party abbreviation (FK to parties)", group: "Parties" },
      { name: "votes", label: "Vote count for candidate in round", group: "Results" },
      { name: "status / won", label: "Constituency lifecycle and winner flag", group: "Status" },
    ],
  },
  "gh-data-for-india": {
    source: "iaseth/data-for-india JSON reference schema",
    url: "https://github.com/iaseth/data-for-india",
    entries: [
      { name: "States", label: "State list and codes", group: "Reference" },
      { name: "Districts", label: "District list and codes", group: "Reference" },
      { name: "Lookup keys", label: "Join keys for product UIs", group: "IDs" },
      { name: "JSON records", label: "Machine-readable reference objects", group: "Format" },
    ],
  },
  "gh-colleges-api": {
    source: "PriyanKishoreMS/colleges-api README (AISHE-derived directory)",
    url: "https://github.com/PriyanKishoreMS/colleges-api",
    entries: [
      { name: "College name / ID", label: "College directory identifiers", group: "IDs" },
      { name: "Location", label: "State, district, and address fields", group: "Geography" },
      { name: "Management / type", label: "Institution management and type", group: "Structure" },
      { name: "API endpoints", label: "Query endpoints for directory search", group: "Access" },
      { name: "CSV / SQL dump", label: "Bulk download artifacts", group: "Formats" },
    ],
  },
  "gh-rural-facilities-pmgsy": {
    source: "Scraped README column list (PMGSY GODL geo-tagged facilities)",
    url: "https://github.com/pratapvardhan/rural-facilities-pmgsy",
    entries: [
      { name: "State", label: "State name", group: "Geography" },
      { name: "District", label: "District name", group: "Geography" },
      { name: "Block", label: "Block name", group: "Geography" },
      { name: "Habitation Name", label: "Habitation name", group: "Location" },
      { name: "Habitation ID", label: "Habitation identifier", group: "IDs" },
      { name: "Facility Name", label: "Name of rural facility", group: "Facility" },
      { name: "Address", label: "Facility address text", group: "Facility" },
      { name: "File Upload Date", label: "Source upload timestamp", group: "Meta" },
      { name: "Facility Category", label: "Agro / Education / Medical / Transport-Admin", group: "Category" },
      { name: "Facility Subcategory", label: "Fine-grained facility type", group: "Category" },
      { name: "Lattitude", label: "Latitude (source spelling)", group: "Geometry" },
      { name: "Longitude", label: "Longitude", group: "Geometry" },
    ],
  },
  "gh-nightlights-viirs": {
    source:
      "Scraped README output schema — district-year VIIRS panel (641 districts × 13 years)",
    url: "https://github.com/yashveeeeeeer/india-district-nightlights-viirs",
    entries: [
      { name: "district_id", label: "Census 2011 district code", group: "Geography" },
      { name: "district_name", label: "District name", group: "Geography" },
      { name: "state_name", label: "State / UT name", group: "Geography" },
      { name: "year", label: "Year (2012–2024)", group: "Time" },
      { name: "mean / median", label: "Mean and median nightlight radiance (nW/cm²/sr)", group: "Radiance" },
      { name: "sum", label: "Total radiance (economic-activity proxy)", group: "Radiance" },
      { name: "std / min / max", label: "Dispersion and extremes of pixel radiance", group: "Radiance" },
      { name: "valid_pixel_count", label: "Valid satellite pixels in district", group: "Quality" },
      { name: "log1p_mean / log1p_median", label: "Log-transformed radiance for econometrics", group: "Transforms" },
    ],
  },
  "gh-datameet-covid19": {
    source: "DataMeet covid19 project site / parsed data folders (historical)",
    url: "https://projects.datameet.org/covid19/",
    entries: [
      { name: "Cases", label: "Confirmed case counts by geography", group: "Epidemiology" },
      { name: "Deaths / recoveries", label: "Mortality and recovery series where parsed", group: "Epidemiology" },
      { name: "State / district", label: "Subnational geography keys", group: "Geography" },
      { name: "Date", label: "Observation date", group: "Time" },
      { name: "Source backups", label: "Downloaded PDF/HTML source archives", group: "Provenance" },
    ],
  },
  "gh-datameet-election-data": {
    source: "datameet/india-election-data README catalog of public election sources",
    url: "https://github.com/datameet/india-election-data",
    entries: [
      { name: "Source links", label: "Pointers to public election datasets", group: "Catalog" },
      { name: "Lok Sabha references", label: "Parliamentary election source map", group: "Elections" },
      { name: "Assembly references", label: "State assembly source map", group: "Elections" },
      { name: "License notes", label: "Per-dataset license annotations", group: "License" },
    ],
  },
  "gh-udise-schools": {
    source: "datameet/udise_schools field documentation (~14 lakh schools)",
    url: "https://github.com/datameet/udise_schools",
    entries: [
      { name: "School location", label: "Geocoded school coordinates", group: "Location" },
      { name: "UDISE code", label: "School UDISE identifier", group: "IDs" },
      { name: "School attributes", label: "School profile columns from UDISE-related extract", group: "School" },
      { name: "State / district", label: "Administrative geography", group: "Geography" },
    ],
  },
  "gh-india-maps-data": {
    source: "udit-001/india-maps-data GeoJSON/TopoJSON delivery layers",
    url: "https://github.com/udit-001/india-maps-data",
    entries: [
      { name: "State polygons", label: "State boundary GeoJSON / TopoJSON", group: "Boundaries" },
      { name: "District polygons", label: "District boundary GeoJSON / TopoJSON", group: "Boundaries" },
      { name: "Feature properties", label: "Name and id properties on features", group: "Attributes" },
      { name: "CDN links", label: "jsDelivr delivery paths for web apps", group: "Access" },
    ],
  },
  "gh-village-boundaries": {
    source: "datameet/indian_village_boundaries project docs (ODbL)",
    url: "https://github.com/datameet/indian_village_boundaries",
    entries: [
      { name: "Village polygons", label: "Village boundary geometries", group: "Boundaries" },
      { name: "Village name / code", label: "Village identity attributes", group: "Attributes" },
      { name: "State / district", label: "Parent administrative geography", group: "Geography" },
      { name: "Rural boundaries", label: "Rural cadastral / settlement extents", group: "Boundaries" },
    ],
  },

  // ── New catalog additions (research, welfare, digital) ──────────
  shrug: {
    source: "Development Data Lab SHRUG / SHRID documentation",
    url: "https://www.devdatalab.org/shrug",
    entries: [
      { name: "SHRID", label: "Socioeconomic High-resolution Rural-Urban ID", group: "IDs" },
      { name: "Village / town keys", label: "Place identifiers for merges", group: "Geography" },
      { name: "Census-linked demographics", label: "Linked population and demographic fields", group: "Demography" },
      { name: "Amenities layers", label: "Linked amenity / infrastructure fields", group: "Amenities" },
      { name: "Admin crosswalks", label: "Boundary and code crosswalk tables", group: "Crosswalks" },
    ],
  },
  "secc-2011": {
    source: "SECC 2011 portal field descriptions",
    url: "https://secc.dord.gov.in/",
    entries: [
      { name: "Deprivation criteria", label: "Household deprivation flags used for targeting", group: "Welfare" },
      { name: "Assets / housing", label: "Asset and housing condition fields", group: "Assets" },
      { name: "Landlessness", label: "Land ownership / landless markers", group: "Land" },
      { name: "Social category", label: "Caste / social group fields", group: "Social" },
      { name: "Inclusion / exclusion", label: "Automatic inclusion and exclusion criteria", group: "Targeting" },
    ],
  },
  "economic-census": {
    source: "MoSPI Economic Census product documentation",
    url: "https://www.mospi.gov.in/themes/product/55-economic-census",
    entries: [
      { name: "Establishments", label: "Count of establishments by activity", group: "Structure" },
      { name: "Employment", label: "Persons employed in establishments", group: "Labour" },
      { name: "Ownership type", label: "Ownership / organization type", group: "Structure" },
      { name: "Rural / urban", label: "Location type of establishment", group: "Geography" },
      { name: "NIC codes", label: "Industry classification codes", group: "Industry" },
    ],
  },
  "nss-microdata-catalog": {
    source: "MoSPI NADA catalog collections and study metadata",
    url: "https://microdata.gov.in/NADA/index.php/catalog",
    entries: [
      { name: "Study title / ID", label: "Catalog study identifier and title", group: "Catalog" },
      { name: "Health / morbidity rounds", label: "NSS health-topic unit studies", group: "Topics" },
      { name: "Education rounds", label: "Education and literacy survey files", group: "Topics" },
      { name: "Migration modules", label: "Migration-related schedules where available", group: "Topics" },
      { name: "Debt & investment", label: "AIDIS / debt-investment studies", group: "Topics" },
      { name: "Housing / sanitation", label: "Housing condition and WASH-related rounds", group: "Topics" },
      { name: "DDI metadata", label: "Variable and file documentation per study", group: "Docs" },
    ],
  },
  "census-tables": {
    source: "ORGI Census tables portal family index",
    url: "https://censusindia.gov.in/census.website/data/census-tables",
    entries: [
      { name: "Religion tables", label: "Population by religion", group: "Demography" },
      { name: "Language tables", label: "Mother tongue / language", group: "Demography" },
      { name: "Migration tables", label: "Migrants by place of last residence / reason", group: "Migration" },
      { name: "Workers tables", label: "Main/marginal workers and industrial categories", group: "Labour" },
      { name: "SC/ST tables", label: "Scheduled Caste and Scheduled Tribe tables", group: "Social" },
      { name: "Housing / houselisting", label: "Housing stock and houselisting amenities", group: "Housing" },
    ],
  },
  "ahs-eag": {
    source: "ICPSR AHS study 38097 documentation",
    url: "https://www.icpsr.umich.edu/web/DSDR/studies/38097",
    entries: [
      { name: "District ID", label: "District geography for EAG states", group: "Geography" },
      { name: "Fertility / mortality", label: "District vital indicators", group: "Demography" },
      { name: "Maternal care", label: "ANC, delivery, and maternal service use", group: "Maternal" },
      { name: "Child health", label: "Child health and immunization markers", group: "Child health" },
      { name: "Household characteristics", label: "Household background fields", group: "Household" },
    ],
  },
  "cnns-2016-18": {
    source: "NHM CNNS reports and biomarker documentation",
    url: "https://nhm.gov.in/index1.php?lang=1&level=2&lid=713&sublinkid=1332",
    entries: [
      { name: "Child anthropometry", label: "Height, weight, and growth indicators", group: "Nutrition" },
      { name: "Adolescent nutrition", label: "Adolescent dietary and growth measures", group: "Nutrition" },
      { name: "Micronutrients", label: "Micronutrient deficiency biomarkers", group: "Biomarkers" },
      { name: "Dietary indicators", label: "Diet diversity / intake markers", group: "Diet" },
      { name: "State estimates", label: "State-level survey estimates", group: "Geography" },
    ],
  },
  "mgnrega-mis": {
    source: "MGNREGA public MIS dashboard field language",
    url: "https://nrega.nic.in/",
    entries: [
      { name: "Job cards", label: "Registered job cards / households", group: "Registration" },
      { name: "Person-days", label: "Person-days of employment generated", group: "Employment" },
      { name: "Wages paid", label: "Wage expenditure and payments", group: "Finance" },
      { name: "Works", label: "Works sanctioned and completed", group: "Assets" },
      { name: "GP / block / district", label: "Administrative geography keys", group: "Geography" },
    ],
  },
  lgd: {
    source: "Local Government Directory code documentation",
    url: "https://lgdirectory.gov.in/",
    entries: [
      { name: "State / district codes", label: "Standard state and district LGD codes", group: "Codes" },
      { name: "Block / sub-district", label: "Intermediate rural admin units", group: "Codes" },
      { name: "GP / village codes", label: "Panchayat and village identifiers", group: "Codes" },
      { name: "ULB codes", label: "Urban local body codes", group: "Codes" },
      { name: "Hierarchy / status", label: "Parent links and active/inactive status", group: "Structure" },
    ],
  },
  "egram-swaraj": {
    source: "eGramSwaraj portal modules (plans, works, finance)",
    url: "https://www.egramswaraj.gov.in/welcome.do",
    entries: [
      { name: "Panchayat plans", label: "GP development plans", group: "Planning" },
      { name: "Works / assets", label: "Works and asset records", group: "Works" },
      { name: "Finance / payments", label: "Panchayat finance and payment status", group: "Finance" },
      { name: "Progress status", label: "Implementation progress markers", group: "Monitoring" },
      { name: "GP identifiers", label: "Panchayat geography keys", group: "Geography" },
    ],
  },
  "pmay-g": {
    source: "PMAY-G dashboard progress indicators",
    url: "https://pmayg.dord.gov.in/netiayHome/Home.aspx",
    entries: [
      { name: "Houses sanctioned", label: "Rural houses sanctioned", group: "Delivery" },
      { name: "Houses completed", label: "Rural houses completed", group: "Delivery" },
      { name: "Beneficiaries", label: "Beneficiary registration and lists", group: "Targeting" },
      { name: "Instalments", label: "Payment instalment status", group: "Finance" },
      { name: "Geo-tagged progress", label: "Stage-wise geo-tagged construction", group: "Monitoring" },
    ],
  },
  "pmay-u": {
    source: "PMAY-U portal progress indicators",
    url: "https://pmay-urban.gov.in/",
    entries: [
      { name: "Sanctioned / grounded / completed", label: "Urban housing stage counts", group: "Delivery" },
      { name: "Vertical / component", label: "Mission vertical breakdowns", group: "Structure" },
      { name: "City / ULB", label: "Urban local body geography", group: "Geography" },
      { name: "Central assistance", label: "Financial assistance indicators", group: "Finance" },
      { name: "Beneficiaries", label: "Beneficiary coverage", group: "Targeting" },
    ],
  },
  "im-pds": {
    source: "IM-PDS dashboard sale / transaction views",
    url: "https://impds.nic.in/sale",
    entries: [
      { name: "Ration cards", label: "Card counts and categories", group: "Cards" },
      { name: "ePoS transactions", label: "Fair-price shop transaction volumes", group: "Delivery" },
      { name: "Aadhaar seeding", label: "Aadhaar-linked card status", group: "KYC" },
      { name: "Foodgrain distribution", label: "Commodity distribution quantities", group: "Commodities" },
      { name: "ONORC portability", label: "Inter-state portability markers", group: "Portability" },
    ],
  },
  "poshan-tracker": {
    source: "Poshan Tracker public monitoring fields",
    url: "https://www.poshantracker.in/",
    entries: [
      { name: "AWC service delivery", label: "Anganwadi centre service markers", group: "Delivery" },
      { name: "Beneficiary coverage", label: "Registered and served beneficiaries", group: "Coverage" },
      { name: "Growth monitoring", label: "Child growth monitoring indicators", group: "Nutrition" },
      { name: "Supplementary nutrition", label: "SNP distribution / take-home ration markers", group: "Nutrition" },
      { name: "Geography keys", label: "State / district / project hierarchy", group: "Geography" },
    ],
  },
  "pm-poshan": {
    source: "PM-POSHAN school meal monitoring indicators",
    url: "https://pmposhan.education.gov.in/",
    entries: [
      { name: "Meals served", label: "Meals served counts", group: "Delivery" },
      { name: "Enrolment covered", label: "Students covered under the scheme", group: "Coverage" },
      { name: "School coverage", label: "Schools implementing PM-POSHAN", group: "Coverage" },
      { name: "Foodgrain / funds", label: "Utilization of foodgrain and funds", group: "Finance" },
      { name: "Monitoring flags", label: "Inspection and compliance markers", group: "Monitoring" },
    ],
  },
  "epfo-payroll": {
    source: "EPFO monthly payroll estimate tables",
    url: "https://www.epfindia.gov.in/site_en/Estimate_of_Payroll.php",
    entries: [
      { name: "Payroll additions", label: "Net new EPFO subscribers / payroll estimates", group: "Employment" },
      { name: "Age bands", label: "Age-group breakdown of new subscribers", group: "Demography" },
      { name: "Gender", label: "Gender breakdown where published", group: "Demography" },
      { name: "Month", label: "Reference month of estimate", group: "Time" },
      { name: "Industry notes", label: "Sectoral notes in accompanying releases", group: "Industry" },
    ],
  },
  vahan: {
    source: "VAHAN 4 dashboard dimensions",
    url: "https://vahan.parivahan.gov.in/vahan4dashboard/",
    entries: [
      { name: "Vehicle category", label: "Two-wheeler, car, commercial, etc.", group: "Vehicle" },
      { name: "Fuel type", label: "Petrol, diesel, EV, CNG, etc.", group: "Vehicle" },
      { name: "Maker / model", label: "Manufacturer and model fields", group: "Vehicle" },
      { name: "Registrations", label: "Registration counts", group: "Volume" },
      { name: "State / RTO", label: "State and RTO geography", group: "Geography" },
    ],
  },
  "trai-subscriptions": {
    source: "TRAI monthly telecom subscription report tables",
    url: "https://www.trai.gov.in/release-publication/reports/telecom-subscriptions-reports",
    entries: [
      { name: "Wireless subscribers", label: "Mobile wireless subscription totals", group: "Subscriptions" },
      { name: "Wireline subscribers", label: "Wireline subscription totals", group: "Subscriptions" },
      { name: "Broadband", label: "Broadband subscriber counts", group: "Subscriptions" },
      { name: "Tele-density", label: "Tele-density indicators", group: "Indicators" },
      { name: "Service area", label: "Telecom circle / service-area geography", group: "Geography" },
    ],
  },
  "npci-upi": {
    source: "NPCI UPI product statistics tables",
    url: "https://www.npci.org.in/product/upi/product-statistics",
    entries: [
      { name: "Volume", label: "Number of UPI transactions", group: "Payments" },
      { name: "Value", label: "Value of UPI transactions (₹)", group: "Payments" },
      { name: "Month", label: "Statistics reference month", group: "Time" },
      { name: "Product breakdowns", label: "Published product / participant tables", group: "Structure" },
      { name: "App / bank tables", label: "App and member bank statistics where listed", group: "Participants" },
    ],
  },
  pmjdy: {
    source: "PMJDY account statistics dashboard",
    url: "https://pmjdy.gov.in/account",
    entries: [
      { name: "Accounts opened", label: "Cumulative and period account counts", group: "Accounts" },
      { name: "Deposits", label: "Deposit balances under PMJDY", group: "Finance" },
      { name: "Rural / urban", label: "Rural and urban account split", group: "Geography" },
      { name: "Bank type", label: "Public / private / RRB / other bank-type split", group: "Structure" },
      { name: "RuPay / DBT flags", label: "Card and benefit-transfer related indicators", group: "Services" },
    ],
  },
  "epwrf-its": {
    source: "EPWRFITS module catalogue (subscription product)",
    url: "https://epwrfits.in/",
    entries: [
      { name: "National accounts modules", label: "Harmonized national accounts series", group: "Macro" },
      { name: "Prices / money", label: "Price and monetary series", group: "Macro" },
      { name: "Banking series", label: "Banking and financial sector series", group: "Finance" },
      { name: "State domestic product", label: "State GSDP and related series", group: "States" },
      { name: "Social sector series", label: "Selected social-sector time series", group: "Social" },
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
  const live = LIVE_VARIABLES[dataset.slug];
  if (live?.entries?.length) {
    return {
      entries: live.entries,
      source: live.source,
      url: live.url ?? dataset.variablesUrl ?? dataset.docsUrl ?? dataset.accessUrl,
    };
  }

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
