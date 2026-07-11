import { AdScript } from "@/components/ads/AdScript";
import { ContentWithAds } from "@/components/ads/ContentWithAds";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden bg-obsidian-bg">
      <SiteHeader />
      <main id="main-content" className="min-w-0 flex-1" tabIndex={-1}>
        <AdScript />
        <div className="bg-vault min-h-[70vh] min-w-0">
          <ContentWithAds>{children}</ContentWithAds>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
