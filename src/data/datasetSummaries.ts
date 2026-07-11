/**
 * Plain-language research-purpose lines for every catalog slug.
 * Attached onto Dataset records in datasets.ts so cards/detail pages can
 * show “what this is used for” without bloating each object mid-edit.
 */
export const DATASET_SUMMARIES: Record<string, string> = {
  // ── Health & demography ─────────────────────────────────────────
  "nfhs-1":
    "NFHS-1 is used to study India’s early-1990s fertility, family planning, and maternal-child health baseline.",
  "nfhs-2":
    "NFHS-2 is used to study reproductive and child health and nutrition in the late 1990s.",
  "nfhs-3":
    "NFHS-3 is used to study fertility, nutrition, women’s status, and HIV-related indicators in the mid-2000s.",
  "nfhs-4":
    "NFHS-4 is used to study district-level health, nutrition, and household living conditions before NFHS-5.",
  "nfhs-5":
    "NFHS-5 is used to study household health, fertility, nutrition, and biomarkers at state and district level.",
  "dlhs-1":
    "DLHS-1 is used to study district-level reproductive and child health programme performance in the late 1990s.",
  "dlhs-2":
    "DLHS-2 is used to study district RCH service use and outcomes in the early 2000s.",
  "dlhs-3":
    "DLHS-3 is used to study district maternal and child health around the NRHM expansion period.",
  "dlhs-4":
    "DLHS-4 is used to study district health and facility-linked RCH measures just before NFHS-4.",
  hmis:
    "HMIS is used to track routine health facility reporting—service delivery, stocks, and infrastructure.",
  "srs-statistical-reports":
    "SRS reports are used to measure official fertility and mortality rates (CBR, CDR, IMR) for states.",
  "crs-vital-statistics":
    "CRS vital statistics are used to study registered births and deaths and civil-registration completeness.",
  "lasi-wave-1":
    "LASI is used to study aging, health, work, and family support among older adults in India.",
  "lasi-dad":
    "LASI-DAD is used to study dementia, cognition, and geriatric health in a LASI older-adult subsample.",
  "ahs-eag":
    "AHS is used to study district health in Empowered Action Group states between DLHS and NFHS district eras.",
  "cnns-2016-18":
    "CNNS is used to study child and adolescent nutrition, growth, and micronutrient deficiencies.",

  // ── Education ───────────────────────────────────────────────────
  "udise-plus":
    "UDISE+ is used to map India’s school system—enrolment, teachers, infrastructure, and school profiles.",
  aishe:
    "AISHE is used to study higher-education institutions, enrolment, teachers, and programme capacity.",
  "nas-2021":
    "NAS is used to measure student learning outcomes and school/teacher context at district scale.",
  aser:
    "ASER is used to study rural children’s foundational reading and arithmetic outside formal exams.",
  "pm-poshan":
    "PM-POSHAN is used to monitor mid-day meal / school meal coverage, meals served, and programme delivery.",

  // ── Labour, firms, consumption ──────────────────────────────────
  "plfs-annual-2023-24":
    "PLFS is used to measure India’s labour force—employment, unemployment, wages, and industry of work.",
  "plfs-quarterly-2025":
    "PLFS quarterly/calendar releases are used to track short-term labour-market turning points.",
  "time-use-survey-2024":
    "The Time Use Survey is used to study paid work, unpaid care, domestic work, learning, and leisure.",
  "hces-2022-23":
    "HCES is used to measure household consumption, MPCE, and living standards after the long CES gap.",
  "hces-2023-24":
    "HCES 2023–24 is used to study household consumption, poverty analysis, and CPI weight inputs.",
  "ihds-i":
    "IHDS-I is used for multi-topic household research on health, education, work, caste, and assets.",
  "ihds-ii":
    "IHDS-II is used for panel research linking households from IHDS-I across income, programmes, and wellbeing.",
  "cmie-cphs":
    "CMIE CPHS is used for high-frequency private household panel research on jobs, income, and consumption.",
  "cmie-prowessdx":
    "CMIE Prowess is used to study listed and large-company financials, ratios, and corporate events.",
  "asuse-2023-24":
    "ASUSE is used to study India’s unincorporated non-farm sector—informal enterprises, employment, and receipts.",
  "asi-2023-24":
    "ASI is used to study organized manufacturing—factory output, employment, costs, and value added.",
  "economic-census":
    "The Economic Census is used to map the universe of establishments and employment outside pure farm activity.",
  "epfo-payroll":
    "EPFO payroll estimates are used to track monthly formal employment additions in the EPFO universe.",

  // ── Macro & finance ─────────────────────────────────────────────
  "national-accounts-statistics":
    "National Accounts are used to study GDP, GVA, and the structure of India’s macroeconomy.",
  iip: "IIP is used to track short-run industrial production growth by industry and use-based categories.",
  "cpi-combined":
    "CPI Combined is used to measure consumer price inflation for rural, urban, and all-India series.",
  wpi: "WPI is used to track wholesale/producer price inflation by commodity groups.",
  "rbi-dbie":
    "RBI DBIE is used as a reference library of macro-financial time series for banking, markets, and the real sector.",
  "epwrf-its":
    "EPWRFITS is used for harmonized long-run macro and state time series under a paid research subscription.",
  pmjdy:
    "PMJDY is used to track financial inclusion—Jan Dhan accounts, deposits, and rural/urban bank outreach.",
  "npci-upi":
    "NPCI UPI statistics are used to study digital payments volume and value month by month.",
  "trai-subscriptions":
    "TRAI subscription reports are used to measure mobile, broadband, and tele-density by service area.",

  // ── Agriculture & rural ─────────────────────────────────────────
  "agriculture-census-2015-16":
    "The Agriculture Census is used to study operational holdings, farm size, irrigation, and land structure.",
  "agriculture-census-2021-22":
    "Agriculture Census 2021–22 is used to update farm-structure and holding statistics for the latest cycle.",
  "input-survey-2016-17":
    "The Input Survey is used to study fertilizer, seed, pesticide, and other input use on operational holdings.",
  "input-survey-2022-23":
    "Input Survey 2022–23 is used to measure recent agricultural input use and practices by holders.",
  "sas-ag-households-2019":
    "SAS is used to study agricultural household income, debt, assets, technology, and scheme access.",
  "cost-of-cultivation":
    "Cost of cultivation data are used to study crop-wise farm costs, returns, and price-policy analysis.",
  agmarknet:
    "Agmarknet is used to track mandi arrivals and prices for agricultural commodities across markets.",
  "enam-dashboard":
    "eNAM is used to monitor online agricultural market trade and market integration indicators.",
  "soil-health-card":
    "Soil Health Card data are used to study soil nutrient status and fertilizer recommendations.",
  "minor-irrigation-census-6":
    "The Minor Irrigation Census is used to inventory groundwater and surface minor-irrigation structures.",
  "mgnrega-mis":
    "MGNREGA MIS is used to track rural employment guarantee—job cards, works, person-days, and wages.",
  "egram-swaraj":
    "eGramSwaraj is used to track panchayat plans, works, finance, and payments in rural local government.",
  "pmay-g":
    "PMAY-G is used to track rural housing delivery—sanctions, completions, and beneficiary progress.",
  "jjm-dashboard":
    "JJM is used to track rural household tap-water connections and Har Ghar Jal progress.",
  "sbm-g-dashboard":
    "SBM-G is used to track rural sanitation coverage and ODF-Plus verification status.",
  "pmgsy-dashboard":
    "PMGSY is used to track rural all-weather road connectivity, km built, and habitation coverage.",

  // ── Crime, justice, elections ───────────────────────────────────
  "crime-in-india":
    "Crime in India is used to study police-recorded crime counts and rates published by NCRB.",
  "prison-statistics-india":
    "Prison Statistics India is used to study prison populations, capacity, and inmate characteristics.",
  adsi: "ADSI is used to study accidental deaths and suicides reported in official NCRB statistics.",
  njdg: "NJDG is used to track court caseloads, pendency, and disposal in the eCourts system.",
  "eci-general-election-reports":
    "ECI general-election reports are used to study Lok Sabha results, turnout, and party performance.",
  "eci-assembly-election-reports":
    "ECI assembly reports are used to study Vidhan Sabha election outcomes and state-level politics.",
  myneta:
    "MyNeta is used to study candidate assets, liabilities, education, and criminal-case disclosures.",
  "lok-dhaba":
    "Lok Dhaba is used for long-run research on Lok Sabha and Vidhan Sabha election results and careers.",

  // ── Climate, energy, transport ───────────────────────────────────
  "imd-rainfall":
    "IMD rainfall products are used to study precipitation patterns, monsoons, and climate variability.",
  "imd-temperature":
    "IMD temperature products are used to study heat, cold, and long-run temperature change.",
  "cpcb-aqi":
    "CPCB AQI data are used to track ambient air quality and pollution at monitoring stations.",
  "india-wris-reservoirs":
    "India-WRIS reservoir data are used to track storage levels and water availability in major reservoirs.",
  "cgwb-groundwater":
    "CGWB groundwater data are used to study water-table levels and aquifer monitoring.",
  "cea-installed-capacity":
    "CEA capacity data are used to track installed power generation capacity by fuel and sector.",
  "npp-grid-india":
    "NPP / GRID-INDIA feeds are used to monitor grid operations and power-system status.",
  "road-accidents-india":
    "Road Accidents in India is used to study crash counts, fatalities, and road-safety trends.",
  "dgca-monthly-traffic":
    "DGCA traffic stats are used to track domestic aviation passengers, freight, and carrier activity.",
  vahan:
    "VAHAN is used to study vehicle registrations by state, RTO, fuel type, maker, and category—including EV uptake.",

  // ── Census, geospatial, admin codes ─────────────────────────────
  "census-pca-2011":
    "Census PCA 2011 is used as the small-area demographic base layer for population, literacy, and workers.",
  "district-census-handbook":
    "DCHB / Village Directory is used to study village amenities, infrastructure, and settlement characteristics.",
  "census-tables":
    "Census table families are used for religion, language, migration, SC/ST, workers, and housing statistics beyond PCA.",
  "secc-2011":
    "SECC 2011 is used to study household deprivation, assets, landlessness, and welfare targeting criteria.",
  shrug:
    "SHRUG/SHRID is used to link village and town data across surveys and censuses on a common research geography key.",
  lgd: "LGD is used to match changing administrative codes for states, districts, blocks, panchayats, and local bodies.",
  "nss-microdata-catalog":
    "The MoSPI NADA catalog is used to discover NSS/NSO microdata beyond PLFS/HCES—health, education, migration, debt, and more.",
  "bhuvan-thematic":
    "Bhuvan thematic layers are used for GIS work on land use, hydrology, hazards, and other spatial themes.",
  "wastelands-atlas-2019":
    "The Wastelands Atlas is used to map wasteland categories and land-degradation related classes.",
  "geoboundaries-india":
    "geoBoundaries India extracts are used for open administrative boundary polygons in mapping workflows.",
  "osm-india":
    "OpenStreetMap India extracts are used for roads, POIs, and community-mapped features.",
  "landsat-collection-2":
    "Landsat Collection 2 is used for multi-decadal optical remote sensing of land cover and change.",
  "sentinel-2-l2a":
    "Sentinel-2 L2A is used for high-resolution optical monitoring of land, vegetation, and urban change.",

  // ── Welfare / nutrition delivery ────────────────────────────────
  "pmay-u":
    "PMAY-U is used to track urban housing mission delivery by city and component.",
  "im-pds":
    "IM-PDS / ONORC is used to track ration cards, ePoS transactions, Aadhaar seeding, and foodgrain delivery.",
  "poshan-tracker":
    "Poshan Tracker is used to monitor Anganwadi/ICDS service delivery and nutrition programme activity.",

  // ── Trade & international ───────────────────────────────────────
  "un-comtrade":
    "UN Comtrade is used to study international merchandise trade flows by partner and product.",
  "wits-india":
    "WITS India is used to analyze trade, tariffs, and protection indicators built on Comtrade/TRAINS.",
  unctadstat:
    "UNCTADstat is used for international trade and development indicators with India country extracts.",
  "wto-stats":
    "WTO Stats is used for multilateral trade and tariff statistics relevant to India’s commitments.",
  "cepii-baci":
    "CEPII BACI is used for cleaned bilateral trade-value research datasets at product level.",
  "dgcis-ftddp":
    "DGCIS foreign-trade data are used for official Indian export/import statistics by commodity and country.",
  "commerce-tradestat":
    "Commerce TradeStat is used for ministry trade dashboards and published India trade statistics.",
  "world-bank-wdi-india":
    "World Bank WDI (India) is used for comparable development indicators alongside national series.",
  "imf-dots":
    "IMF DOTS is used to study bilateral trade values in the IMF Direction of Trade Statistics.",
  "acled-india":
    "ACLED India is used to study political violence, protests, and conflict events at subnational level.",
  gdelt:
    "GDELT is used for large-scale event and media-tone research with India-filtered extracts.",
  "ucdp-ged":
    "UCDP GED is used to study organized violence events with geographic coordinates.",
  "gtd-terrorism":
    "GTD is used to study terrorism incidents, targets, and tactics with India as a major country case.",
  "em-dat-india":
    "EM-DAT is used to study disaster events—floods, cyclones, droughts, quakes—with India filters.",

  // ── Academic / Dataverse ────────────────────────────────────────
  "indian-census-collection-1901-2026":
    "This collection is used for long-run subnational census and administrative population research (1901–2026).",
  "district-pop-estimates-2020":
    "These estimates are used for 2020 district and parliamentary-constituency population denominators.",
  "electoral-criminality-2004-2009":
    "This dataset is used to study candidate criminality and electoral outcomes in 2000s India elections.",
  "access-2015":
    "ACCESS 2015 is used to study household energy access and related living-standard measures.",
  "access-2018":
    "ACCESS 2018 is used to study later-wave household energy access and energy-use patterns.",
  "ires-2020":
    "IRES 2020 is used to study residential energy use, appliances, and related household energy behavior.",
  "gender-energy-perception-2021":
    "This survey is used to study gender differences in energy perceptions and household energy roles.",
  "tafssa-nalanda-2023":
    "TAFSSA Nalanda is used to study agri-food systems, diets, and livelihoods in a local research setting.",
  "replication-bhavnani-lee-2018":
    "This replication package is used to reproduce Bhavnani & Lee (2018) political-economy results on India.",
  "replication-kapoor-magesan-2018":
    "This package is used to reproduce Kapoor & Magesan (2018) findings on Indian elections/politics.",
  "replication-aklin-cheng-urpelainen-2021":
    "This package is used to reproduce research on energy policy and political economy in India.",
  "replication-dugoua-liu-urpelainen-2017":
    "This package is used to reproduce Dugoua, Liu & Urpelainen (2017) energy/environment findings.",
  "replication-besley-burgess-2000":
    "This package is used to reproduce Besley & Burgess (2000) on media, politics, and government responsiveness in India.",
  "replication-karlan-mullainathan-roth-2019":
    "This package is used to reproduce experimental results on debt and financial behavior in India.",
  "replication-kyle-sampat-shadlen-2026":
    "This package is used to reproduce research on health, IP, or related policy using Indian data.",
  "replication-stainier-shah-barreca-2026":
    "This package is used to reproduce climate–health research findings involving Indian settings.",
  "replication-adbi-agarwal-ghosh-2026":
    "This package is used to reproduce education or human-capital research findings for India.",
  "india-renewable-energy-2010-2025":
    "This dataset is used to study solar and wind capacity, costs, and policy change in India over time.",
  "covid-r-estimates-india":
    "These estimates are used to study COVID-19 transmission (R) dynamics across Indian geographies.",
  "asti-india":
    "ASTI India is used to study agricultural R&D investment and research system indicators.",
  "pratham-read-india":
    "Pratham Read India materials are used to study foundational literacy interventions and learning programmes.",
  "india-treaty-registry":
    "The treaty registry is used to study India’s international agreements and treaty commitments.",
  "india-treaty-nesting":
    "Treaty-nesting data are used to study how India’s agreements relate and overlap in institutional design.",
  "health-survey-andhra-2013":
    "This survey is used to study health and related outcomes in Andhra Pradesh around 2013.",
  "varshney-wilkinson-riots":
    "Varshney–Wilkinson data are used to study communal riots and Hindu–Muslim violence in India.",

  // ── GitHub / community ──────────────────────────────────────────
  "gh-datameet-maps":
    "DataMeet maps are used for open India administrative and electoral boundary GIS layers.",
  "gh-datameet-municipal":
    "DataMeet municipal data are used for city/local-body geospatial and civic mapping projects.",
  "gh-india-geodata":
    "india-geodata is used as a modern packaged collection of India geospatial and related open datasets.",
  "gh-indian-admin-boundaries":
    "This repo is used for machine-readable Indian administrative boundary files for mapping and joins.",
  "gh-indian-shapefiles":
    "INDIAN-SHAPEFILES is used as a convenient shapefile pack of Indian admin and related boundaries.",
  "gh-india-votes-data":
    "india-votes-data is used for cleaned ECI election results in CSV/SQLite-friendly formats.",
  "gh-data-for-india":
    "data-for-india is used as a curated index of useful India datasets for analysts and builders.",
  "gh-colleges-api":
    "colleges-api is used to access structured data on Indian colleges for education tooling.",
  "gh-rural-facilities-pmgsy":
    "This PMGSY facilities pack is used to map geo-tagged rural agro, education, medical, and admin facilities.",
  "gh-nightlights-viirs":
    "District night-lights panels are used as economic-activity proxies from VIIRS radiance.",
  "gh-datameet-covid19":
    "DataMeet COVID-19 archives are used for historical state/district case and related COVID research.",
  "gh-datameet-election-data":
    "DataMeet election-data docs are used to discover and navigate public Indian election data sources.",
  "gh-udise-schools":
    "udise_schools is used for geocoded school locations and attributes derived from UDISE-related sources.",
  "gh-india-maps-data":
    "india-maps-data is used for ready GeoJSON/TopoJSON state and district boundaries in web maps.",
  "gh-village-boundaries":
    "indian_village_boundaries is used for village-level polygon boundaries in rural GIS analysis.",

  // ── 2026 expansion: state / academic / TCPD / hubs ──────────────
  "india-state-district-evolution-1872-2025":
    "ISDED is used to track how Indian states and districts changed boundaries from the colonial era through 2025 for long panel joins.",
  "british-provinces-districts":
    "This dataset is used to reconstruct British provinces and districts and link them to modern administrative units.",
  "princely-states-1939":
    "The 1939 princely-states inventory is used to study indirect rule, salute states, and pre-integration political geography.",
  "chair-district-pm25-2008-2020":
    "CHAIR district PM2.5 is used for annual modeled particulate exposure at district scale for health and environment research.",
  "telehealth-bihar-saran-baseline":
    "This Bihar (Saran) baseline is used to study rural telehealth access, providers, and households in an experimental sample.",
  "karnataka-agrobiodiversity-bijapur":
    "The Karnataka ABD survey is used to measure on-farm and wild species diversity, diets, and seed systems in Bijapur villages.",
  "fpwatch-india-2016":
    "FP Watch India 2016 is used to study family-planning product availability and outlet readiness in Bihar and Uttar Pradesh.",
  "jharkhand-birth-spacing-2008":
    "This Jharkhand endline is used to evaluate rural birth-spacing programme outcomes in selected districts.",
  "lse-indian-states-eopp":
    "LSE EOPP Indian States Data are used for classic 16-state panels on land reform, media, labour regulation, and public finance.",
  "india-agriculture-climate-district":
    "The Sanghi district agriculture–climate panel is used to study climate sensitivity of Indian crop production and prices.",
  "gh-tcpd-ppi":
    "TCPD-PPI is used to assign stable party IDs across renames for Indian national and assembly election research.",
  "gh-tcpd-ied-1951-62":
    "TCPD early election files are used for constituency results in the first decade of independent India.",
  "gh-tcpd-rajya-sabha":
    "TCPD Rajya Sabha data are used to study upper-house membership, parties, and state representation over time.",
  "gh-tcpd-judiciary":
    "TCPD judiciary releases are used for structured court and case-related research complementary to NJDG dashboards.",
  "gh-indian-cadastrals":
    "indian_cadastrals is used for multi-state parcel and cadastral geometries in land and local GIS work.",
  "kerala-ogd-portal":
    "Kerala OGD is used as the state open-data hub for department-published tables, APIs, and civic datasets.",
  "data-gov-in-hub":
    "data.gov.in is used as India’s national open-data catalogue entry point across ministries and linked state portals.",
  "niti-for-states-data":
    "NITI for States is used to browse comparative state–district development indicators assembled for policy users.",
};
// END_DATASET_SUMMARIES
