# Indian Data Guide

Public website cataloging **70+ Indian datasets** across health, education, labor, agriculture, governance, climate, and geospatial sources—based on `content/guide_research.md`.

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

## License

Research content and site code are provided for the project owner’s use. Dataset rights remain with original hosts.
