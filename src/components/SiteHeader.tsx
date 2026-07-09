"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hexagon, Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/series", label: "Series" },
  { href: "/academic", label: "Academic" },
  { href: "/explore", label: "Explore" },
  { href: "/clusters", label: "Clusters" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-obsidian-border bg-obsidian-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight text-obsidian-text"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-obsidian-purple/40 bg-obsidian-purple/15 text-obsidian-purple-bright">
            <Hexagon className="h-4 w-4" aria-hidden />
          </span>
          <span className="hidden sm:inline text-sm">
            Indian Data <span className="text-obsidian-purple-bright">Guide</span>
          </span>
          <span className="sm:hidden text-sm">IDG</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-obsidian-purple/20 text-obsidian-purple-bright"
                    : "text-obsidian-muted hover:bg-white/5 hover:text-obsidian-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/series/nfhs"
            className="ml-2 rounded-md bg-obsidian-purple px-3 py-1.5 text-sm font-medium text-white transition hover:bg-obsidian-purple-bright hover:text-obsidian-bg"
          >
            NFHS
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex rounded-md border border-obsidian-border p-2 text-obsidian-text md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-obsidian-border bg-obsidian-bg px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-obsidian-text hover:bg-white/5"
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
