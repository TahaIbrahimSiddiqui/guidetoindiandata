import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  metadataBase,
} from "@/lib/site";

type PageMetaInput = {
  title: string;
  description: string;
  /** Path without basePath, e.g. `/datasets/nfhs-5` */
  path: string;
  /** Override Open Graph type (default website) */
  ogType?: "website" | "article";
  noIndex?: boolean;
};

const DEFAULT_SHARE_IMAGE = {
  url: absoluteUrl("/og/indian-data-guide.png"),
  width: 1200,
  height: 630,
  alt: "Indian Data Guide: find the right Indian research data",
};

/**
 * Build consistent Metadata for catalog and marketing pages.
 * Titles use the root template (`%s · Indian Data Guide`) unless absolute.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogType = "website",
  noIndex = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const desc = clampDescription(description);

  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: ogType,
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description: desc,
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description: desc,
      images: [DEFAULT_SHARE_IMAGE],
    },
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
  };
}

export function rootMetadata(): Metadata {
  const url = absoluteUrl("/");
  return {
    metadataBase,
    title: {
      default: SITE_NAME,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [DEFAULT_SHARE_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/** Meta descriptions: keep under ~160 chars for SERP display. */
export function clampDescription(text: string, max = 158): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}
