import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/** Required for `output: "export"` metadata routes. */
export const dynamic = "force-static";

/**
 * robots.txt for static export. Full crawl allowed; sitemap includes basePath.
 * Marketing pages stay indexable as entry points (thin UX pages are fine).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: "https://tahaibrahim.in",
  };
}
