"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  MousePointer2,
  Orbit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogStats } from "@/lib/catalogStats";

/** Served from public/videos — respects GitHub Pages basePath. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/guidetoindiandata";
const LANDING_VIDEO = `${BASE}/videos/indian-street-market-background-web-1080p-muted.mp4`;

/** Desktop affordance lines — any of these enters the solar map. */
const ACTION_LINES_DESKTOP = [
  "Scroll down",
  "Click anywhere on the hero",
  "Press Enter or Space",
  "Use the button below",
];

/** Touch / coarse-pointer lines (no wheel or keyboard). */
const ACTION_LINES_TOUCH = [
  "Tap anywhere on the hero",
  "Use the button below",
];

type Props = {
  stats: CatalogStats;
};

/**
 * Hero with staggered text entrance + timer-style count-up stats
 * pinned in the first viewport (no scroll required to see counters).
 */
export function LandingExperience({ stats }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [phase, setPhase] = useState<"idle" | "zooming">("idle");
  const [actionIdx, setActionIdx] = useState(0);
  const [actionVisible, setActionVisible] = useState(true);
  /** Staggered reveal of hero text blocks */
  const [revealStep, setRevealStep] = useState(0);
  /** Start count-up after text has begun */
  const [countReady, setCountReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    const update = () => {
      setIsTouch(
        window.matchMedia("(pointer: coarse)").matches ||
          window.innerWidth < 768,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Cascade text in, then kick off counters
  useEffect(() => {
    if (reduced) {
      setRevealStep(6);
      setCountReady(true);
      return;
    }
    const delays = [80, 220, 420, 620, 820, 980];
    const timers = delays.map((ms, i) =>
      window.setTimeout(() => setRevealStep(i + 1), ms),
    );
    const countT = window.setTimeout(() => setCountReady(true), 1100);
    return () => {
      timers.forEach(clearTimeout);
      window.clearTimeout(countT);
    };
  }, [reduced]);

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

  useEffect(() => {
    if (reduced) return;
    const lines = isTouch ? ACTION_LINES_TOUCH : ACTION_LINES_DESKTOP;
    setActionIdx(0);
    const id = window.setInterval(() => {
      setActionVisible(false);
      window.setTimeout(() => {
        setActionIdx((i) => (i + 1) % lines.length);
        setActionVisible(true);
      }, 220);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduced, isTouch]);

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

  // Wheel: scroll down opens the map. Scroll up does nothing (no transition).
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (phase === "zooming") return;
      // Ignore scroll up and horizontal trackpad pans
      if (e.deltaY <= 0) return;
      if (window.scrollY <= 8 && e.deltaY > 12) {
        e.preventDefault();
        enterMap();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [enterMap, phase]);

  const zooming = phase === "zooming";
  const actionLines = isTouch ? ACTION_LINES_TOUCH : ACTION_LINES_DESKTOP;
  const actionLine = actionLines[actionIdx % actionLines.length];
  const shown = (step: number) => revealStep >= step;

  return (
    <div
      className={`bg-black text-[#F3E4C9] transition-[transform,filter,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        zooming
          ? "pointer-events-none scale-[1.28] opacity-0 blur-[2px]"
          : "scale-100 opacity-100"
      }`}
      style={{ transformOrigin: "50% 42%" }}
    >
      {/* ── Sticky chrome ─────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-black/45 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5 sm:h-16 sm:px-8 lg:px-12">
          <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rotate-45 bg-[#8B5E3C]"
              aria-hidden
            />
            <span className="font-display truncate text-sm font-semibold tracking-tight">
              Guide to Indian Data
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Main">
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center rounded-md px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#C8C9BC] transition hover:text-[#F3E4C9] sm:px-3"
            >
              About
            </Link>
            <Button
              asChild
              size="sm"
              className="min-h-11 bg-[#8B5E3C] px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#a06d45] sm:px-4"
            >
              <Link href="/map">
                <span className="sm:hidden">Map</span>
                <span className="hidden sm:inline">Solar map</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ── Hero: full first screen including stats ───── */}
      <section
        className="relative flex h-dvh flex-col overflow-y-auto overscroll-contain pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-[calc(4rem+env(safe-area-inset-top))]"
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (t.closest("a, button")) return;
          enterMap();
        }}
        role="region"
        aria-label="Hero"
      >
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
                preload="metadata"
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
                  linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.78) 100%),
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

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          {/* Copy — tighter padding so stats fit without scroll */}
          <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
            <p
              className={revealClass(
                shown(1),
                reduced,
                "mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C4A574] drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:mb-5 sm:text-[11px]",
              )}
            >
              The Guide to Indian Data
            </p>
            <h1
              className={revealClass(
                shown(2),
                reduced,
                "font-display max-w-4xl text-[clamp(1.55rem,6.5vw,4.25rem)] font-bold leading-[1.08] tracking-tight text-[#F3E4C9] drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)] max-[400px]:text-[clamp(1.4rem,7vw,1.85rem)]",
              )}
            >
              <AnimatedHeadline
                text="Find the right data for research on India."
                active={shown(2)}
                reduced={reduced}
              />
            </h1>
            <p
              className={revealClass(
                shown(3),
                reduced,
                "mt-4 max-w-2xl text-sm leading-relaxed text-[#E4E2D4] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:mt-5 sm:text-base lg:text-lg",
              )}
            >
              Explore surveys, administrative records, censuses, spatial data,
              replication packages, and open-source datasets—organized by topic,
              geography, time, and access conditions.
            </p>

            <div
              className={revealClass(
                shown(4),
                reduced,
                "mt-7 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4",
              )}
            >
              <Button
                type="button"
                size="lg"
                className="h-11 max-w-full whitespace-normal bg-[#8B5E3C] px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#a06d45] sm:h-12 sm:whitespace-nowrap sm:px-6 sm:tracking-[0.16em]"
                onClick={(e) => {
                  e.stopPropagation();
                  enterMap();
                }}
              >
                <Orbit className="size-4 shrink-0" aria-hidden />
                <span className="sm:hidden">Enter solar map</span>
                <span className="hidden sm:inline">
                  Enter Indian Data solar system
                </span>
              </Button>
              <Link
                href="/about"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C4A574] transition hover:text-[#F3E4C9]"
              >
                About the maintainer →
              </Link>
            </div>

            <p
              className={revealClass(
                shown(5),
                reduced,
                `mt-6 flex items-center gap-2 text-sm text-[#C8C9BC] sm:mt-7 ${
                  actionVisible ? "opacity-100" : "opacity-0"
                }`,
              )}
              aria-live="polite"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#C4A574]">
                {!isTouch && actionIdx === 0 ? (
                  <ArrowDown className="size-3.5" aria-hidden />
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

          {/* Credibility stats — always in first viewport, count-up like a timer */}
          <div
            className={revealClass(
              shown(6),
              reduced,
              "relative z-10 shrink-0 border-t border-white/[0.08] bg-black/55 backdrop-blur-md",
            )}
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px sm:grid-cols-4">
              <CountUpStat
                target={stats.datasetCount}
                label="datasets"
                ready={countReady}
                reduced={reduced}
                delayMs={0}
              />
              <CountUpStat
                target={stats.thematicAreaCount}
                label="thematic areas"
                ready={countReady}
                reduced={reduced}
                delayMs={120}
              />
              <CountUpStat
                target={stats.providerCount}
                label="data providers"
                ready={countReady}
                reduced={reduced}
                delayMs={240}
              />
              <StatStatic
                value={stats.lastUpdatedLabel}
                label="last updated"
                ready={countReady}
                reduced={reduced}
                delayMs={360}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Below the fold ────────────────────────────── */}
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
                d: "Enter via the button, scroll down on the hero, a click on the hero, or keyboard. Scroll up does not open the map.",
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

function revealClass(shown: boolean, reduced: boolean, extra: string) {
  if (reduced) return extra;
  return [
    extra,
    "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
    shown
      ? "translate-y-0 opacity-100"
      : "translate-y-5 opacity-0 blur-[2px]",
  ].join(" ");
}

/** Word-by-word headline cascade */
function AnimatedHeadline({
  text,
  active,
  reduced,
}: {
  text: string;
  active: boolean;
  reduced: boolean;
}) {
  if (reduced || !active) {
    return (
      <span className={active || reduced ? "opacity-100" : "opacity-0"}>
        {text}
      </span>
    );
  }
  const words = text.split(" ");
  return (
    <span className="inline">
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transitionDelay: `${i * 55}ms`,
            opacity: active ? 1 : 0,
            transform: active ? "translateY(0)" : "translateY(0.55em)",
          }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

/** Ease-out cubic for timer feel */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function CountUpStat({
  target,
  label,
  ready,
  reduced,
  delayMs,
}: {
  target: number;
  label: string;
  ready: boolean;
  reduced: boolean;
  delayMs: number;
}) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      setValue(target);
      setStarted(true);
      return;
    }
    let cancelled = false;
    let raf = 0;
    const startDelay = window.setTimeout(() => {
      setStarted(true);
      const duration = 1400 + Math.min(800, target * 4);
      const t0 = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const p = Math.min(1, (now - t0) / duration);
        setValue(Math.round(easeOutCubic(p) * target));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setValue(target);
      };
      raf = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(startDelay);
      cancelAnimationFrame(raf);
    };
  }, [ready, reduced, target, delayMs]);

  return (
    <div
      className={`px-4 py-4 sm:px-8 sm:py-6 transition-all duration-500 ${
        started || reduced
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0"
      }`}
    >
      <p
        className="font-display text-2xl font-semibold tabular-nums text-[#F3E4C9] sm:text-3xl"
        aria-label={`${target} ${label}`}
      >
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#C8C9BC]/85">
        {label}
      </p>
    </div>
  );
}

function StatStatic({
  value,
  label,
  ready,
  reduced,
  delayMs,
}: {
  value: string;
  label: string;
  ready: boolean;
  reduced: boolean;
  delayMs: number;
}) {
  const [show, setShow] = useState(reduced);

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      setShow(true);
      return;
    }
    const t = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(t);
  }, [ready, reduced, delayMs]);

  return (
    <div
      className={`px-4 py-4 sm:px-8 sm:py-6 transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <p className="font-display text-lg font-semibold text-[#F3E4C9] sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#C8C9BC]/85">
        {label}
      </p>
    </div>
  );
}
