# Indian Data Guide

Public website cataloging **160+ Indian datasets** (government, academic/Dataverse, and GitHub) across health, education, labor, agriculture, governance, climate, and geospatial sources—based on `content/guide_research.md` and later catalog expansions.

**Live site:** [https://TahaIbrahimSiddiqui.github.io/guidetoindiandata/](https://TahaIbrahimSiddiqui.github.io/guidetoindiandata/)

**Repo:** [https://github.com/TahaIbrahimSiddiqui/guidetoindiandata](https://github.com/TahaIbrahimSiddiqui/guidetoindiandata)

## Features

- **Landing page** with an interactive Obsidian-style universe graph of data clusters (no ads)
- **Explore** search and filters (category, access, geography, cluster, institution)
- **Dataset records** with access badges, best-for / limitations, variables, related datasets
- **Clusters** view of the six ecosystem groups
- **Ad inventory** on all non-landing pages (placeholders until AdSense IDs are set)

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

Landing (`/`) never loads ad units.

Catalog routes (`/explore`, `/datasets/*`, `/clusters`, `/about`) use reserved slots via `ContentWithAds`.

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_ADS_ENABLED` | `true` to load AdSense |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-…` |
| `NEXT_PUBLIC_ADS_SLOT_*` | Optional slot IDs |

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

### Secrets to add (repo → Settings → Secrets and variables → Actions)

| Secret | Required | Notes |
|--------|----------|--------|
| `GEMINI_API_KEY` (or `GOOGLE_API_KEY` / `AI_API_KEY`) | for AI | [Google AI Studio](https://aistudio.google.com/apikey) Gemini API key |
| `AI_MODEL` | no | Default **`gemini-2.5-pro`** with **Google Search** grounding |
| `AI_PROVIDER` | no | Default `google` |
| `AI_BASE_URL` | no | Only if using an OpenAI-compatible provider |

The bi-monthly job uses **Gemini Pro + Google Search** to verify hosts/access tips and improve thin catalog copy, then opens a PR.

Manual apply of AI summaries: run workflow with **apply_ai_summaries = true** (still goes through a PR).

Local:

```bash
npm run refresh:bimonthly
# Gemini + Google Search (default):
# $env:AI_API_KEY="your-gemini-key"; $env:AI_PROVIDER="google"; $env:AI_MODEL="gemini-2.5-pro"
npm run refresh:ai
```

## License

Research content and site code are provided for the project owner’s use. Dataset rights remain with original hosts.
