import type { MetadataRoute } from "next";
import { datasets } from "@/data/datasets";
import { seriesList } from "@/data/series";
import { absoluteUrl } from "@/lib/site";

/** Required for `output: "export"` metadata routes. */
export const dynamic = "force-static";

/**
 * Build-time sitemap for static export.
 * Prioritizes catalog discovery pages; marketing entry stays listed but low-priority body content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/map"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/explore"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/clusters"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/series"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/academic"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const datasetRoutes: MetadataRoute.Sitemap = datasets.map((d) => ({
    url: absoluteUrl(`/datasets/${d.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = seriesList.map((s) => ({
    url: absoluteUrl(`/series/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...seriesRoutes, ...datasetRoutes];
}
