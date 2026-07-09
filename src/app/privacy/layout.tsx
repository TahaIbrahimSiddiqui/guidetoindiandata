import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-obsidian-bg">
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-vault" tabIndex={-1}>
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
