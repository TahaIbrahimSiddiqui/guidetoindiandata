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
    <div className="flex min-h-dvh flex-col bg-obsidian-bg">
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <AdScript />
        <div className="bg-vault min-h-[70vh]">
          <ContentWithAds>{children}</ContentWithAds>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
