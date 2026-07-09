"use client";

import { useCallback, useEffect, useState } from "react";
import { ObsidianGraphFull } from "@/components/ObsidianGraphFull";

const STORAGE_KEY = "idg-entered-graph";

export function LandingExperience() {
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setEntered(true);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const enter = useCallback(() => {
    if (entered || exiting) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
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

  if (!ready) {
    return <div className="fixed inset-0 bg-black" aria-hidden />;
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Graph layer always under intro once ready */}
      {(entered || exiting) && <ObsidianGraphFull />}

      {!entered && (
        <div
          role="button"
          tabIndex={0}
          onClick={enter}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") enter();
          }}
          className={`absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center bg-black transition-transform duration-700 ease-in-out ${
            exiting ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{ transitionProperty: "transform, opacity" }}
          aria-label="Click to enter the graph"
        >
          <div
            className={`mb-8 h-3 w-3 rounded-full bg-violet-400 shadow-[0_0_24px_rgba(167,139,250,0.9)] ${
              reduced ? "" : "animate-pulse"
            }`}
            aria-hidden
          />
          <h1 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Indian Data Guide
          </h1>
          <p className="mt-4 max-w-md px-6 text-center text-sm text-neutral-500">
            A map of India&apos;s surveys and data portals
          </p>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-violet-400/90">
            Click to enter the graph
          </p>
          <p className="mt-2 text-xs text-neutral-600">or press Enter</p>
        </div>
      )}
    </div>
  );
}
