"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CircleDot,
  MousePointer2,
  Orbit,
  Sparkles,
} from "lucide-react";
import { ObsidianGraphFull } from "@/components/ObsidianGraphFull";

/**
 * Solar-system map: full-viewport universe + compact navigation guide.
 */
export function MapExperience() {
  const [entered, setEntered] = useState(false);
  /** Closed by default on phones so the graph is tappable immediately. */
  const [guideOpen, setGuideOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mqMotion.matches);
    const onMotion = () => setReduced(mqMotion.matches);
    mqMotion.addEventListener("change", onMotion);

    const updateNarrow = () => {
      const narrow =
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768;
      setIsNarrow(narrow);
      // Desktop: open guide once; mobile stays closed until user asks
      if (!narrow) setGuideOpen(true);
    };
    updateNarrow();
    window.addEventListener("resize", updateNarrow);

    const t = window.setTimeout(
      () => setEntered(true),
      mqMotion.matches ? 0 : 30,
    );
    return () => {
      mqMotion.removeEventListener("change", onMotion);
      window.removeEventListener("resize", updateNarrow);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      className={`relative h-dvh w-full overflow-hidden bg-black transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        entered
          ? "scale-100 opacity-100"
          : reduced
            ? "scale-100 opacity-0"
            : "scale-[1.08] opacity-0"
      }`}
      style={{ transformOrigin: "50% 45%" }}
    >
      {/* Full-bleed solar system */}
      <div className="absolute inset-0">
        <ObsidianGraphFull embedded showChrome={false} />
      </div>

      {/* Top chrome — compact on mobile; safe-area for notches */}
      <header
        className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:gap-3 sm:p-5"
      >
        <div className="pointer-events-auto flex max-w-[55%] flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.1] bg-black/65 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#C8C9BC] backdrop-blur-md transition hover:border-[#C4A574]/35 hover:text-[#F3E4C9] sm:px-3.5"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            <span className="sm:hidden">Home</span>
            <span className="hidden sm:inline">Landing</span>
          </Link>
          {!isNarrow && (
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.08] bg-black/55 px-3.5 py-2 backdrop-blur-md">
              <span
                className="inline-block h-1.5 w-1.5 rotate-45 bg-[#8B5E3C]"
                aria-hidden
              />
              <span className="font-display text-sm font-semibold tracking-tight text-[#F3E4C9]">
                Guide to Indian Data
              </span>
            </span>
          )}
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center rounded-full border border-white/[0.1] bg-black/65 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#C8C9BC] backdrop-blur-md transition hover:border-[#C4A574]/35 hover:text-[#F3E4C9] sm:px-3.5"
          >
            About
          </Link>
          <button
            type="button"
            onClick={() => setGuideOpen((v) => !v)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#C4A574]/30 bg-black/65 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F3E4C9] backdrop-blur-md transition hover:bg-[#C4A574]/15 sm:px-4"
            aria-expanded={guideOpen}
            aria-controls="map-guide"
          >
            <Sparkles className="size-3.5 text-[#C4A574]" aria-hidden />
            <span className="sm:hidden">{guideOpen ? "Hide" : "Guide"}</span>
            <span className="hidden sm:inline">
              {guideOpen ? "Hide guide" : "How to navigate"}
            </span>
          </button>
        </div>
      </header>

      {/* Navigation guide */}
      {guideOpen && (
        <aside
          id="map-guide"
          className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-30 max-h-[min(70dvh,28rem)] w-[min(100%-1.5rem,22rem)] overflow-y-auto rounded-2xl border border-white/[0.1] bg-black/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:bottom-6 sm:left-5 sm:p-5"
          aria-label="How to navigate the map"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
            How to navigate
          </p>
          <h1 className="font-display mt-1.5 text-lg font-semibold text-[#F3E4C9]">
            Solar system map
          </h1>
          <ol className="mt-4 space-y-3">
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#C4A574]/25 bg-[#C4A574]/10 text-[#C4A574]">
                <Orbit className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-[#F3E4C9]">
                  1. Tap a theme sun
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#C8C9BC]/90">
                  Health, labour, trade… Datasets that live there light up.
                  Multi-theme links show as dashed visitors.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#C4A574]/25 bg-[#C4A574]/10 text-[#C4A574]">
                <CircleDot className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-[#F3E4C9]">
                  2. Tap a dataset
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#C8C9BC]/90">
                  Small nodes orbit their home sun. Select one to see its name
                  and the Open button.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#C4A574]/25 bg-[#C4A574]/10 text-[#C4A574]">
                <MousePointer2 className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-[#F3E4C9]">
                  3. Open the full page
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#C8C9BC]/90">
                  Double-tap the node—or use{" "}
                  <span className="text-[#F3E4C9]">Open →</span>—for access,
                  guides, variables, and previous-round background.
                </p>
              </div>
            </li>
          </ol>
          <p className="mt-4 border-t border-white/[0.08] pt-3 text-[11px] leading-relaxed text-[#C8C9BC]/75">
            Esc clears selection · solid lines = home orbit · dashed = also
            linked to this theme
          </p>
          <button
            type="button"
            onClick={() => setGuideOpen(false)}
            className="mt-3 w-full min-h-11 rounded-lg border border-white/10 bg-white/[0.04] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8C9BC] transition hover:border-[#C4A574]/30 hover:text-[#F3E4C9]"
          >
            Got it — explore the map
          </button>
        </aside>
      )}

      {!guideOpen && (
        <p className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 z-20 px-4 text-center text-[10px] uppercase tracking-[0.18em] text-white/30">
          Theme → dataset → open page
        </p>
      )}
    </div>
  );
}
