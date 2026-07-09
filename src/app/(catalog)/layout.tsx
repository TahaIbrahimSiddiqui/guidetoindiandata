import { AdScript } from "@/components/ads/AdScript";
import { ContentWithAds } from "@/components/ads/ContentWithAds";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdScript />
      <div className="bg-data-grid min-h-[70vh]">
        <ContentWithAds>{children}</ContentWithAds>
      </div>
    </>
  );
}
