"use client";

import { useEffect, useRef } from "react";
import {
  ADS_ENABLED,
  ADSENSE_CLIENT,
  AD_FORMAT_STYLES,
  isAdsenseSlotId,
  type AdFormat,
} from "@/lib/ads";

type AdSlotProps = {
  slotId: string;
  format?: AdFormat;
  className?: string;
};

const DISABLED_AD_HEIGHTS: Record<AdFormat, string> = {
  leaderboard: "64px",
  rectangle: "120px",
  skyscraper: "320px",
  fluid: "72px",
};

export function AdSlot({
  slotId,
  format = "leaderboard",
  className = "",
}: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const { minHeight, label } = AD_FORMAT_STYLES[format];
  const normalizedSlotId = slotId.trim();
  const canRenderNetwork =
    ADS_ENABLED && Boolean(ADSENSE_CLIENT) && isAdsenseSlotId(normalizedSlotId);
  const displayMinHeight = canRenderNetwork
    ? minHeight
    : DISABLED_AD_HEIGHTS[format];

  useEffect(() => {
    if (!canRenderNetwork || !ref.current) return;
    try {
      // @ts-expect-error adsbygoogle global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore when network not ready
    }
  }, [canRenderNetwork, slotId]);

  if (canRenderNetwork) {
    return (
      <div
        className={`ad-slot overflow-hidden rounded-xl border border-obsidian-border bg-obsidian-panel/50 ${className}`}
        style={{ minHeight: displayMinHeight }}
        data-ad-slot={slotId}
      >
        <ins
          ref={ref}
          className="adsbygoogle block"
          style={{ display: "block", minHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={normalizedSlotId}
          data-ad-format={format === "fluid" ? "fluid" : "auto"}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div
      className={`ad-slot flex flex-col items-center justify-center rounded-md border border-dashed border-obsidian-border/70 bg-obsidian-panel/12 opacity-75 ${className}`}
      style={{ minHeight: displayMinHeight }}
      data-ad-slot={slotId}
      aria-label="Advertisement placeholder"
    >
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D3D4C0]/35">
        Advertisement
      </span>
      <span className="mt-1 text-[11px] text-[#D3D4C0]/25">
        {label} · slot `{slotId}`
      </span>
    </div>
  );
}
