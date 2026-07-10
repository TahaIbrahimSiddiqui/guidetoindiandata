import type { GuideLink } from "@/types/dataset";

/**
 * Usage guides scraped / curated from official portals (DHS, MoSPI NADA,
 * IHDS, LASI, Census, CPCB, etc.). Linked on each dataset detail page.
 *
 * Sources crawled 2026-07: dhsprogram.com, microdata.gov.in, mospi.gov.in,
 * ihds.umd.edu, lasi-dad.org, iipsindia.ac.in, and host portals listed below.
 */
const g = (
  title: string,
  url: string,
  kind?: GuideLink["kind"],
): GuideLink => ({ title, url, kind });

/** Shared guide packs by family (spread into slug map). */
const DHS_GUIDES: GuideLink[] = [
  g("DHS: Getting started with datasets", "https://dhsprogram.com/data/Getting-Started.cfm", "user-guide"),
  g("DHS: Using datasets for analysis (step-by-step)", "https://dhsprogram.com/data/Using-DataSets-for-Analysis.cfm", "tutorial"),
  g("DHS: Access instructions & registration", "https://dhsprogram.com/data/Access-Instructions.cfm", "official"),
  g("Online Guide to DHS Statistics", "https://dhsprogram.com/Data/Guide-to-DHS-Statistics/index.cfm", "user-guide"),
  g("DHS recode variables & definitions", "https://dhsprogram.com/data/Data-Variables-and-Definitions.cfm", "codebook"),
  g("DHS file types & names", "https://dhsprogram.com/data/File-Types-and-Names.cfm", "tutorial"),
  g("Merging DHS datasets", "https://dhsprogram.com/data/Merging-Datasets.cfm", "tutorial"),
  g("DHS GitHub code share", "https://github.com/DHSProgram", "tutorial"),
  g("IPUMS DHS (harmonized variables)", "https://www.idhsdata.org", "portal"),
];

const MOSPI_NADA: GuideLink[] = [
  g("MoSPI National Microdata Archive (NADA)", "https://microdata.gov.in/nada43/index.php/home", "portal"),
  g("Guide to download MoSPI microdata (PDF)", "https://mospi.gov.in/sites/default/files/data_disemination/Guide_to_download_microdata.pdf", "user-guide"),
  g("MoSPI home / survey releases", "https://www.mospi.gov.in/", "portal"),
];

const PLFS_GUIDES: GuideLink[] = [
  ...MOSPI_NADA,
  g("PLFS collection catalog", "https://microdata.gov.in/NADA/index.php/catalog/PLFS", "official"),
  g("PLFS July 2023–June 2024 study page", "https://microdata.gov.in/NADA/index.php/catalog/213", "codebook"),
  g("Video: Downloading PLFS microdata & variables", "https://www.youtube.com/watch?v=xpfS9Dq2Lpw", "video"),
];

const HCES_GUIDES: GuideLink[] = [
  ...MOSPI_NADA,
  g("HCES collection (Household Consumption Expenditure)", "https://microdata.gov.in/NADA/index.php/catalog/CEXP", "official"),
  g("MoSPI: NSS unit-level extraction guides (HCES modules)", "https://www.mospi.gov.in/national-sample-survey-office", "tutorial"),
];

const ASI_GUIDES: GuideLink[] = [
  ...MOSPI_NADA,
  g("ASI collection catalog", "https://microdata.gov.in/NADA/index.php/catalog/ASI", "official"),
  g("Video: Extraction of unit-level ASI data", "https://www.youtube.com/watch?v=iWM47QkcN6w", "video"),
];

const IHDS_GUIDES: GuideLink[] = [
  g("IHDS project site & data overview", "https://ihds.umd.edu/data", "portal"),
  g("IHDS-I codebook & topic index", "https://ihds.umd.edu/ihds-1-codebook-topic-index", "codebook"),
  g("IHDS-II data page (ICPSR 36151)", "https://ihds.umd.edu/data/ihds-2", "official"),
  g("IHDS-II Data Guide (ICPSR)", "https://www.icpsr.umich.edu/web/pages/DSDR/idhs-II-data-guide.html", "user-guide"),
  g("Quick start: getting started with IHDS", "https://www.dougjohnson.in/post/getting-started-with-ihds-data/", "tutorial"),
];

const LASI_GUIDES: GuideLink[] = [
  g("LASI project page (IIPS)", "https://www.iipsindia.ac.in/lasi/", "portal"),
  g("LASI Wave 1 India report (PDF)", "https://www.iipsindia.ac.in/sites/default/files/LASI_India_Report_2020_compressed.pdf", "report"),
  g("Webinar: Introduction to LASI data", "https://www.youtube.com/watch?v=iH_hnYny9sM", "video"),
  g("Gateway to Global Aging (harmonized data)", "https://g2aging.org", "portal"),
];

const LASI_DAD_GUIDES: GuideLink[] = [
  g("LASI-DAD data download overview", "https://www.lasi-dad.org/data/overview", "official"),
  g("Gateway: get data / DUA instructions", "https://g2aging.org/harmonized-data/get-data", "user-guide"),
  g("LASI-DAD project site", "https://www.lasi-dad.org/", "portal"),
];

/**
 * Per-dataset guide links. Empty arrays are fine — resolveGuides falls back
 * to accessUrl / docsUrl on the record.
 */
export const GUIDES_BY_SLUG: Record<string, GuideLink[]> = {
  // ── NFHS / DHS ──────────────────────────────────────────────────
  "nfhs-1": [
    ...DHS_GUIDES,
    g("India Standard DHS datasets (DHS archive)", "https://dhsprogram.com/data/available-datasets.cfm", "portal"),
  ],
  "nfhs-2": [
    ...DHS_GUIDES,
    g("India Standard DHS datasets (DHS archive)", "https://dhsprogram.com/data/available-datasets.cfm", "portal"),
  ],
  "nfhs-3": [
    ...DHS_GUIDES,
    g("India Standard DHS datasets (DHS archive)", "https://dhsprogram.com/data/available-datasets.cfm", "portal"),
  ],
  "nfhs-4": [
    ...DHS_GUIDES,
    g("India Standard DHS datasets (DHS archive)", "https://dhsprogram.com/data/available-datasets.cfm", "portal"),
  ],
  "nfhs-5": [
    ...DHS_GUIDES,
    g("India Standard DHS 2019–21 dataset files", "https://dhsprogram.com/data/dataset/India_Standard-DHS_2020.cfm", "official"),
    g("World Bank Microdata Library: NFHS-5", "https://microdata.worldbank.org/index.php/catalog/4482", "codebook"),
  ],

  // ── DLHS ────────────────────────────────────────────────────────
  "dlhs-1": [
    g("GHDx / IIPS DLHS references", "https://ghdx.healthdata.org/", "portal"),
    g("IIPS publications & survey reports", "https://www.iipsindia.ac.in/", "report"),
  ],
  "dlhs-2": [
    g("GHDx DLHS-2 metadata", "https://ghdx.healthdata.org/", "portal"),
    g("IIPS survey documentation", "https://www.iipsindia.ac.in/", "report"),
  ],
  "dlhs-3": [
    g("IIPS / MoHFW DLHS documentation", "https://www.iipsindia.ac.in/", "official"),
    g("GHDx catalog search (DLHS)", "https://ghdx.healthdata.org/", "portal"),
  ],
  "dlhs-4": [
    g("GHDx DLHS-4 listing", "https://ghdx.healthdata.org/", "portal"),
    g("IIPS publications", "https://www.iipsindia.ac.in/", "report"),
  ],

  // ── Health admin ────────────────────────────────────────────────
  hmis: [
    g("HMIS portal (MoHFW)", "https://hmis.mohfw.gov.in/", "portal"),
    g("HMIS public reports & indicator tables", "https://hmis.mohfw.gov.in/", "official"),
  ],
  "srs-statistical-reports": [
    g("Census of India / ORGI publications", "https://censusindia.gov.in/", "portal"),
    g("SRS statistical reports (ORGI)", "https://censusindia.gov.in/", "report"),
  ],
  "crs-vital-statistics": [
    g("Civil Registration System reports (ORGI)", "https://censusindia.gov.in/", "report"),
    g("Census of India portal", "https://censusindia.gov.in/", "portal"),
  ],
  "lasi-wave-1": LASI_GUIDES,
  "lasi-dad": LASI_DAD_GUIDES,

  // ── Education ───────────────────────────────────────────────────
  "udise-plus": [
    g("UDISE+ portal", "https://udiseplus.gov.in/", "portal"),
    g("UDISE+ dashboard & reports", "https://dashboard.udiseplus.gov.in/", "official"),
    g("Know Your School (UDISE+)", "https://kys.udiseplus.gov.in/#/", "portal"),
    g("School GIS", "https://schoolgis.nic.in/", "portal"),
  ],
  aishe: [
    g("AISHE portal", "https://aishe.gov.in/", "portal"),
    g("AISHE reports & downloads", "https://aishe.gov.in/", "report"),
  ],
  "nas-2021": [
    g("PARAKH / NAS resources (MoE)", "https://www.education.gov.in/", "portal"),
    g("NCERT assessment publications", "https://ncert.nic.in/", "report"),
  ],
  aser: [
    g("ASER Centre — survey overview", "https://asercentre.org/aser-survey/", "official"),
    g("ASER Centre home & reports", "https://www.asercentre.org/", "portal"),
    g("ASER data access (request via contact@asercentre.org)", "https://asercentre.org/aser-survey/", "user-guide"),
  ],

  // ── Labour / consumption / firms (NSO) ──────────────────────────
  "plfs-annual-2023-24": PLFS_GUIDES,
  "plfs-quarterly-2025": [
    ...PLFS_GUIDES,
    g("PLFS calendar year 2025 study", "https://microdata.gov.in/NADA/index.php/catalog/284", "codebook"),
  ],
  "time-use-survey-2024": [
    ...MOSPI_NADA,
    g("Time Use Survey documentation (MoSPI releases)", "https://www.mospi.gov.in/", "official"),
  ],
  "hces-2022-23": HCES_GUIDES,
  "hces-2023-24": HCES_GUIDES,
  "asuse-2023-24": [
    ...MOSPI_NADA,
    g("Enterprises surveys catalog (ASUSE)", "https://microdata.gov.in/NADA/index.php/catalog/ENT", "official"),
    g("MoSPI NSS extraction guides (ASUSE)", "https://www.mospi.gov.in/national-sample-survey-office", "tutorial"),
  ],
  "asi-2023-24": ASI_GUIDES,
  "sas-ag-households-2019": [
    ...MOSPI_NADA,
    g("Situation Assessment / land & livestock surveys catalog", "https://microdata.gov.in/NADA/index.php/catalog/LLS", "official"),
  ],

  // ── IHDS / CMIE ─────────────────────────────────────────────────
  "ihds-i": [
    ...IHDS_GUIDES,
    g("ICPSR 22626 (IHDS-I)", "https://www.icpsr.umich.edu/web/DSDR/studies/22626", "portal"),
  ],
  "ihds-ii": [
    ...IHDS_GUIDES,
    g("ICPSR 36151 (IHDS-II)", "https://www.icpsr.umich.edu/web/DSDR/studies/36151", "portal"),
  ],
  "cmie-cphs": [
    g("Consumer Pyramids DX portal", "https://consumerpyramidsdx.cmie.com/", "portal"),
    g("CMIE CPHS product documentation", "https://consumerpyramidsdx.cmie.com/", "user-guide"),
  ],
  "cmie-prowessdx": [
    g("ProwessDX portal", "https://prowessdx.cmie.com/", "portal"),
    g("CMIE Prowess documentation", "https://prowessdx.cmie.com/", "user-guide"),
  ],

  // ── Macro / prices / finance ────────────────────────────────────
  "national-accounts-statistics": [
    g("MoSPI / eSankhyiki portal", "https://www.mospi.gov.in/", "portal"),
    g("National Accounts publications", "https://www.mospi.gov.in/", "report"),
  ],
  iip: [
    g("IIP catalog (NADA)", "https://microdata.gov.in/NADA/index.php/catalog/IIP", "official"),
    g("MoSPI IIP releases", "https://www.mospi.gov.in/", "report"),
  ],
  "cpi-combined": [
    g("CPI releases (MoSPI)", "https://www.mospi.gov.in/", "official"),
    g("eSankhyiki / price statistics", "https://www.mospi.gov.in/", "portal"),
  ],
  wpi: [
    g("Office of Economic Adviser — WPI", "https://eaindustry.nic.in/", "portal"),
    g("WPI data downloads", "https://eaindustry.nic.in/", "official"),
  ],
  "rbi-dbie": [
    g("RBI DBIE (Database on Indian Economy)", "https://dbie.rbi.org.in/", "portal"),
    g("RBI data download help / series browser", "https://dbie.rbi.org.in/", "user-guide"),
  ],

  // ── Agriculture ─────────────────────────────────────────────────
  "agriculture-census-2015-16": [
    g("Agriculture Census portal", "https://agcensus.nic.in/", "portal"),
    g("Agriculture Census reports & tables", "https://agcensus.nic.in/", "report"),
  ],
  "agriculture-census-2021-22": [
    g("Agriculture Census portal", "https://agcensus.nic.in/", "portal"),
    g("2021–22 operational guidelines / releases", "https://agcensus.nic.in/", "official"),
  ],
  "input-survey-2016-17": [
    g("Agriculture Census / Input Survey", "https://agcensus.nic.in/", "portal"),
    g("Input Survey manuals & schedules", "https://agcensus.nic.in/", "user-guide"),
  ],
  "input-survey-2022-23": [
    g("Agriculture Census / Input Survey", "https://agcensus.nic.in/", "portal"),
    g("Input Survey manuals & schedules", "https://agcensus.nic.in/", "user-guide"),
  ],
  "cost-of-cultivation": [
    g("DES / DACFW cost of cultivation scheme notes", "https://desagri.gov.in/", "official"),
    g("CACP / farm cost references", "https://cacp.dacnet.nic.in/", "report"),
  ],
  agmarknet: [
    g("Agmarknet portal", "https://agmarknet.gov.in/", "portal"),
    g("Commodity price & arrival search", "https://agmarknet.gov.in/", "user-guide"),
  ],
  "enam-dashboard": [
    g("eNAM portal", "https://www.enam.gov.in/", "portal"),
    g("eNAM trade / factsheets", "https://www.enam.gov.in/", "official"),
  ],
  "soil-health-card": [
    g("Soil Health Card portal", "https://www.soilhealth.dac.gov.in/", "portal"),
    g("SHC scheme documentation", "https://www.soilhealth.dac.gov.in/", "user-guide"),
  ],
  "minor-irrigation-census-6": [
    g("Open Government Data (data.gov.in)", "https://data.gov.in/", "portal"),
    g("6th Minor Irrigation Census datasets", "https://data.gov.in/", "official"),
  ],

  // ── Crime / justice / elections ─────────────────────────────────
  "crime-in-india": [
    g("NCRB publications", "https://ncrb.gov.in/", "portal"),
    g("Crime in India annual reports", "https://ncrb.gov.in/", "report"),
  ],
  "prison-statistics-india": [
    g("NCRB Prison Statistics India", "https://ncrb.gov.in/", "report"),
  ],
  adsi: [
    g("NCRB ADSI reports", "https://ncrb.gov.in/", "report"),
  ],
  njdg: [
    g("National Judicial Data Grid", "https://njdg.ecourts.gov.in/", "portal"),
    g("eCourts services documentation", "https://ecourts.gov.in/", "user-guide"),
  ],
  "eci-general-election-reports": [
    g("Election Commission of India", "https://eci.gov.in/", "portal"),
    g("Statistical reports of general elections", "https://eci.gov.in/", "report"),
  ],
  "eci-assembly-election-reports": [
    g("ECI statistical reports (assembly)", "https://eci.gov.in/", "report"),
  ],
  myneta: [
    g("MyNeta candidate affidavits", "https://myneta.info/", "portal"),
    g("ADR methodology notes", "https://adrindia.org/", "user-guide"),
  ],
  "lok-dhaba": [
    g("Lok Dhaba (TCPD)", "https://lokdhaba.ashoka.edu.in/", "portal"),
    g("TCPD documentation & data dictionary", "https://lokdhaba.ashoka.edu.in/", "codebook"),
  ],

  // ── Climate / environment / energy ──────────────────────────────
  "imd-rainfall": [
    g("IMD Pune data products", "https://www.imdpune.gov.in/", "portal"),
    g("IMD gridded rainfall downloads", "https://www.imdpune.gov.in/", "official"),
  ],
  "imd-temperature": [
    g("IMD Pune temperature products", "https://www.imdpune.gov.in/", "portal"),
  ],
  "cpcb-aqi": [
    g("CPCB CAAQMS / AQI repository", "https://airquality.cpcb.gov.in/", "portal"),
    g("CPCB air quality data download workflow", "https://airquality.cpcb.gov.in/", "user-guide"),
  ],
  "india-wris-reservoirs": [
    g("India-WRIS / NWIC portals", "https://indiawris.gov.in/", "portal"),
    g("Reservoir module documentation", "https://indiawris.gov.in/", "user-guide"),
  ],
  "cgwb-groundwater": [
    g("CGWB / WRIS groundwater monitoring", "https://indiawris.gov.in/", "portal"),
    g("CGWB publications", "https://cgwb.gov.in/", "report"),
  ],
  "cea-installed-capacity": [
    g("CEA reports & publications", "https://cea.nic.in/", "portal"),
    g("Installed capacity monthly reports", "https://cea.nic.in/", "report"),
  ],
  "npp-grid-india": [
    g("National Power Portal", "https://npp.gov.in/", "portal"),
    g("GRID-INDIA operational dashboards", "https://grid-india.in/", "portal"),
  ],
  "road-accidents-india": [
    g("MoRTH publications", "https://morth.nic.in/", "portal"),
    g("Road Accidents in India reports", "https://morth.nic.in/", "report"),
  ],
  "pmgsy-dashboard": [
    g("OMMS / PMGSY dashboard", "https://omms.nic.in/", "portal"),
    g("PMGSY mission progress reports", "https://pmgsy.nic.in/", "report"),
  ],
  "dgca-monthly-traffic": [
    g("DGCA statistics", "https://www.dgca.gov.in/", "portal"),
    g("Monthly traffic statistics PDFs", "https://www.dgca.gov.in/", "report"),
  ],
  "jjm-dashboard": [
    g("Jal Jeevan Mission dashboard", "https://ejalshakti.gov.in/jjmreport/JJMIndia.aspx", "portal"),
    g("JJM mission overview", "https://jaljeevanmission.gov.in/", "official"),
  ],
  "sbm-g-dashboard": [
    g("Swachh Bharat Mission (Grameen) dashboard", "https://sbm.gov.in/", "portal"),
    g("SBM-G ODF Plus tracking", "https://sbm.gov.in/", "user-guide"),
  ],

  // ── Census / geospatial ─────────────────────────────────────────
  "census-pca-2011": [
    g("Census of India portal", "https://censusindia.gov.in/", "portal"),
    g("Primary Census Abstract tables", "https://censusindia.gov.in/", "codebook"),
  ],
  "district-census-handbook": [
    g("District Census Handbooks (ORGI)", "https://censusindia.gov.in/", "report"),
    g("Village Directory / amenities tables", "https://censusindia.gov.in/", "codebook"),
  ],
  "census-tables": [
    g("Census tables portal (ORGI)", "https://censusindia.gov.in/census.website/data/census-tables", "portal"),
    g("Census of India home", "https://censusindia.gov.in/", "official"),
  ],
  shrug: [
    g("SHRUG / SHRID platform", "https://www.devdatalab.org/shrug", "portal"),
    g("Development Data Lab — documentation & downloads", "https://www.devdatalab.org/shrug", "user-guide"),
  ],
  "secc-2011": [
    g("SECC 2011 portal", "https://secc.dord.gov.in/", "portal"),
    g("SECC public reports / query interface", "https://secc.dord.gov.in/", "official"),
  ],
  "economic-census": [
    g("MoSPI Economic Census product page", "https://www.mospi.gov.in/themes/product/55-economic-census", "portal"),
    g("MoSPI publications home", "https://www.mospi.gov.in/", "report"),
  ],
  "nss-microdata-catalog": [
    ...MOSPI_NADA,
    g("MoSPI NADA full catalog", "https://microdata.gov.in/NADA/index.php/catalog", "portal"),
  ],
  "ahs-eag": [
    g("AHS ICPSR study page", "https://www.icpsr.umich.edu/web/DSDR/studies/38097", "portal"),
    g("ICPSR data access instructions", "https://www.icpsr.umich.edu/web/pages/ICPSR/access/index.html", "user-guide"),
  ],
  "cnns-2016-18": [
    g("NHM CNNS page", "https://nhm.gov.in/index1.php?lang=1&level=2&lid=713&sublinkid=1332", "portal"),
    g("NHM / nutrition programme resources", "https://nhm.gov.in/", "report"),
  ],
  "mgnrega-mis": [
    g("MGNREGA official portal", "https://nrega.nic.in/", "portal"),
    g("NREGA public data / MIS entry points", "https://nrega.nic.in/", "user-guide"),
  ],
  lgd: [
    g("Local Government Directory", "https://lgdirectory.gov.in/", "portal"),
    g("LGD code download / search", "https://lgdirectory.gov.in/", "user-guide"),
  ],
  "egram-swaraj": [
    g("eGramSwaraj portal", "https://www.egramswaraj.gov.in/welcome.do", "portal"),
    g("MoPR eGramSwaraj overview", "https://www.egramswaraj.gov.in/", "official"),
  ],
  "pmay-g": [
    g("PMAY-G home", "https://pmayg.dord.gov.in/netiayHome/Home.aspx", "portal"),
    g("PMAY-G reports / progress", "https://pmayg.dord.gov.in/", "report"),
  ],
  "pmay-u": [
    g("PMAY-U portal", "https://pmay-urban.gov.in/", "portal"),
    g("PMAY-U progress / dashboards", "https://pmay-urban.gov.in/", "official"),
  ],
  "im-pds": [
    g("IM-PDS sale / transaction dashboard", "https://impds.nic.in/sale", "portal"),
    g("IM-PDS / food distribution systems", "https://impds.nic.in/", "official"),
  ],
  "poshan-tracker": [
    g("Poshan Tracker", "https://www.poshantracker.in/", "portal"),
    g("Poshan Abhiyaan / MoWCD resources", "https://wcd.nic.in/", "report"),
  ],
  "pm-poshan": [
    g("PM-POSHAN portal", "https://pmposhan.education.gov.in/", "portal"),
    g("School education / mid-day meal programme pages", "https://pmposhan.education.gov.in/", "official"),
  ],
  "epfo-payroll": [
    g("EPFO estimate of payroll", "https://www.epfindia.gov.in/site_en/Estimate_of_Payroll.php", "portal"),
    g("EPFO home / publications", "https://www.epfindia.gov.in/", "report"),
  ],
  vahan: [
    g("VAHAN 4 dashboard", "https://vahan.parivahan.gov.in/vahan4dashboard/", "portal"),
    g("Parivahan / MoRTH services", "https://parivahan.gov.in/", "official"),
  ],
  "trai-subscriptions": [
    g("TRAI telecom subscriptions reports", "https://www.trai.gov.in/release-publication/reports/telecom-subscriptions-reports", "portal"),
    g("TRAI release & publications", "https://www.trai.gov.in/release-publication/reports", "report"),
  ],
  "npci-upi": [
    g("NPCI UPI product statistics", "https://www.npci.org.in/product/upi/product-statistics", "portal"),
    g("NPCI product statistics hub", "https://www.npci.org.in/", "official"),
  ],
  pmjdy: [
    g("PMJDY account statistics", "https://pmjdy.gov.in/account", "portal"),
    g("PMJDY scheme home", "https://pmjdy.gov.in/", "official"),
  ],
  "epwrf-its": [
    g("EPWRF India Time Series", "https://epwrfits.in/", "portal"),
    g("EPWRFITS subscription / modules", "https://epwrfits.in/", "user-guide"),
  ],
  "bhuvan-thematic": [
    g("Bhuvan geoportal", "https://bhuvan.nrsc.gov.in/", "portal"),
    g("Bhuvan data / OGC services help", "https://bhuvan.nrsc.gov.in/", "user-guide"),
  ],
  "wastelands-atlas-2019": [
    g("Wastelands Atlas (DoLR / NRSC)", "https://dolr.gov.in/", "report"),
    g("Bhuvan wasteland layers", "https://bhuvan.nrsc.gov.in/", "portal"),
  ],
  "geoboundaries-india": [
    g("geoBoundaries project", "https://www.geoboundaries.org/", "portal"),
    g("geoBoundaries documentation & licensing", "https://www.geoboundaries.org/", "user-guide"),
  ],
  "osm-india": [
    g("Geofabrik India extract", "https://download.geofabrik.de/asia/india.html", "portal"),
    g("OpenStreetMap wiki — India", "https://wiki.openstreetmap.org/wiki/India", "user-guide"),
    g("OSM data model / tags", "https://wiki.openstreetmap.org/wiki/Map_features", "codebook"),
  ],
  "landsat-collection-2": [
    g("USGS Landsat Collection 2 overview", "https://www.usgs.gov/landsat-missions/landsat-collection-2", "official"),
    g("Landsat product guide / band definitions", "https://www.usgs.gov/landsat-missions", "codebook"),
    g("EarthExplorer download", "https://earthexplorer.usgs.gov/", "portal"),
  ],
  "sentinel-2-l2a": [
    g("Copernicus Data Space Ecosystem", "https://dataspace.copernicus.eu/", "portal"),
    g("Sentinel-2 user guides", "https://sentinels.copernicus.eu/web/sentinel/user-guides/sentinel-2-msi", "user-guide"),
    g("Sentinel-2 Level-2A product specs", "https://sentinels.copernicus.eu/web/sentinel/technical-guides/sentinel-2-msi/level-2a/algorithm", "codebook"),
  ],

  // ── Academic Harvard Dataverse ──────────────────────────────────
  "indian-census-collection-1901-2026": [
    g("Harvard Dataverse dataset", "https://doi.org/10.7910/DVN/ON8CP8", "portal"),
    g("Dataverse user guide", "https://guides.dataverse.org/en/latest/user/index.html", "user-guide"),
  ],
  "district-pop-estimates-2020": [
    g("Harvard Dataverse dataset", "https://doi.org/10.7910/DVN/RXYJR6", "portal"),
  ],
  "electoral-criminality-2004-2009": [
    g("Harvard Dataverse dataset", "https://doi.org/10.7910/DVN/26863", "portal"),
    g("ICPSR study documentation", "https://doi.org/10.3886/ICPSR35512.v1", "codebook"),
  ],
  "access-2015": [
    g("ACCESS 2015 Dataverse", "https://doi.org/10.7910/DVN/0NV9LF", "portal"),
    g("Dataverse file & codebook browser", "https://doi.org/10.7910/DVN/0NV9LF", "codebook"),
  ],
  "access-2018": [
    g("ACCESS 2018 Dataverse", "https://doi.org/10.7910/DVN/AHFINM", "portal"),
  ],
  "ires-2020": [
    g("IRES 2020 Dataverse", "https://doi.org/10.7910/DVN/U8NYUP", "portal"),
  ],
  "gender-energy-perception-2021": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/GV85BL", "portal"),
  ],
  "tafssa-nalanda-2023": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/5MAC6B", "portal"),
  ],
  "replication-bhavnani-lee-2018": [
    g("Replication Dataverse", "https://doi.org/10.7910/DVN/TWDSBW", "portal"),
    g("Journal article", "https://doi.org/10.1086/694101", "report"),
  ],
  "replication-kapoor-magesan-2018": [
    g("APSR Dataverse package", "https://doi.org/10.7910/DVN/AJHFHU", "portal"),
    g("Journal article", "https://doi.org/10.1017/S0003055418000199", "report"),
  ],
  "replication-aklin-cheng-urpelainen-2021": [
    g("Replication Dataverse", "https://doi.org/10.7910/DVN/KBTHZH", "portal"),
    g("Journal article", "https://doi.org/10.1017/S0143814X20000045", "report"),
  ],
  "replication-dugoua-liu-urpelainen-2017": [
    g("Replication Dataverse", "https://doi.org/10.7910/DVN/K1IUNQ", "portal"),
    g("Journal article", "https://doi.org/10.1016/j.enpol.2017.03.048", "report"),
  ],
  "replication-besley-burgess-2000": [
    g("Replication Dataverse", "https://doi.org/10.7910/DVN/JWRHCK", "portal"),
    g("Journal article", "https://doi.org/10.1162/003355300554809", "report"),
  ],
  "replication-karlan-mullainathan-roth-2019": [
    g("OpenICPSR package", "https://doi.org/10.3886/E116321V1", "portal"),
    g("Journal article", "https://doi.org/10.1257/aeri.20180030", "report"),
  ],
  "replication-kyle-sampat-shadlen-2026": [
    g("Replication Dataverse", "https://doi.org/10.7910/DVN/5V5UOO", "portal"),
    g("Journal article", "https://doi.org/10.1093/haschl/qxaf239", "report"),
  ],
  "replication-stainier-shah-barreca-2026": [
    g("Replication Dataverse", "https://doi.org/10.7910/DVN/MCUQWV", "portal"),
    g("Journal article", "https://doi.org/10.1086/739115", "report"),
  ],
  "replication-adbi-agarwal-ghosh-2026": [
    g("Replication Dataverse", "https://doi.org/10.7910/DVN/0UVLWW", "portal"),
    g("Journal article", "https://doi.org/10.1086/742218", "report"),
  ],
  "india-renewable-energy-2010-2025": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/GJNVJE", "portal"),
  ],
  "covid-r-estimates-india": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/PLLOXR", "portal"),
  ],
  "asti-india": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/MDNRRV", "portal"),
  ],
  "pratham-read-india": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/CHDLPN", "portal"),
  ],
  "india-treaty-registry": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/1YHDXE", "portal"),
  ],
  "india-treaty-nesting": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/Q5WP09", "portal"),
  ],
  "health-survey-andhra-2013": [
    g("Dataverse dataset", "https://doi.org/10.7910/DVN/26302", "portal"),
  ],

  // ── GitHub community ────────────────────────────────────────────
  "gh-datameet-maps": [
    g("Repository README", "https://github.com/datameet/maps", "user-guide"),
  ],
  "gh-datameet-municipal": [
    g("Repository README", "https://github.com/datameet/Municipal_Spatial_Data", "user-guide"),
  ],
  "gh-india-geodata": [
    g("Repository README", "https://github.com/yashveeeeeeer/india-geodata", "user-guide"),
  ],
  "gh-indian-admin-boundaries": [
    g("Repository README", "https://github.com/ramSeraph/indian_admin_boundaries", "user-guide"),
  ],
  "gh-indian-shapefiles": [
    g("Repository README", "https://github.com/datta07/INDIAN-SHAPEFILES", "user-guide"),
  ],
  "gh-india-votes-data": [
    g("Repository README", "https://github.com/thecont1/india-votes-data", "user-guide"),
  ],
  "gh-data-for-india": [
    g("Repository README", "https://github.com/iaseth/data-for-india", "user-guide"),
  ],
  "gh-colleges-api": [
    g("Repository README", "https://github.com/PriyanKishoreMS/colleges-api", "user-guide"),
  ],
  "gh-rural-facilities-pmgsy": [
    g("Repository README", "https://github.com/pratapvardhan/rural-facilities-pmgsy", "user-guide"),
  ],
  "gh-nightlights-viirs": [
    g("Repository README", "https://github.com/yashveeeeeeer/india-district-nightlights-viirs", "user-guide"),
  ],
  "gh-datameet-covid19": [
    g("Repository README", "https://github.com/datameet/covid19", "user-guide"),
  ],
  "gh-datameet-election-data": [
    g("Repository README", "https://github.com/datameet/india-election-data", "user-guide"),
  ],
  "gh-udise-schools": [
    g("Repository README", "https://github.com/datameet/udise_schools", "user-guide"),
  ],
  "gh-india-maps-data": [
    g("Repository README", "https://github.com/udit-001/india-maps-data", "user-guide"),
  ],
  "gh-village-boundaries": [
    g("Repository README", "https://github.com/datameet/indian_village_boundaries", "user-guide"),
  ],

  // Trade / UN
  "un-comtrade": [
    g("Comtrade Plus portal", "https://comtradeplus.un.org/", "portal"),
    g("UN Comtrade documentation", "https://uncomtrade.org/docs/home-page/", "user-guide"),
    g("Data availability tool", "https://comtradeplus.un.org/DataAvailability", "official"),
  ],
  "wits-india": [
    g("WITS India country profile", "https://wits.worldbank.org/CountryProfile/en/IND", "portal"),
    g("WITS home / tutorials", "https://wits.worldbank.org/", "user-guide"),
  ],
  unctadstat: [
    g("UNCTADstat Data Hub", "https://unctadstat.unctad.org/", "portal"),
    g("UNCTAD statistics overview", "https://unctad.org/statistics", "official"),
  ],
  "wto-stats": [
    g("WTO Stats portal", "https://stats.wto.org/", "portal"),
    g("WTO statistics gateway", "https://www.wto.org/english/res_e/statis_e/statis_e.htm", "official"),
  ],
  "cepii-baci": [
    g("CEPII BACI database page", "https://www.cepii.fr/CEPII/en/bdd_modele/bdd_modele_item.asp?id=37", "official"),
  ],
  "dgcis-ftddp": [
    g("DGCIS FTDDP portal", "https://ftddp.dgciskol.gov.in/dgcis/", "portal"),
    g("DGCI&S home", "https://www.dgciskol.gov.in/", "official"),
  ],
  "commerce-tradestat": [
    g("Commerce TRADESTAT / EIDB", "https://tradestat.commerce.gov.in/", "portal"),
  ],
  "world-bank-wdi-india": [
    g("World Bank India data", "https://data.worldbank.org/country/india", "portal"),
    g("WDI DataBank", "https://databank.worldbank.org/source/world-development-indicators", "codebook"),
  ],
  "imf-dots": [
    g("IMF data portal", "https://data.imf.org/", "portal"),
  ],

  // Events / conflict
  "acled-india": [
    g("ACLED India country page", "https://acleddata.com/country/india", "portal"),
    g("ACLED conflict data & guides", "https://acleddata.com/conflict-data", "user-guide"),
    g("HDX India ACLED aggregates", "https://data.humdata.org/dataset/india-acled-conflict-data", "portal"),
  ],
  gdelt: [
    g("GDELT Project home", "https://www.gdeltproject.org/", "portal"),
    g("GDELT blog / docs", "https://blog.gdeltproject.org/", "user-guide"),
  ],
  "ucdp-ged": [
    g("UCDP download center", "https://ucdp.uu.se/downloads/", "portal"),
    g("UCDP main site", "https://ucdp.uu.se/", "official"),
  ],
  "gtd-terrorism": [
    g("Global Terrorism Database (START)", "https://www.start.umd.edu/gtd/", "portal"),
  ],
  "em-dat-india": [
    g("EM-DAT portal", "https://www.emdat.be/", "portal"),
  ],
  "varshney-wilkinson-riots": [
    g("ICPSR study 4342", "https://www.icpsr.umich.edu/web/ICPSR/studies/4342", "codebook"),
    g("Varshney datasets page", "https://www.ashutoshvarshney.net/datasets", "official"),
    g("DOI 10.3886/ICPSR04342", "https://doi.org/10.3886/ICPSR04342.v1", "official"),
  ],
};
