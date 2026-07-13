import type { Metadata } from "next";
import { LandingExperience } from "@/components/LandingExperience";
import { getCatalogStats } from "@/lib/catalogStats";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/site";

/** Head-only SEO — do not add ranking body content to the cinematic landing. */
export const metadata: Metadata = buildPageMetadata({
  title: "Find the right Indian research data",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function LandingPage() {
  const stats = getCatalogStats();
  return <LandingExperience stats={stats} />;
}
