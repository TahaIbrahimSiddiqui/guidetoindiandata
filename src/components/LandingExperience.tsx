"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  MousePointer2,
  Orbit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogStats } from "@/lib/catalogStats";

/** Served from public/videos — respects GitHub Pages basePath. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/guidetoindiandata";
const LANDING_VIDEO = `${BASE}/videos/indian-street-market-background-web-1080p-muted.mp4`;

/** Rotating affordance lines — any of these enters the solar map. */
const ACTION_LINES = [
  "Move your cursor upward",
  "Click anywhere on the hero",
  "Press Enter or Space",
  "Use the button below",
  "Scroll up at the top of the page",
];

type Props = {
  stats: CatalogStats;
};

/**
 * Useful, scrollable hero (not a splash gate).
 * Multiple paths into /map: button, click hero, cursor-up zone, wheel-up, keyboard.
 */
export function LandingExperience({ stats }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const topHoverTimer = useRef<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [phase, setPhase] = useState<"idle" | "zooming">("idle");
  const [actionIdx, setActionIdx] = useState(0);
  const [actionVisible, setActionVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    const tryPlay = () => {
      void el
        .play()
        .then(() => setVideoReady(true))
        .catch(() => setVideoReady(true));
    };
    if (el.readyState >= 2) tryPlay();
    else el.addEventListener("loadeddata", tryPlay, { once: true });
    return () => el.removeEventListener("loadeddata", tryPlay);
  }, [reduced]);

  // Cycle CTA language so “click” is not the only verb
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setActionVisible(false);
      window.setTimeout(() => {
        setActionIdx((i) => (i + 1) % ACTION_LINES.length);
        setActionVisible(true);
      }, 220);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    router.prefetch("/map");
  }, [router]);

  const enterMap = useCallback(() => {
    if (phase === "zooming") return;
    if (reduced) {
      router.push("/map");
      return;
    }
    setPhase("zooming");
    window.setTimeout(() => router.push("/map"), 880);
  }, [phase, reduced, router]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "A" || tag === "BUTTON" || tag === "INPUT") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enterMap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterMap]);

  // Cursor toward top of viewport → enter map (after short dwell)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (phase === "zooming") return;
      const nearTop = e.clientY < 72;
      if (nearTop) {
        if (topHoverTimer.current == null) {
          topHoverTimer.current = window.setTimeout(() => {
            topHoverTimer.current = null;
            enterMap();
          }, reduced ? 0 : 450);
        }
      } else if (topHoverTimer.current != null) {
        window.clearTimeout(topHoverTimer.current);
        topHoverTimer.current = null;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (topHoverTimer.current != null) {
        window.clearTimeout(topHoverTimer.current);
      }
    };
  }, [enterMap, phase, reduced]);

  // Scroll / wheel up at top → solar map
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (phase === "zooming") return;
      if (window.scrollY <= 8 && e.deltaY < -12) {
        e.preventDefault();
        enterMap();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [enterMap, phase]);

  const zooming = phase === "zooming";
  const actionLine = ACTION_LINES[actionIdx];

  return (
    <div
      className={`min-h-dvh bg-black text-[#F3E4C9] transition-[filter,opacity] duration-700 ease-out ${
        zooming ? "pointer-events-none scale-[0.96] opacity-0 blur-sm" : ""
      }`}
      style={{
        transitionProperty: "opacity, filter, transform",
        transformOrigin: "50% 40%",
      }}
    >
      {/* ── Sticky chrome ─────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-black/45 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5 sm:h-16 sm:px-8 lg:px-12">
          <Link href="/" className="flex min-h-11 items-center gap-2.5">
            <span
              className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C]"
              aria-hidden
            />
            <span className="font-display text-sm font-semibold tracking-tight">
              Guide to Indian Data
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center rounded-md px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#C8C9BC] transition hover:text-[#F3E4C9]"
            >
              About
            </Link>
            <Button
              asChild
              size="sm"
              className="h-9 bg-[#8B5E3C] px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#a06d45] sm:px-4"
            >
              <Link href="/map">Solar map</Link>
            </Button>
          </nav>
        </div>
        {/* Top-edge hover zone hint strip */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#C4A574]/40 to-transparent opacity-60"
          aria-hidden
        />
      </header>

      {/* ── Hero ──────────────────────────────────────── */}
      <section
        className="relative flex min-h-dvh flex-col pt-14 sm:pt-16"
        onClick={(e) => {
          // Click hero (not links/buttons) → map
          const t = e.target as HTMLElement;
          if (t.closest("a, button")) return;
          enterMap();
        }}
        role="region"
        aria-label="Hero"
      >
        {/* Media background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {!reduced && (
            <div
              className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
            >
              <video
                ref={videoRef}
                className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                style={{
                  width: "max(100vw, 177.78vh)",
                  height: "max(100vh, 56.25vw)",
                }}
                src={LANDING_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background: reduced
                ? `
                  radial-gradient(ellipse 80% 55% at 55% 35%, rgba(139,94,60,0.14), transparent 58%),
                  linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(12,12,12,0.72) 55%, #000 100%)
                `
                : `
                  linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.72) 100%),
                  linear-gradient(105deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.4) 100%)
                `,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C4A574] drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:text-[11px]">
              The Guide to Indian Data
            </p>
            <h1 className="font-display max-w-4xl text-[clamp(2.25rem,6.5vw,4.75rem)] font-bold leading-[1.08] tracking-tight text-[#F3E4C9] drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]">
              Find the right data for research on India.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#E4E2D4] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-lg">
              Explore surveys, administrative records, censuses, spatial data,
              replication packages, and open-source datasets—organized by topic,
              geography, time, and access conditions.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                type="button"
                size="lg"
                className="h-12 bg-[#8B5E3C] px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#a06d45]"
                onClick={(e) => {
                  e.stopPropagation();
                  enterMap();
                }}
              >
                <Orbit className="size-4" aria-hidden />
                Enter Indian Data solar system
              </Button>
              <Link
                href="/about"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex min-h-12 items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C4A574] transition hover:text-[#F3E4C9]"
              >
                About the maintainer →
              </Link>
            </div>

            {/* Dynamic action line */}
            <p
              className={`mt-8 flex items-center gap-2 text-sm text-[#C8C9BC] transition-opacity duration-200 ${
                actionVisible ? "opacity-100" : "opacity-0"
              }`}
              aria-live="polite"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#C4A574]">
                {actionIdx === 0 ? (
                  <ArrowUp className="size-3.5" aria-hidden />
                ) : (
                  <MousePointer2 className="size-3.5" aria-hidden />
                )}
              </span>
              <span>
                <span className="text-[#F3E4C9]">{actionLine}</span>
                <span className="text-[#C8C9BC]/80">
                  {" "}
                  to navigate the dataset solar system
                </span>
              </span>
            </p>
          </div>

          {/* Credibility / catalogue stats */}
          <div className="relative z-10 border-t border-white/[0.08] bg-black/50 backdrop-blur-md">
            <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px sm:grid-cols-4">
              <Stat
                value={formatCount(stats.datasetCount)}
                label="datasets"
              />
              <Stat
                value={formatCount(stats.thematicAreaCount)}
                label="thematic areas"
              />
              <Stat
                value={formatCount(stats.providerCount)}
                label="data providers"
              />
              <Stat
                value={stats.lastUpdatedLabel}
                label="last updated"
                valueClass="text-lg sm:text-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Scroll continuation ───────────────────────── */}
      <section className="border-t border-white/[0.06] bg-[#050505] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1400px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
            How it works
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-2xl font-semibold text-[#F3E4C9] sm:text-3xl">
            From theme suns to full dataset records
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Open the solar map",
                d: "Enter via the button, a click on the hero, cursor toward the top, or keyboard.",
              },
              {
                n: "02",
                t: "Click a theme sun",
                d: "Health, trade, labour… linked datasets light up; multi-theme visitors show as dashed links.",
              },
              {
                n: "03",
                t: "Open a dataset page",
                d: "Access type, guides, variables, limitations, and previous-round background when available.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6"
              >
                <p className="font-mono text-[10px] text-[#C4A574]">{step.n}</p>
                <p className="font-display mt-2 text-lg font-semibold text-[#F3E4C9]">
                  {step.t}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#C8C9BC]/90">
                  {step.d}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 bg-[#8B5E3C] uppercase tracking-[0.14em] text-white hover:bg-[#a06d45]"
            >
              <Link href="/map">Open solar map</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/15 bg-transparent uppercase tracking-[0.14em] text-[#F3E4C9] hover:bg-white/5"
            >
              <Link href="/about">About</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-8 text-center sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
          Independent public catalog · Not an official ministry portal ·{" "}
          <Link href="/about" className="text-[#C4A574] hover:text-[#F3E4C9]">
            About Taha Ibrahim Siddiqui
          </Link>
        </p>
      </footer>

      {zooming && (
        <p
          className="pointer-events-none fixed inset-x-0 bottom-12 z-50 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]"
          aria-live="polite"
        >
          Entering the solar system…
        </p>
      )}
    </div>
  );
}

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

function Stat({
  value,
  label,
  valueClass,
}: {
  value: string;
  label: string;
  valueClass?: string;
}) {
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-7">
      <p
        className={`font-display font-semibold tabular-nums text-[#F3E4C9] ${
          valueClass ?? "text-2xl sm:text-3xl"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#C8C9BC]/85">
        {label}
      </p>
    </div>
  );
}
