import Link from "next/link";

const footerNav = [
  {
    title: "Catalog",
    links: [
      { href: "/explore", label: "Explore datasets" },
      { href: "/series", label: "Series timelines" },
      { href: "/clusters", label: "Themes" },
      { href: "/academic", label: "Academic & GitHub" },
    ],
  },
  {
    title: "Guide",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy & ads" },
      { href: "/series/nfhs", label: "Start with NFHS" },
      { href: "/series/plfs", label: "Start with PLFS" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-obsidian-border bg-black">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-md">
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C]"
                aria-hidden
              />
              <p className="font-display text-lg font-semibold tracking-tight text-[#F3E4C9]">
                Indian Data Guide
                <span className="text-[0.65em] align-super text-brand-gold/80">
                  ®
                </span>
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[#D3D4C0]/85">
              Honest access labels, usage guides, and variable tables for
              India&apos;s survey, administrative, academic, and community data
              systems—built for researchers and builders.
            </p>
          </div>

          {footerNav.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#D3D4C0]/90 transition-colors hover:text-[#F3E4C9] link-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-obsidian-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#D3D4C0]/50">
            © {new Date().getFullYear()} · Not an official government portal
          </p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#D3D4C0]/40">
            Always verify current access rules on the host site
          </p>
        </div>
      </div>
    </footer>
  );
}
