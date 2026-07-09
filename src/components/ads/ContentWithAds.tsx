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
    <div className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <AdSlot
        slotId={AD_SLOT_IDS.topBanner}
        format="leaderboard"
        className="mb-10 w-full"
      />

      <div
        className={`grid gap-10 ${
          showSidebar ? "lg:grid-cols-[minmax(0,1fr)_280px]" : ""
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
        className="mt-14 w-full"
      />
    </div>
  );
}

export function InContentAd({ className = "" }: { className?: string }) {
  return (
    <AdSlot
      slotId={AD_SLOT_IDS.inContent}
      format="rectangle"
      className={`my-10 w-full max-w-md ${className}`}
    />
  );
}
