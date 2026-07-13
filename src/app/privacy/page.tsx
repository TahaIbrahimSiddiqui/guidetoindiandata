import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy & advertising",
  description:
    "How the Indian Data Guide handles privacy, cookies, and advertising on catalog pages.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div>
      <header className="mb-8">
        <p className="page-kicker">Legal</p>
        <h1 className="page-title text-[clamp(2rem,5vw,3rem)]">
          Privacy & advertising
        </h1>
      </header>

      <div className="surface space-y-5 p-6 text-sm leading-relaxed text-[#D3D4C0]/95 sm:p-8">
        <p>
          The Indian Data Guide is a static informational catalog. We do not
          require accounts and do not intentionally collect personal research
          queries on the server.
        </p>
        <p>
          <strong className="font-medium text-[#F3E4C9]">Advertising:</strong>{" "}
          Catalog pages (Explore, dataset records, Themes, About) reserve ad
          inventory so the site can be monetized. The landing page does not show
          ads. When a publisher ID is configured, third-party ad networks (for
          example Google AdSense) may set cookies or use device identifiers
          according to their policies.
        </p>
        <p>
          Placeholders labeled &quot;Advertisement&quot; appear when ads are
          disabled or not yet configured—layout space is reserved to avoid
          content shift.
        </p>
        <p className="border-t border-obsidian-border pt-5 text-[#D3D4C0]/70">
          This page is a stub for network approval and transparency. Replace it
          with counsel-reviewed policy text before production monetization.
        </p>
      </div>
    </div>
  );
}
