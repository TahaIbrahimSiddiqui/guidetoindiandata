/**
 * Canonical site URL helpers for static export under basePath.
 * Live site: https://tahaibrahim.in/guidetoindiandata/
 *
 * SEO guardrail: marketing routes (`/`, `/map`) get head-only SEO.
 * Never dump ranking content into LandingExperience or MapExperience.
 */

export const SITE_ORIGIN = "https://tahaibrahim.in";

export const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "/guidetoindiandata";

export const SITE_NAME = "Indian Data Guide";

export const SITE_DESCRIPTION =
  "India’s research data, mapped as a solar system—click a theme sun, open a dataset, and get honest access, guides, and variables.";

/** metadataBase for Next.js Metadata API (includes basePath). */
export const metadataBase = new URL(
  `${SITE_ORIGIN}${BASE_PATH.endsWith("/") ? BASE_PATH.slice(0, -1) : BASE_PATH}/`,
);

/**
 * Absolute public URL for a site path.
 * @param path - App path without basePath, e.g. `/datasets/nfhs-5` or `/`
 */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const joined = `${BASE_PATH}${normalized === "/" ? "/" : normalized}`.replace(
    /\/{2,}/g,
    "/",
  );
  // next.config trailingSlash: true
  const withSlash =
    joined.endsWith("/") || /\.[a-z0-9]+$/i.test(joined)
      ? joined
      : `${joined}/`;
  return `${SITE_ORIGIN}${withSlash}`;
}

export const siteConfig = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  origin: SITE_ORIGIN,
  basePath: BASE_PATH,
  url: absoluteUrl("/"),
  locale: "en_IN",
} as const;
