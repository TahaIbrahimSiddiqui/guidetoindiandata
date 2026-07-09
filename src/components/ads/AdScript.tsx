"use client";

import Script from "next/script";
import { ADS_ENABLED, ADSENSE_CLIENT } from "@/lib/ads";

export function AdScript() {
  if (!ADS_ENABLED || !ADSENSE_CLIENT) return null;

  return (
    <Script
      id="adsense-script"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
