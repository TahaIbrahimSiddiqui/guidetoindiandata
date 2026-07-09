import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOT_IDS } from "@/lib/ads";

export function ContentWithAds({
  children,
  showSidebar = true,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <AdSlot
        slotId={AD_SLOT_IDS.topBanner}
        format="leaderboard"
        className="mb-6 w-full"
      />

      <div
        className={`grid gap-8 ${
          showSidebar ? "lg:grid-cols-[minmax(0,1fr)_300px]" : ""
        }`}
      >
        <div className="min-w-0">{children}</div>

        {showSidebar && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <AdSlot
                slotId={AD_SLOT_IDS.sidebar}
                format="skyscraper"
                className="w-full"
              />
            </div>
          </aside>
        )}
      </div>

      <AdSlot
        slotId={AD_SLOT_IDS.bottomBanner}
        format="leaderboard"
        className="mt-10 w-full"
      />
    </div>
  );
}

export function InContentAd({ className = "" }: { className?: string }) {
  return (
    <AdSlot
      slotId={AD_SLOT_IDS.inContent}
      format="rectangle"
      className={`my-6 w-full max-w-md ${className}`}
    />
  );
}
