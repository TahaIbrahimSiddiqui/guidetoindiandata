import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-obsidian-border bg-[#0A2947]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-5 py-14 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div className="max-w-md">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C]" />
            <p className="font-display text-lg font-semibold tracking-tight text-[#F3E4C9]">
              Indian Data Guide®
            </p>
          </div>
          <p className="text-sm leading-relaxed text-[#D3D4C0]/85">
            From strategy of discovery to honest access labels—cataloguing
            India&apos;s data ecosystem for researchers and builders.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-16">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D3D4C0]">
            <Link href="/explore" className="link-underline hover:text-[#F3E4C9]">
              Explore
            </Link>
            <Link href="/series" className="link-underline hover:text-[#F3E4C9]">
              Series
            </Link>
            <Link href="/academic" className="link-underline hover:text-[#F3E4C9]">
              Academic
            </Link>
            <Link href="/about" className="link-underline hover:text-[#F3E4C9]">
              About
            </Link>
            <Link href="/privacy" className="link-underline hover:text-[#F3E4C9]">
              Privacy
            </Link>
          </div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#D3D4C0]/50">
            ©{new Date().getFullYear()} · Not an official government portal
          </p>
        </div>
      </div>
    </footer>
  );
}
