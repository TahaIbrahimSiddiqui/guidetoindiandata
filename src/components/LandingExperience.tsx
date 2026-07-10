"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, Database, Network, BookOpen } from "lucide-react";
import { ObsidianGraphFull } from "@/components/ObsidianGraphFull";
import { Button } from "@/components/ui/button";
import { clusters } from "@/data/clusters";

/** Stock cinematic India footage (YouTube embed — not rehosted). */
const YT_ID = "tcxDfvMRjZI";
const YT_EMBED = `https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${YT_ID}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0`;

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/series", label: "Series" },
  { href: "/academic", label: "Academic" },
  { href: "/about", label: "About" },
];

/**
 * Scroll-first landing (boilerlab-style):
 * hero video → floating universe → catalog CTAs.
 * No click-to-enter gate.
 */
export function LandingExperience() {
  const [reduced, setReduced] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setYtReady(true), 700);
    return () => window.clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-dvh bg-black text-[#F3E4C9]">
      {/* Sticky chrome */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.07] bg-black/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C]"
              aria-hidden
            />
            <span className="font-display text-sm font-semibold tracking-tight">
              Indian Data Guide
              <span className="align-super text-[0.65em] text-[#C4A574]/85">
                ®
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#C8C9BC] transition hover:text-[#F3E4C9]"
              >
                {item.label}
              </Link>
            ))}
            <Button
              asChild
              size="sm"
              className="ml-3 h-10 bg-[#8B5E3C] text-white hover:bg-[#a06d45]"
            >
              <Link href="/explore">Open catalog</Link>
            </Button>
          </nav>
          <Link
            href="/explore"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C4A574] md:hidden"
          >
            Catalog →
          </Link>
        </div>
      </header>

      {/* ── 1. Hero (full viewport) ───────────────────────── */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          {!reduced && (
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${
                ytReady ? "opacity-100" : "opacity-0"
              }`}
            >
              <iframe
                title="India cinematic stock footage"
                src={YT_EMBED}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
                style={{
                  width: "max(100vw, 177.78vh)",
                  height: "max(100vh, 56.25vw)",
                  pointerEvents: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={false}
                loading="eager"
              />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background: reduced
                ? `
                  radial-gradient(ellipse 80% 55% at 55% 35%, rgba(139,94,60,0.22), transparent 58%),
                  radial-gradient(ellipse 50% 40% at 15% 85%, rgba(196,165,116,0.1), transparent 50%),
                  linear-gradient(180deg, #000 0%, #0c0c0c 55%, #000 100%)
                `
                : `
                  linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 40%, rgba(0,0,0,0.88) 100%),
                  linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.7) 100%)
                `,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 32%, rgba(0,0,0,0.72) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-24 pt-28 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="eyebrow mb-6 text-[#C8C9BC] drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
              India · Data · Discovery
            </p>
            <h1 className="font-display max-w-4xl text-[clamp(2.75rem,8vw,6rem)] font-bold leading-[1.06] tracking-tight text-[#F3E4C9] drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]">
              National data,
              <br />
              mapped for
              <br />
              research.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-[#E4E2D4]/95 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-lg">
              Honest access labels, usage guides, and variable tables—across
              government surveys, academic archives, and community sources.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 bg-[#8B5E3C] px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#a06d45]"
              >
                <Link href="/explore">Browse catalog</Link>
              </Button>
              <a
                href="#universe"
                className="inline-flex min-h-12 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4A574] transition hover:text-[#F3E4C9]"
              >
                Scroll to universe
                <ArrowDown className="size-4 animate-bounce" aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <a
          href="#universe"
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/45 transition hover:text-white/70"
        >
          Scroll down to explore
          <ArrowDown className="size-4" aria-hidden />
        </a>
      </section>

      {/* ── 2. Floating universe (full viewport) ──────────── */}
      <section
        id="universe"
        className="relative h-[100dvh] w-full border-t border-white/[0.06] bg-black"
      >
        <div className="absolute left-5 top-5 z-20 sm:left-8 sm:top-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
            02 · Universe
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-[#F3E4C9] sm:text-3xl">
            Floating data map
          </h2>
        </div>
        <ObsidianGraphFull embedded />
      </section>

      {/* ── 3. Proof / catalog bridge ─────────────────────── */}
      <section className="relative border-t border-white/[0.06] bg-[#050505] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
            03 · Catalog
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-tight text-[#F3E4C9]">
            Built for researchers who need truth about access friction.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#C8C9BC]/90">
            Every record includes best-for guidance, limitations, usage guides,
            and representative variables—not just a dump of portal links.
          </p>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Database,
                label: "111+",
                blurb: "Dataset records across gov, academic & GitHub layers",
              },
              {
                icon: Network,
                label: String(clusters.length),
                blurb: "Domain themes linking surveys and admin systems",
              },
              {
                icon: BookOpen,
                label: "Guides",
                blurb: "Codebooks, portals, and tutorials on every page",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6"
              >
                <item.icon
                  className="size-5 text-[#C4A574]"
                  aria-hidden
                />
                <p className="font-display mt-4 text-3xl font-semibold text-[#F3E4C9]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#C8C9BC]/85">
                  {item.blurb}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 bg-[#8B5E3C] px-6 uppercase tracking-[0.14em] text-white hover:bg-[#a06d45]"
            >
              <Link href="/explore">Explore datasets</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/15 bg-transparent uppercase tracking-[0.14em] text-[#F3E4C9] hover:bg-white/5"
            >
              <Link href="/series">Browse series</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/15 bg-transparent uppercase tracking-[0.14em] text-[#F3E4C9] hover:bg-white/5"
            >
              <Link href="/academic">Academic & GitHub</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 4. Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-black px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C]" />
              <p className="font-display text-lg font-semibold text-[#F3E4C9]">
                Indian Data Guide®
              </p>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/45">
              Not an official government portal. Always verify current access
              rules on the host site.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-[#F3E4C9]"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/privacy" className="hover:text-[#F3E4C9]">
              Privacy
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-[1400px] text-[10px] uppercase tracking-[0.14em] text-white/25">
          © {new Date().getFullYear()} · Stock video via YouTube embed
        </p>
      </footer>
    </div>
  );
}
