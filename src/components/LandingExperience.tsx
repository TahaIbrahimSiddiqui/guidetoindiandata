"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MousePointerClick } from "lucide-react";

/** Served from public/ (copied from content/). Respects GitHub Pages basePath. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/guidetoindiandata";
const LANDING_VIDEO = `${BASE}/videos/indian-street-market-background-web-1080p-muted.mp4`;

/**
 * Landing only: full-viewport cinematic gate.
 * Click / keyboard anywhere → zoom-out → solar system map (/map).
 */
export function LandingExperience() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [phase, setPhase] = useState<"idle" | "zooming">("idle");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  // Autoplay muted loop (file is already muted); retry play if browser blocks briefly
  useEffect(() => {
    if (reduced) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    const tryPlay = () => {
      void el.play().then(() => setVideoReady(true)).catch(() => {
        // Still show first frame if autoplay fails
        setVideoReady(true);
      });
    };
    if (el.readyState >= 2) tryPlay();
    else el.addEventListener("loadeddata", tryPlay, { once: true });
    return () => el.removeEventListener("loadeddata", tryPlay);
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
    window.setTimeout(() => {
      router.push("/map");
    }, 920);
  }, [phase, reduced, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        enterMap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterMap]);

  const zooming = phase === "zooming";

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-[#F3E4C9]">
      {/* Deep space underlay — revealed as landing zooms out */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 45%, rgba(40, 28, 18, 0.55), transparent 60%),
            radial-gradient(circle at 20% 30%, rgba(196,165,116,0.06), transparent 35%),
            radial-gradient(circle at 80% 70%, rgba(80,60,120,0.08), transparent 40%),
            #000
          `,
        }}
      />
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          zooming ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        {Array.from({ length: 48 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#F3E4C9]"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: i % 5 === 0 ? 2 : 1,
              height: i % 5 === 0 ? 2 : 1,
              opacity: 0.15 + (i % 7) * 0.08,
            }}
          />
        ))}
      </div>

      {/* Clickable stage */}
      <button
        type="button"
        onClick={enterMap}
        disabled={zooming}
        aria-label="Enter the solar system map"
        className={`relative z-10 flex min-h-dvh w-full cursor-pointer flex-col border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#C4A574]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          zooming ? "pointer-events-none" : ""
        }`}
        style={{
          transformOrigin: "50% 45%",
          transform: zooming ? "scale(0.28)" : "scale(1)",
          opacity: zooming ? 0 : 1,
          filter: zooming ? "blur(6px)" : "blur(0)",
          transition: reduced
            ? "none"
            : "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.75s ease-out, filter 0.75s ease-out",
        }}
      >
        {/* Local video background */}
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
          {/* Cover scrim — half the previous opacity so the video reads clearly */}
          <div
            className="absolute inset-0"
            style={{
              background: reduced
                ? `
                  radial-gradient(ellipse 80% 55% at 55% 35%, rgba(139,94,60,0.11), transparent 58%),
                  radial-gradient(ellipse 50% 40% at 15% 85%, rgba(196,165,116,0.05), transparent 50%),
                  linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(12,12,12,0.5) 55%, rgba(0,0,0,0.5) 100%)
                `
                : `
                  linear-gradient(180deg, rgba(0,0,0,0.36) 0%, rgba(0,0,0,0.19) 42%, rgba(0,0,0,0.41) 100%),
                  linear-gradient(105deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.28) 100%)
                `,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 36%, rgba(0,0,0,0.34) 100%)",
            }}
          />
        </div>

        {/* Brand strip */}
        <div className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12">
          <span className="flex items-center gap-2.5">
            <span
              className="inline-block h-2 w-2 rotate-45 bg-[#8B5E3C]"
              aria-hidden
            />
            <span className="font-display text-sm font-semibold tracking-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
              Guide to Indian Data
              <span className="align-super text-[0.65em] text-[#C4A574]/85">
                ®
              </span>
            </span>
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[#C8C9BC] drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] sm:inline">
            Public research catalog
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-28 pt-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C8C9BC] drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
              India · Data · Discovery
            </p>
            <h1 className="font-display max-w-5xl text-[clamp(2.5rem,7.5vw,5.5rem)] font-bold leading-[1.06] tracking-tight text-[#F3E4C9] drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]">
              Guide to
              <br />
              Indian Data
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-[#E4E2D4] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] sm:text-lg">
              Themes are suns. Datasets orbit them. Click a sun, then a
              dataset—open the record for guides, variables, and access truth.
            </p>
          </div>
        </div>

        {/* Affordance */}
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex flex-col items-center gap-3 px-4">
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F3E4C9] backdrop-blur-md transition ${
              zooming ? "opacity-0" : "opacity-100"
            }`}
          >
            <MousePointerClick className="size-4 text-[#C4A574]" aria-hidden />
            Click anywhere to enter the map
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            Enter · Space · or click
          </span>
        </div>
      </button>

      <div className="sr-only">
        <Link href="/map">Open solar system map</Link>
      </div>

      {zooming && (
        <p
          className="pointer-events-none absolute inset-x-0 bottom-12 z-30 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]"
          aria-live="polite"
        >
          Entering the map…
        </p>
      )}
    </div>
  );
}
