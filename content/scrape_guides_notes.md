# Scrape notes — dataset guides & variables

Scraped / curated **2026-07** for the Indian Data Guide catalog.

> Note: the `scrape-url` MCP plugin was not available in the agent session; content was gathered via official portal fetches and search against the same sources the skill would crawl.

## Primary sources crawled

| Host | What we took |
|------|----------------|
| [dhsprogram.com/data](https://dhsprogram.com/data/) | Getting started, analysis steps, recode variables, file types, NFHS-5 India file list |
| [microdata.gov.in](https://microdata.gov.in/nada43/index.php/home) | NADA catalog collections (PLFS, ASI, HCES/CEXP, ENT, IIP) |
| [mospi.gov.in](https://www.mospi.gov.in/) | Microdata download PDF guide; NSS extraction video links |
| [ihds.umd.edu](https://ihds.umd.edu/) | Codebooks, ICPSR data guides |
| [lasi-dad.org](https://www.lasi-dad.org/data/overview) | DUA / download instruction guide |
| [iipsindia.ac.in/lasi](https://www.iipsindia.ac.in/lasi/) | LASI Wave 1 report |
| Host portals (UDISE+, AISHE, CPCB, Census, Agmarknet, ECI, NCRB, Bhuvan, USGS, Copernicus, GitHub READMEs, Dataverse DOIs) | Access + documentation landing pages |

## Where it lives in the app

- Guides map: `src/data/datasetGuides.ts`
- Resolver: `src/lib/guides.ts` → shown on `/datasets/[slug]` as **Guides for using this data**
- Variables: `src/lib/variables.ts` → **Variables** table on each dataset page
- Type: `GuideLink` on `src/types/dataset.ts`

## Coverage

- **111 / 111** datasets resolve at least one guide link (enrichment table + access/docs fallbacks)
- **111 / 111** datasets have curated variable listings in `src/lib/variables.ts` (no keyVariable-only fallbacks)
- Sources for the final 36 academic/GitHub listings: Harvard research report tables, GitHub READMEs (e.g. PMGSY facility columns, indian_admin_boundaries release inventory, DataMeet maps project site), and Dataverse DOI landing metadata

## Live scrape refresh (2026-07 session)

### MCPs configured in `~/.grok/config.toml`

| Server | Status |
|--------|--------|
| `chrome-devtools` | **Enabled** (`npx chrome-devtools-mcp@latest`) — for browser doc inspection |
| `playwright` | Enabled |
| `kodegen` (citescrape / scrape-url) | Configured but **disabled** until `kodegen.exe` is on PATH |

### Artifacts

- `content/scrape_targets.json` — crawl targets for all 111 datasets
- `content/scraped_variables.json` — resolved variable lists + scrape overlays

### Live page scrapes this session (upgraded in `variables.ts`)

| Slug | Source scraped |
|------|----------------|
| `nfhs-5` | DHS Data Variables & Definitions |
| `plfs-annual-2023-24` | MoSPI NADA catalog/213 + data-dictionary URL |
| `plfs-quarterly-2025` | MoSPI NADA PLFS collection |
| `gh-india-votes-data` | SCHEMA.md (rounds_ac columns) |
| `gh-nightlights-viirs` | README panel column table |
| `gh-rural-facilities-pmgsy` | README “Columns include” list |

Remaining slugs keep prior ENRICHED listings (official-doc language); re-run overlays via Chrome MCP after session restart for JS-heavy portals.

### Chrome MCP session (post-restart)

Used `chrome-devtools` (slim: navigate/evaluate/screenshot) + Playwright fallback:

| Slug | Live scrape result |
|------|-------------------|
| `plfs-annual-2023-24` | Full NADA var names from `hhrv` + `perv1` (e.g. `b5pt1q5` NIC, `b5pt1q6` NCO, `b3q5` expenditure) |
| `asi-2023-24` | NADA catalog/256 blocks A–J; Block A codes `a1`–`a12`, `bonus`, `mult`, etc. |
| `hces-2023-24` | NADA catalog/237 15 level-files with case/variable counts |

Chrome tools available after session restart; Playwright used when Chrome navigate failed once.
