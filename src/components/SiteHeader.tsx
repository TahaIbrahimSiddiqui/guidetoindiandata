"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/series", label: "Series" },
  { href: "/academic", label: "Academic" },
  { href: "/explore", label: "Explore" },
  { href: "/clusters", label: "Themes" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-obsidian-border/80 bg-[#0A2947]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-obsidian-text"
        >
          <span
            className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C] transition-transform duration-500 group-hover:scale-110"
            aria-hidden
          />
          <span className="font-display text-sm font-semibold tracking-tight">
            Indian Data Guide®
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main"
        >
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                  active
                    ? "text-[#F3E4C9]"
                    : "text-[#D3D4C0]/80 hover:text-[#F3E4C9]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/series/nfhs"
            className="border border-[#F3E4C9]/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F3E4C9] transition-all duration-400 hover:border-[#F3E4C9] hover:bg-[#F3E4C9] hover:text-[#0A2947]"
          >
            NFHS
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex border border-obsidian-border p-2 text-obsidian-text md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-obsidian-border bg-[#0A2947] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#D3D4C0]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
