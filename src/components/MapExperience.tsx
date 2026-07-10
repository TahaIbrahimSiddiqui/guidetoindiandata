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
  const [guideOpen, setGuideOpen] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    // Entrance: map fades in after landing zoom-out
    const t = window.setTimeout(() => setEntered(true), reduced ? 0 : 40);
    return () => window.clearTimeout(t);
  }, [reduced]);

  return (
    <div
      className={`relative h-dvh w-screen overflow-hidden bg-black transition-opacity duration-700 ease-out ${
        entered ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Full-bleed solar system */}
      <div className="absolute inset-0">
        <ObsidianGraphFull embedded showChrome={false} />
      </div>

      {/* Top chrome */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.1] bg-black/65 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#C8C9BC] backdrop-blur-md transition hover:border-[#C4A574]/35 hover:text-[#F3E4C9]"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Landing
          </Link>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.08] bg-black/55 px-3.5 py-2 backdrop-blur-md">
            <span
              className="inline-block h-1.5 w-1.5 rotate-45 bg-[#8B5E3C]"
              aria-hidden
            />
            <span className="font-display text-sm font-semibold tracking-tight text-[#F3E4C9]">
              Indian Data Guide
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-[#C4A574]/30 bg-black/65 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F3E4C9] backdrop-blur-md transition hover:bg-[#C4A574]/15"
          aria-expanded={guideOpen}
          aria-controls="map-guide"
        >
          <Sparkles className="size-3.5 text-[#C4A574]" aria-hidden />
          {guideOpen ? "Hide guide" : "How to navigate"}
        </button>
      </header>

      {/* Navigation guide */}
      {guideOpen && (
        <aside
          id="map-guide"
          className="pointer-events-auto absolute bottom-5 left-4 z-30 w-[min(100%-2rem,22rem)] rounded-2xl border border-white/[0.1] bg-black/75 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:left-5 sm:bottom-6 sm:p-5"
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
                  1. Click a theme sun
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
                  2. Click a dataset
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#C8C9BC]/90">
                  Small nodes orbit their home sun. Select one to see its name
                  and links.
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
                  Double-click the node—or use{" "}
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
        <p className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 px-4 text-center text-[10px] uppercase tracking-[0.18em] text-white/30">
          Theme → dataset → open page · Esc clears
        </p>
      )}
    </div>
  );
}
