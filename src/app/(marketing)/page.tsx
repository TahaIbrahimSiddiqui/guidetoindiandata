import type { Metadata } from "next";
import { LandingCatalogContent } from "@/components/LandingCatalogContent";
import { LandingExperience } from "@/components/LandingExperience";
import { getCatalogStats } from "@/lib/catalogStats";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Find the right Indian research data",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function LandingPage() {
  const stats = getCatalogStats();
  return (
    <LandingExperience stats={stats}>
      <LandingCatalogContent />
    </LandingExperience>
  );
}
