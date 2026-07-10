import type { Metadata } from "next";
import { MapExperience } from "@/components/MapExperience";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Solar system map of Indian datasets—click a theme sun, then a dataset, then open the full record.",
};

export default function MapPage() {
  return <MapExperience />;
}
