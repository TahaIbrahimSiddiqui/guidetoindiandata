"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Primary destinations — every major catalog route is one click away. */
const nav = [
  { href: "/", label: "Landing" },
  { href: "/map", label: "Map" },
  { href: "/explore", label: "Explore" },
  { href: "/clusters", label: "Themes" },
  { href: "/series", label: "Series" },
  { href: "/academic", label: "Academic" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="glass-header sticky top-0 z-50 border-b border-border/80 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex min-h-11 min-w-0 items-center gap-2.5 text-foreground focus-visible:outline-offset-4"
        >
          <span
            className="inline-block h-2 w-2 rotate-45 bg-primary transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-125 group-hover:rotate-[225deg]"
            aria-hidden
          />
          <span className="font-display truncate text-sm font-semibold tracking-tight">
            Guide to Indian Data
            <span className="align-super text-[0.65em] text-brand-gold/80">
              ®
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-md px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-200",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-ring"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
          <Button
            asChild
            size="sm"
            className="ml-3 min-h-11 bg-primary px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/map">Solar map</Link>
          </Button>
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <Button
            asChild
            size="sm"
            className="min-h-11 text-[10px] uppercase tracking-[0.12em]"
          >
            <Link href="/map">Map</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="font-display text-left">
                  Navigate
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
                {nav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-12 items-center rounded-lg px-3 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href="/map"
                    className="mt-4 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
                  >
                    Open solar map
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
