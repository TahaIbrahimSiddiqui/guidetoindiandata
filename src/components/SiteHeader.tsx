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

const nav = [
  { href: "/series", label: "Series" },
  { href: "/academic", label: "Academic" },
  { href: "/explore", label: "Explore" },
  { href: "/clusters", label: "Themes" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-foreground focus-visible:outline-offset-4"
        >
          <span
            className="inline-block h-2 w-2 rotate-45 bg-primary transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-125 group-hover:rotate-[225deg]"
            aria-hidden
          />
          <span className="font-display text-sm font-semibold tracking-tight">
            Indian Data Guide
            <span className="align-super text-[0.65em] text-brand-gold/80">
              ®
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-200",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-px bg-ring"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="ml-3 h-9 border-foreground/25 bg-transparent px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <Link href="/series/nfhs">NFHS</Link>
          </Button>
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-border md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-border bg-sidebar text-sidebar-foreground"
          >
            <SheetHeader>
              <SheetTitle className="font-display text-left text-foreground">
                Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1 px-2" aria-label="Mobile">
              {nav.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-md px-3 py-3 text-xs font-medium uppercase tracking-[0.16em] transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
              <SheetClose asChild>
                <Button asChild className="mt-4 w-full uppercase tracking-[0.14em]">
                  <Link href="/series/nfhs">Open NFHS series</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
