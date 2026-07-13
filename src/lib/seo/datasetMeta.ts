import { ACCESS_LABELS } from "@/lib/access";
import { getDatasetSeo } from "@/data/datasetSeo";
import { clampDescription } from "@/lib/seo/metadata";
import type { Dataset } from "@/types/dataset";

/** Build SERP title for a dataset (no site name suffix — template adds it). */
export function datasetSeoTitle(dataset: Dataset): string {
  const override = getDatasetSeo(dataset.slug)?.seoTitle?.trim();
  if (override) return override;
  return `${dataset.shortTitle} data India`;
}

/** Build meta description from SEO override or catalog fields. */
export function datasetSeoDescription(dataset: Dataset): string {
  const override = getDatasetSeo(dataset.slug)?.seoDescription?.trim();
  if (override) return clampDescription(override);

  const access = ACCESS_LABELS[dataset.accessType] ?? dataset.accessType;
  const geo = dataset.geographyLevel
    .map((g) => g.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  const base =
    dataset.summary?.trim() ||
    dataset.bestFor?.trim() ||
    `${dataset.shortTitle} Indian dataset for research.`;
  const parts = [base];
  if (access) parts.push(`Access: ${access}.`);
  if (geo) parts.push(`Coverage: ${geo}.`);
  return clampDescription(parts.join(" "));
}

/**
 * FAQ items: agent-written first, else honest defaults from catalog fields.
 * Used on catalog dataset pages only (not landing/map).
 */
export function datasetFaqs(
  dataset: Dataset,
): { question: string; answer: string }[] {
  const fromSeo = getDatasetSeo(dataset.slug)?.faq;
  if (fromSeo && fromSeo.length > 0) {
    return fromSeo
      .filter((f) => f.question?.trim() && f.answer?.trim())
      .slice(0, 5);
  }

  const access = ACCESS_LABELS[dataset.accessType] ?? dataset.accessType;
  const faqs: { question: string; answer: string }[] = [
    {
      question: `What is ${dataset.shortTitle} used for?`,
      answer:
        dataset.bestFor?.trim() ||
        dataset.summary?.trim() ||
        `${dataset.shortTitle} is used for research on Indian ${dataset.categories.slice(0, 2).join(" and ") || "data"}.`,
    },
    {
      question: `How do you access ${dataset.shortTitle} data?`,
      answer: `${dataset.shortTitle} is labeled “${access}” on this guide. Open the access portal or documentation links on the record for the current host process—do not assume open download if registration or a DUA is required.`,
    },
    {
      question: `What geography and time does ${dataset.shortTitle} cover?`,
      answer: `Geography: ${dataset.geographyLevel.join(", ") || "India"}. Time coverage: ${dataset.timeCoverage || "see official documentation"}.`,
    },
  ];

  if (dataset.limitations?.trim()) {
    faqs.push({
      question: `What are the main limitations of ${dataset.shortTitle}?`,
      answer: dataset.limitations.trim(),
    });
  }

  return faqs.slice(0, 4);
}
