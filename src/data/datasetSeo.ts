/**
 * Optional SEO fields per catalog slug (agentic SEO apply target).
 *
 * - Written by `scripts/ai-seo-assist.mjs` when AI_APPLY=true (via PR).
 * - Never used to inject content onto landing (`/`) or solar map (`/map`).
 * - Catalog dataset pages only may surface FAQ answers.
 */

export type DatasetSeoFaq = {
  question: string;
  answer: string;
};

export type DatasetSeoEntry = {
  /** SERP / OG title override (short; page template still appends site name) */
  seoTitle?: string;
  /** Meta description override */
  seoDescription?: string;
  /** FAQ for FAQPage JSON-LD + optional on-page section */
  faq?: DatasetSeoFaq[];
};

/**
 * Keyed by dataset slug. Empty until SEO assist applies proposals.
 * Seed high-traffic rows manually if desired.
 */
export const DATASET_SEO: Record<string, DatasetSeoEntry> = {
  // Example shape (commented — leave empty by default):
  // "nfhs-5": {
  //   seoTitle: "NFHS-5 microdata India",
  //   seoDescription:
  //     "NFHS-5 (2019–21): access, variables, and guides for India’s district-level health and nutrition survey.",
  //   faq: [
  //     {
  //       question: "How do you access NFHS-5 data?",
  //       answer:
  //         "NFHS microdata is typically available via the DHS Program after free registration.",
  //     },
  //   ],
  // },
};

export function getDatasetSeo(slug: string): DatasetSeoEntry | undefined {
  return DATASET_SEO[slug];
}
