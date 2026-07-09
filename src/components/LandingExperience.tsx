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
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const enter = useCallback(() => {
    if (entered || exiting) return;
    if (reduced) {
      setEntered(true);
      return;
    }
    setExiting(true);
    window.setTimeout(() => {
      setEntered(true);
      setExiting(false);
    }, 800);
  }, [entered, exiting, reduced]);

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
          {/* Top bar — Locomotive minimal */}
          <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C]"
                aria-hidden
              />
              <span className="font-display text-sm font-semibold tracking-tight text-[#F3E4C9]">
                Indian Data Guide®
              </span>
            </div>
            <nav className="flex items-center gap-6 text-[11px] font-medium uppercase tracking-[0.18em] text-[#D3D4C0]">
              <Link href="/explore" className="link-underline hover:text-[#F3E4C9]">
                Explore
              </Link>
              <Link href="/academic" className="link-underline hover:text-[#F3E4C9]">
                Academic
              </Link>
              <Link href="/series" className="link-underline hover:text-[#F3E4C9]">
                Series
              </Link>
            </nav>
          </header>

          {/* Hero */}
          <div className="flex flex-1 flex-col justify-center px-6 sm:px-10 lg:px-14">
            <p className={`eyebrow mb-8 ${reduced ? "" : "loco-fade"}`}>
              India · Data · Discovery
            </p>

            <h1 className="font-display max-w-5xl text-[clamp(2.75rem,9vw,7.5rem)] font-bold text-[#F3E4C9]">
              {reduced ? (
                <>
                  National data,
                  <br />
                  mapped for
                  <br />
                  research.
                </>
              ) : (
                <>
                  <span className="loco-line">
                    <span>National data,</span>
                  </span>
                  <span className="loco-line">
                    <span>mapped for</span>
                  </span>
                  <span className="loco-line">
                    <span>research.</span>
                  </span>
                </>
              )}
            </h1>

            <p
              className={`mt-8 max-w-lg text-base leading-relaxed text-[#D3D4C0] sm:text-lg ${
                reduced ? "" : "loco-fade"
              }`}
            >
              Government surveys, academic archives, and community GitHub
              sources—linked as a living graph. Enter to explore themes and
              sources.
            </p>

            <div
              className={`mt-12 flex flex-wrap items-center gap-6 ${
                reduced ? "" : "loco-fade"
              }`}
            >
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
          </div>

          {/* Bottom meta */}
          <footer
            className={`flex flex-wrap items-end justify-between gap-4 px-6 py-6 sm:px-10 lg:px-14 ${
              reduced ? "" : "loco-fade"
            }`}
          >
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
