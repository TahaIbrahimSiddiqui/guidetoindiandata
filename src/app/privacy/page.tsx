import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & advertising",
};

export default function PrivacyPage() {
  return (
    <div className="bg-data-grid">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-white">
          Privacy & advertising
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-400">
          <p>
            The Indian Data Guide is a static informational catalog. We do not
            require accounts and do not intentionally collect personal research
            queries on the server.
          </p>
          <p>
            <strong className="text-slate-200">Advertising:</strong> Catalog
            pages (Explore, dataset records, Clusters, About) reserve ad
            inventory so the site can be monetized. The landing page does not
            show ads. When a publisher ID is configured, third-party ad networks
            (for example Google AdSense) may set cookies or use device
            identifiers according to their policies.
          </p>
          <p>
            Placeholders labeled &quot;Advertisement&quot; appear when ads are
            disabled or not yet configured—layout space is reserved to avoid
            content shift.
          </p>
          <p>
            This page is a stub for network approval and transparency. Replace
            it with counsel-reviewed policy text before production monetization.
          </p>
        </div>
      </div>
    </div>
  );
}
