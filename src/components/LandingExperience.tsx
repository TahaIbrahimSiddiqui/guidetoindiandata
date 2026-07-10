"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ObsidianGraphFull } from "@/components/ObsidianGraphFull";

/**
 * Locomotive-inspired intro: bold staggered type, minimal chrome,
 * then full-screen graph on enter.
 */
export function LandingExperience() {
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);

  const enter = useCallback(() => {
    if (entered || exiting) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setEntered(true);
      return;
    }
    setExiting(true);
    window.setTimeout(() => {
      setEntered(true);
      setExiting(false);
    }, 800);
  }, [entered, exiting]);

  useEffect(() => {
    if (entered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enter, entered]);

  return (
    <div className="fixed inset-0 bg-[#0A2947]">
      {(entered || exiting) && <ObsidianGraphFull />}

      {!entered && (
        <div
          className={`absolute inset-0 z-20 flex flex-col bg-[#0A2947] transition-all duration-[800ms] ${
            exiting
              ? "-translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C]"
                aria-hidden
              />
              <span className="font-display text-sm font-semibold tracking-tight text-[#F3E4C9]">
                Indian Data Guide
                <span className="align-super text-[0.65em] text-[#C4A574]/80">
                  ®
                </span>
              </span>
            </div>
            <nav
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#E0E1D4] sm:gap-4"
              aria-label="Landing"
            >
              <Link
                href="/explore"
                className="inline-flex min-h-11 items-center px-2 link-underline hover:text-[#F3E4C9]"
              >
                Explore
              </Link>
              <Link
                href="/academic"
                className="inline-flex min-h-11 items-center px-2 link-underline hover:text-[#F3E4C9]"
              >
                Academic
              </Link>
              <Link
                href="/series"
                className="inline-flex min-h-11 items-center px-2 link-underline hover:text-[#F3E4C9]"
              >
                Series
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-12 px-6 py-8 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] lg:px-14">
            <section>
            <p className="eyebrow loco-fade mb-8">
              India · Data · Discovery
            </p>

            <h1 className="font-display max-w-5xl text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[1.05] text-[#F3E4C9]">
              <span className="loco-line">
                <span>National data,</span>
              </span>
              <span className="loco-line">
                <span>mapped for</span>
              </span>
              <span className="loco-line">
                <span>research.</span>
              </span>
            </h1>

            <p className="loco-fade mt-8 max-w-lg text-base leading-relaxed text-[#D3D4C0] sm:text-lg">
              Government surveys, academic archives, and community GitHub
              sources, wired as a neural network with honest access friction
              and practical starting points.
            </p>

            <div className="loco-fade mt-12 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={enter}
                className="group inline-flex min-h-12 items-center gap-3 border border-[#F3E4C9]/30 bg-transparent px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F3E4C9] transition-all duration-500 hover:border-[#F3E4C9] hover:bg-[#F3E4C9] hover:text-[#0A2947] focus-visible:outline-offset-4"
              >
                Enter the graph
                <span
                  className="inline-block transition-transform duration-500 group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </button>
              <Link
                href="/explore"
                className="inline-flex min-h-11 items-center text-[11px] font-medium uppercase tracking-[0.18em] text-[#D3D4C0] link-underline hover:text-[#F3E4C9]"
              >
                Skip to catalog
              </Link>
            </div>
            </section>

            <aside
              className="loco-fade hidden rounded-md border border-[#D3D4C0]/18 bg-[#071F36]/55 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] lg:block"
              aria-label="Neural network preview"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
                  Neural preview
                </p>
                <span className="font-mono text-xs text-[#D3D4C0]/60">
                  22 lenses · 97 nodes
                </span>
              </div>
              <div
                className="relative mt-5 aspect-[1.08] overflow-hidden rounded-md border border-[#D3D4C0]/12 bg-[#0A2947]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 48%, rgba(196,165,116,0.18), transparent 26%), linear-gradient(rgba(211,212,192,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(211,212,192,0.04) 1px, transparent 1px)",
                  backgroundSize: "100% 100%, 34px 34px, 34px 34px",
                }}
              >
                <svg
                  className="absolute inset-0 size-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  {[
                    [48, 13, 50, 50],
                    [72, 35, 50, 50],
                    [66, 67, 50, 50],
                    [22, 32, 50, 50],
                    [34, 72, 50, 50],
                    [22, 32, 34, 72],
                    [72, 35, 66, 67],
                    [48, 13, 72, 35],
                  ].map(([x1, y1, x2, y2], index) => (
                    <line
                      key={index}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={
                        index < 5
                          ? "rgba(196,165,116,0.34)"
                          : "rgba(211,212,192,0.16)"
                      }
                      strokeWidth={index < 5 ? 0.35 : 0.18}
                    />
                  ))}
                </svg>
                {[
                  ["Population", "left-[48%] top-[13%]", "#F3E4C9"],
                  ["Health", "left-[72%] top-[35%]", "#E8D4B0"],
                  ["Education", "left-[66%] top-[67%]", "#B8B9A4"],
                  ["GitHub", "left-[22%] top-[32%]", "#8B9A8C"],
                  ["Climate", "left-[34%] top-[72%]", "#9BA88E"],
                ].map(([label, position, color]) => (
                  <div
                    key={label}
                    className={`absolute ${position} -translate-x-1/2 -translate-y-1/2`}
                  >
                    <span
                      className="mx-auto block size-4 rounded-full border border-[#F3E4C9]/35 shadow-[0_0_18px_rgba(243,228,201,0.18)]"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    <span className="mt-2 block whitespace-nowrap text-center text-xs font-semibold text-[#F3E4C9]">
                      {label}
                    </span>
                  </div>
                ))}
                <div className="absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C4A574]/42 bg-[#071F36]/95 p-5 text-center shadow-[0_0_42px_rgba(196,165,116,0.12)]">
                  <p className="font-display text-2xl font-semibold">
                    Neural atlas
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#D3D4C0]/70">
                    Lenses fire connected sources across official, academic,
                    and community data.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <footer className="loco-fade flex flex-wrap items-end justify-between gap-4 px-6 py-6 sm:px-10 lg:px-14">
            <p className="max-w-xs text-xs leading-relaxed text-[#D3D4C0]/70">
              Design and data are tools of expression. What sets this guide
              apart is honest access friction and interlinked sources.
            </p>
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.16em] text-[#D3D4C0]/60">
              <span>©{new Date().getFullYear()}</span>
              <button
                type="button"
                onClick={enter}
                className="text-[#C4A574] hover:text-[#F3E4C9]"
              >
                Press Enter
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
