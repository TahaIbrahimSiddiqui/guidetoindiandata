import { ACCESS_LABELS } from "@/lib/access";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import type { Dataset, DataSeries } from "@/types/dataset";

/** Safe JSON-LD script content (escape `<` for XSS). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    inLanguage: "en",
    publisher: {
      "@type": "Person",
      name: "Taha Ibrahim Siddiqui",
      url: "https://tahaibrahim.in/",
    },
  };
}

export function datasetJsonLd(
  dataset: Dataset,
  options?: { seriesSlug?: string; seriesTitle?: string },
) {
  const pageUrl = absoluteUrl(`/datasets/${dataset.slug}`);
  const accessLabel = ACCESS_LABELS[dataset.accessType] ?? dataset.accessType;

  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: dataset.title,
    alternateName: dataset.abbreviations,
    description: dataset.summary || dataset.bestFor,
    url: pageUrl,
    identifier: dataset.dataDoi
      ? `https://doi.org/${dataset.dataDoi}`
      : pageUrl,
    creator: {
      "@type": "Organization",
      name: dataset.institution || dataset.host,
    },
    isAccessibleForFree:
      dataset.accessType === "open-download" ||
      dataset.accessType === "public-dashboard",
    conditionsOfAccess: accessLabel,
    keywords: [
      ...dataset.categories,
      ...dataset.technicalTags.slice(0, 8),
      "India",
      "Indian data",
    ],
    spatialCoverage: dataset.geographyLevel.join(", "),
    temporalCoverage: dataset.timeCoverage,
    distribution: dataset.accessUrl
      ? {
          "@type": "DataDownload",
          contentUrl: dataset.accessUrl,
          encodingFormat: dataset.formats.join(", "),
        }
      : undefined,
  };

  if (options?.seriesSlug) {
    json.isPartOf = {
      "@type": "Dataset",
      name: options.seriesTitle,
      url: absoluteUrl(`/series/${options.seriesSlug}`),
    };
  }

  return json;
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function seriesJsonLd(series: DataSeries) {
  const pageUrl = absoluteUrl(`/series/${series.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: series.title,
    description: series.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Dataset",
      name: series.title,
      description: series.description,
    },
    numberOfItems: series.waves.length,
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[],
) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
