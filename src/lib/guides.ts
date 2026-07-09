import type { Dataset, GuideLink } from "@/types/dataset";
import { GUIDES_BY_SLUG } from "@/data/datasetGuides";
import { LIVE_VARIABLES } from "@/data/liveVariables";

function pushGuide(
  merged: GuideLink[],
  seen: Set<string>,
  guide: GuideLink,
): void {
  const key = guide.url.trim().toLowerCase();
  if (!key || seen.has(key)) return;
  seen.add(key);
  merged.push(guide);
}

/** Resolve usage guides for a dataset (enrichment table + record + sensible fallbacks). */
export function resolveGuides(dataset: Dataset): GuideLink[] {
  const fromTable = GUIDES_BY_SLUG[dataset.slug] ?? [];
  const fromRecord = dataset.guides ?? [];

  const merged: GuideLink[] = [];
  const seen = new Set<string>();

  for (const g of [...fromTable, ...fromRecord]) {
    pushGuide(merged, seen, g);
  }

  // Live-scraped dictionary URL (same source as the Variables table).
  const live = LIVE_VARIABLES[dataset.slug];
  if (live?.url) {
    pushGuide(merged, seen, {
      title: "Variable / data dictionary",
      url: live.url,
      kind: "codebook",
    });
  }

  if (dataset.docsUrl) {
    pushGuide(merged, seen, {
      title: "Official documentation",
      url: dataset.docsUrl,
      kind: "official",
    });
  }

  if (dataset.accessUrl) {
    pushGuide(merged, seen, {
      title: "Access portal",
      url: dataset.accessUrl,
      kind: "portal",
    });
  }

  if (dataset.variablesUrl) {
    pushGuide(merged, seen, {
      title: "Variable / data dictionary",
      url: dataset.variablesUrl,
      kind: "codebook",
    });
  }

  return merged;
}

export function guideKindLabel(kind?: GuideLink["kind"]): string {
  switch (kind) {
    case "official":
      return "Official";
    case "user-guide":
      return "User guide";
    case "codebook":
      return "Codebook";
    case "tutorial":
      return "Tutorial";
    case "video":
      return "Video";
    case "portal":
      return "Portal";
    case "report":
      return "Report";
    default:
      return "Guide";
  }
}
