import type { Metadata } from "next";
import { MapExperience } from "@/components/MapExperience";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Head-only SEO — solar map stays a full-viewport canvas, not a content farm. */
export const metadata: Metadata = buildPageMetadata({
  title: "Solar system map of Indian datasets",
  description:
    "Interactive solar system map of Indian research datasets—click a theme sun, then a dataset, then open the full access and variables record.",
  path: "/map",
});

export default function MapPage() {
  return <MapExperience />;
}
