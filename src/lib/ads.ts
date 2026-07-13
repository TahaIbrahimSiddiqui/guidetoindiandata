export type AdFormat = "leaderboard" | "rectangle" | "skyscraper" | "fluid";

export const ADS_ENABLED =
  process.env.NEXT_PUBLIC_ADS_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_ADS_ENABLED === "1";

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export function isAdsenseSlotId(slotId: string) {
  return /^\d{6,}$/.test(slotId.trim());
}

function envOrDefault(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export const AD_SLOT_IDS = {
  topBanner: envOrDefault(process.env.NEXT_PUBLIC_ADS_SLOT_TOP, "top-banner"),
  sidebar: envOrDefault(process.env.NEXT_PUBLIC_ADS_SLOT_SIDEBAR, "sidebar"),
  inContent: envOrDefault(
    process.env.NEXT_PUBLIC_ADS_SLOT_IN_CONTENT,
    "in-content",
  ),
  bottomBanner: envOrDefault(
    process.env.NEXT_PUBLIC_ADS_SLOT_BOTTOM,
    "bottom-banner",
  ),
} as const;

export const AD_FORMAT_STYLES: Record<
  AdFormat,
  { minHeight: string; label: string }
> = {
  leaderboard: { minHeight: "90px", label: "Leaderboard" },
  rectangle: { minHeight: "250px", label: "Rectangle" },
  skyscraper: { minHeight: "600px", label: "Skyscraper" },
  fluid: { minHeight: "120px", label: "Fluid" },
};
