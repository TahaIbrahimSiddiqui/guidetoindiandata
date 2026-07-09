"use client";

import { useCallback, useEffect, useState } from "react";
import { ObsidianGraphFull } from "@/components/ObsidianGraphFull";

/**
 * Always show the navy intro on load/refresh.
 * Graph only after click (no sessionStorage skip).
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
    }, 700);
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
          role="button"
          tabIndex={0}
          onClick={enter}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") enter();
          }}
          className={`absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center bg-[#0A2947] transition-transform duration-700 ease-in-out ${
            exiting ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{ transitionProperty: "transform, opacity" }}
          aria-label="Click to enter the graph"
        >
          <div
            className={`mb-8 h-3 w-3 rounded-full bg-[#8B5E3C] shadow-[0_0_28px_rgba(243,228,201,0.45)] ${
              reduced ? "" : "animate-pulse"
            }`}
            aria-hidden
          />
          <h1 className="text-center text-3xl font-semibold tracking-tight text-[#F3E4C9] sm:text-5xl">
            Indian Data Guide
          </h1>
          <p className="mt-4 max-w-md px-6 text-center text-sm text-[#D3D4C0]">
            A map of India&apos;s surveys, academic archives, and community data
          </p>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-[#C4A574]">
            Click to enter the graph
          </p>
          <p className="mt-2 text-xs text-[#8B9A8C]">or press Enter</p>
        </div>
      )}
    </div>
  );
}
