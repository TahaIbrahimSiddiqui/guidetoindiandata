"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type StorySlide = {
  kicker?: string;
  title: string;
  subtitle?: string;
};

type Props = {
  slides: StorySlide[];
  /** Viewport heights of scroll for the whole sequence (default ~1.1 per slide). */
  vhPerSlide?: number;
  className?: string;
};

/**
 * Boilerlab-style scroll story:
 * sticky viewport; as you scroll, active line expands + fades, next line enters.
 * Scrub-driven (no GSAP) for light weight. Respects prefers-reduced-motion.
 */
export function ScrollStory({
  slides,
  vhPerSlide = 1.15,
  className = "",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  const totalVh = Math.max(1.5, slides.length * vhPerSlide);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    if (reduced) return;

    let raf = 0;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      // When sticky starts: rect.top <= 0
      const scrolled = Math.min(scrollable, Math.max(0, -rect.top));
      setProgress(scrolled / scrollable);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, slides.length]);

  const stages = useMemo(() => {
    const n = slides.length;
    return slides.map((slide, i) => {
      // Each slide owns an equal band of progress
      const start = i / n;
      const end = (i + 1) / n;
      const mid = (start + end) / 2;
      // Local 0→1 within band
      const local = clamp((progress - start) / (end - start || 1), 0, 1);

      // Enter 0–0.28, hold 0.28–0.55, expand+vanish 0.55–1
      let opacity = 0;
      let scale = 0.88;
      let blur = 8;
      let y = 36;

      if (local < 0.28) {
        const t = easeOutCubic(local / 0.28);
        opacity = t;
        scale = 0.88 + 0.12 * t;
        blur = 8 * (1 - t);
        y = 36 * (1 - t);
      } else if (local < 0.55) {
        opacity = 1;
        scale = 1;
        blur = 0;
        y = 0;
      } else {
        const t = easeInCubic((local - 0.55) / 0.45);
        // Expand and vanish (boilerlab feel)
        opacity = 1 - t;
        scale = 1 + 0.22 * t;
        blur = 12 * t;
        y = -28 * t;
      }

      // Soft-hide non-active for paint cost
      const near =
        progress >= start - 0.08 && progress <= end + 0.08 ? 1 : 0;
      if (!near && i !== 0) {
        opacity = 0;
      }

      return { slide, opacity, scale, blur, y, mid, i };
    });
  }, [progress, slides]);

  if (reduced) {
    return (
      <section className={`bg-black px-5 py-20 sm:px-8 lg:px-12 ${className}`}>
        <div className="mx-auto max-w-4xl space-y-16">
          {slides.map((s, i) => (
            <div key={i} className="text-center">
              {s.kicker && (
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4A574]">
                  {s.kicker}
                </p>
              )}
              <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight text-[#F5EAD4]">
                {s.title}
              </h2>
              {s.subtitle && (
                <p className="mx-auto mt-4 max-w-xl text-base text-[#C5C6B8]">
                  {s.subtitle}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`relative bg-black ${className}`}
      style={{ height: `${totalVh * 100}vh` }}
      aria-label="Scroll story"
    >
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden">
        {/* Subtle grade behind text */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 60% 45% at 50% 45%, rgba(154,106,69,0.12), transparent 60%),
              radial-gradient(ellipse 40% 30% at 70% 20%, rgba(245,234,212,0.04), transparent 50%),
              #000
            `,
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 text-center sm:px-8">
          {stages.map(({ slide, opacity, scale, blur, y, i }) => (
            <div
              key={i}
              className="absolute inset-x-5 top-1/2 sm:inset-x-8"
              style={{
                opacity,
                transform: `translateY(calc(-50% + ${y}px)) scale(${scale})`,
                filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
                willChange: "transform, opacity, filter",
                pointerEvents: opacity > 0.4 ? "auto" : "none",
              }}
              aria-hidden={opacity < 0.15}
            >
              {slide.kicker && (
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C4A574] sm:text-[11px]">
                  {slide.kicker}
                </p>
              )}
              <h2 className="font-display text-[clamp(2rem,6.5vw,4.5rem)] font-semibold leading-[1.08] tracking-tight text-[#F5EAD4]">
                {slide.title.split("\n").map((line, li) => (
                  <span key={li} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              {slide.subtitle && (
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#C5C6B8]/95 sm:text-lg">
                  {slide.subtitle}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Progress ticks */}
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2"
          aria-hidden
        >
          {slides.map((_, i) => {
            const start = i / slides.length;
            const end = (i + 1) / slides.length;
            const active = progress >= start && progress < end;
            const done = progress >= end;
            return (
              <span
                key={i}
                className="h-1 w-6 rounded-full transition-colors duration-200"
                style={{
                  background: active
                    ? "#C4A574"
                    : done
                      ? "rgba(196,165,116,0.45)"
                      : "rgba(255,255,255,0.15)",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number) {
  return t * t * t;
}
