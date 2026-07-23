# Indian Data Guide

Public website cataloging **160+ Indian datasets** (government, academic/Dataverse, and GitHub) across health, education, labor, agriculture, governance, climate, and geospatial sources—based on `content/guide_research.md` and later catalog expansions.

**Live site:** [https://tahaibrahim.in/guidetoindiandata/](https://tahaibrahim.in/guidetoindiandata/)

**Repo:** [https://github.com/TahaIbrahimSiddiqui/guidetoindiandata](https://github.com/TahaIbrahimSiddiqui/guidetoindiandata)

## Features

- **Landing page** with a cinematic entry into the catalog (no ads, no SEO body clutter)
- **Solar system map** (`/map`) interactive theme/dataset canvas (experience-first; head-only SEO)
- **Explore** search and filters (category, access, geography, cluster, institution)
- **Dataset records** with access badges, best-for / limitations, variables, FAQ, related datasets
- **Clusters** view of domain themes
- **Technical SEO**: sitemap, robots, Open Graph, JSON-LD (Dataset / FAQ / breadcrumbs)
- **Ad inventory** on catalog pages only (placeholders until AdSense IDs are set)

## Agentic SEO

Ranking work targets **catalog pages** (`/datasets/*`, `/series/*`, explore, themes). Landing and solar map stay clean—only metadata in the document head.

| Command | Purpose |
|---------|---------|
| `npm run seo:audit` | Local checks (thin copy, duplicate titles, marketing clutter guard) |
| `npm run seo:assist` | AI proposals → `content/automation/seo-assist-*.md` (needs `AI_API_KEY`) |

Apply SEO overrides into `src/data/datasetSeo.ts` only with review:

```bash
# Dry-run report only
npm run seo:assist

# Write proposals into datasetSeo.ts (still review before commit)
$env:AI_APPLY="true"; npm run seo:assist
```

After deploy, submit `https://tahaibrahim.in/guidetoindiandata/sitemap.xml` in Google Search Console.

GitHub Action **SEO assist** (`.github/workflows/seo-assist.yml`) runs monthly and on demand; set `apply_seo=true` only when you want a PR that writes `datasetSeo.ts`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Ads / monetization

Landing (`/`) never renders ad units, but the root layout always emits the
AdSense verification/Auto Ads loader in `<head>`.

Catalog routes (`/explore`, `/datasets/*`, `/clusters`, `/about`) use reserved slots via `ContentWithAds`.

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_ADS_ENABLED` | `true` to render catalog ad units |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional override; defaults to `ca-pub-5636736680811463` |
| `NEXT_PUBLIC_ADS_SLOT_*` | Optional slot IDs |

For GitHub Pages, set the same names under **Settings → Secrets and variables → Actions → Variables**. The deploy workflow also accepts them as repository secrets if you prefer.

With ads disabled, subtle placeholders keep layout stable without dominating the catalog.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- IBM Plex Sans / Mono
- Lucide icons

## Project layout

- `src/data/datasets.ts` — catalog source of truth
- `src/data/clusters.ts` — six clusters
- `src/components/ObsidianGraphFull.tsx` — landing universe graph (Obsidian-style)
- `src/components/ads/*` — monetization chrome
- `content/guide_research.md` — research source
- `.github/workflows/deploy.yml` — build + GitHub Pages
- `.github/workflows/bimonthly-catalog-refresh.yml` — scheduled audit / AI assist + PR

## Bi-monthly automation

GitHub Actions runs **Bi-monthly catalog refresh** on the 1st of odd months (Jan/Mar/May/Jul/Sep/Nov) at 06:00 UTC, and on demand via **Actions → Run workflow**.

| Step | Behavior |
|------|----------|
| Content audit | Re-checks all dataset required fields, guides, variables, access links |
| AI assist (optional) | If `AI_API_KEY` is set, drafts better summaries for thin/generic rows |
| Pull request | Opens a PR with `content/automation/*` reports (and summary edits if apply is on) |
| Site update | Merging the PR to `main` triggers the existing Pages deploy workflow |

### Secrets (repo → Settings → Secrets and variables → Actions)

| Secret | Notes |
|--------|--------|
| `AI_API_KEY` | **Dartmouth Chat** API key — [chat.dartmouth.edu](https://chat.dartmouth.edu) → Profile → Settings → Account → API Key |
| `AI_BASE_URL` | Optional; default `https://chat.dartmouth.edu/api` |

Docs: [Using the Dartmouth Chat API](https://rc.dartmouth.edu/ai/online-resources/using-the-api/)

The bi-monthly job calls Dartmouth’s OpenAI-compatible Chat Completions API (`POST /chat/completions`), auto-picks a pro-class model from `GET /models`, drafts catalog copy, and opens a PR.

List models: Actions → **List AI models**.

Manual apply of AI summaries: run workflow with **apply_ai_summaries = true** (still goes through a PR).

Local:

```bash
npm run refresh:bimonthly
# Dartmouth (default):
# $env:AI_API_KEY="your-dartmouth-key"; $env:AI_PROVIDER="dartmouth"
npm run refresh:ai
npx tsx scripts/list-ai-models.mjs
```

## License

Research content and site code are provided for the project owner’s use. Dataset rights remain with original hosts.
