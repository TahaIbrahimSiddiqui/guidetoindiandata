import { LandingExperience } from "@/components/LandingExperience";
import { getCatalogStats } from "@/lib/catalogStats";

export default function LandingPage() {
  const stats = getCatalogStats();
  return <LandingExperience stats={stats} />;
}
