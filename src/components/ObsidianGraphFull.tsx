"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildInterlinkedGraph,
  getFocusSet,
  type GraphNodeDef,
} from "@/lib/graphData";

type SimNode = GraphNodeDef & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

type SimEdge = { a: string; b: string; kind: string };

export function ObsidianGraphFull() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [lastSourceClick, setLastSourceClick] = useState<{
    id: string;
    t: number;
  } | null>(null);

  const graph = useMemo(() => buildInterlinkedGraph(), []);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedId;

  const stateRef = useRef<{
    nodes: SimNode[];
    edges: SimEdge[];
    byId: Map<string, SimNode>;
    w: number;
    h: number;
    raf: number;
  } | null>(null);

  const focusSet = useMemo(
    () => getFocusSet(selectedId, graph.nodes, graph.edges),
    [selectedId, graph]
  );
  const focusRef = useRef(focusSet);
  focusRef.current = focusSet;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const initSim = useCallback(
    (w: number, h: number) => {
      const cx = w / 2;
      const cy = h / 2;
      // Themes near screen edge — full viewport use
      const themeRing = Math.min(w, h) * 0.42;

      const themes = graph.nodes.filter((n) => n.kind === "theme");
      const sources = graph.nodes.filter((n) => n.kind === "source");

      const nodes: SimNode[] = [];
      themes.forEach((n, i) => {
        const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
        nodes.push({
          ...n,
          x: cx + Math.cos(angle) * themeRing,
          y: cy + Math.sin(angle) * themeRing,
          vx: 0,
          vy: 0,
          r: 14,
        });
      });

      // Sources scattered across full screen (not all center-clustered)
      sources.forEach((n, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const maxRow = Math.ceil(sources.length / 8) || 1;
        const x =
          w * (0.12 + (col / 7) * 0.76) + (Math.random() - 0.5) * 40;
        const y =
          h * (0.14 + (row / Math.max(maxRow - 1, 1)) * 0.72) +
          (Math.random() - 0.5) * 36;
        nodes.push({
          ...n,
          x: Math.min(w - 24, Math.max(24, x)),
          y: Math.min(h - 48, Math.max(56, y)),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 6,
        });
      });

      const byId = new Map(nodes.map((n) => [n.id, n]));
      const edges: SimEdge[] = graph.edges.map((e) => ({
        a: e.a,
        b: e.b,
        kind: e.kind,
      }));

      return {
        nodes,
        edges,
        byId,
        w,
        h,
        raf: stateRef.current?.raf ?? 0,
      };
    },
    [graph]
  );

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const prev = stateRef.current;
    const next = initSim(w, h);
    if (prev && prev.w === w && prev.h === h) {
      for (const n of next.nodes) {
        const p = prev.byId.get(n.id);
        if (p) {
          n.x = p.x;
          n.y = p.y;
          n.vx = p.vx;
          n.vy = p.vy;
        }
      }
      next.byId = new Map(next.nodes.map((n) => [n.id, n]));
    }
    stateRef.current = next;
  }, [initSim]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let alive = true;

    const draw = () => {
      const state = stateRef.current;
      if (!state || !alive) return;
      const { nodes, edges, byId, w, h } = state;
      const focus = focusRef.current;
      const hasFocus = focus.size > 0;

      if (!reduced) {
        // Soft repulsion only
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist =
              a.r + b.r + (a.kind === "theme" || b.kind === "theme" ? 28 : 16);
            if (dist < minDist) {
              const f = ((minDist - dist) / dist) * 0.035;
              a.vx -= dx * f;
              a.vy -= dy * f;
              b.vx += dx * f;
              b.vy += dy * f;
            }
          }
        }

        // Springs: theme–source pull lightly; no strong center gravity
        edges.forEach((e) => {
          if (e.kind === "theme-ring") return; // don't collapse via ring
          const a = byId.get(e.a);
          const b = byId.get(e.b);
          if (!a || !b) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const target = e.kind === "theme-source" ? 160 : 90;
          const strength = e.kind === "theme-source" ? 0.0012 : 0.002;
          const f = ((dist - target) / dist) * strength;
          a.vx += dx * f;
          a.vy += dy * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
        });

        // Themes gently anchored on outer ring (full screen)
        const cx = w / 2;
        const cy = h / 2;
        const themeRing = Math.min(w, h) * 0.42;
        const themes = nodes.filter((n) => n.kind === "theme");
        themes.forEach((n, i) => {
          const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
          const tx = cx + Math.cos(angle) * themeRing;
          const ty = cy + Math.sin(angle) * themeRing;
          n.vx += (tx - n.x) * 0.018;
          n.vy += (ty - n.y) * 0.018;
        });

        // Very mild pull so sources don't leave the viewport — NOT to center
        nodes.forEach((n) => {
          if (n.kind === "source") {
            if (n.x < w * 0.08) n.vx += 0.15;
            if (n.x > w * 0.92) n.vx -= 0.15;
            if (n.y < h * 0.12) n.vy += 0.15;
            if (n.y > h * 0.9) n.vy -= 0.15;
          }
          n.vx *= 0.88;
          n.vy *= 0.88;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + 12, Math.min(w - n.r - 12, n.x));
          n.y = Math.max(n.r + 52, Math.min(h - n.r - 44, n.y));
        });
      }

      // Brand navy canvas
      ctx.fillStyle = "#0A2947";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.55);
      g.addColorStop(0, "rgba(243, 228, 201, 0.06)");
      g.addColorStop(1, "rgba(10, 41, 71, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Edges: when theme focused, only theme-source to that theme; never light ring to other themes
      edges.forEach((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return;

        let drawLit = false;
        if (!hasFocus) {
          drawLit = e.kind !== "theme-ring";
          ctx.globalAlpha = e.kind === "theme-ring" ? 0.1 : 0.28;
        } else if (e.kind === "theme-source") {
          drawLit = focus.has(a.id) && focus.has(b.id);
          ctx.globalAlpha = drawLit ? 0.75 : 0.05;
        } else if (e.kind === "source-source") {
          const sel = selectedRef.current;
          const selNode = sel ? byId.get(sel) : null;
          drawLit =
            selNode?.kind === "source" &&
            focus.has(a.id) &&
            focus.has(b.id);
          ctx.globalAlpha = drawLit ? 0.45 : 0.04;
        } else {
          ctx.globalAlpha = 0.05;
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = drawLit
          ? "rgba(243, 228, 201, 0.75)"
          : "rgba(211, 212, 192, 0.25)";
        ctx.lineWidth = drawLit ? 1.5 : 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      const ordered = [...nodes].sort((a, b) => {
        const af = !hasFocus || focus.has(a.id) ? 1 : 0;
        const bf = !hasFocus || focus.has(b.id) ? 1 : 0;
        return af - bf;
      });

      ordered.forEach((n) => {
        const lit = !hasFocus || focus.has(n.id);
        const isHover = hover === n.id;
        const isSel = selectedRef.current === n.id;
        ctx.globalAlpha = lit ? 1 : 0.12;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (isHover || isSel ? 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = lit && (isSel || n.kind === "theme") ? n.color : "transparent";
        ctx.shadowBlur = isSel ? 20 : lit && n.kind === "theme" ? 10 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = lit
          ? "rgba(243, 228, 201, 0.45)"
          : "rgba(211, 212, 192, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (n.kind === "theme" || (lit && (isHover || n.kind === "source"))) {
          ctx.font =
            n.kind === "theme"
              ? "600 11px var(--font-plex-sans), system-ui, sans-serif"
              : "500 9px var(--font-plex-sans), system-ui, sans-serif";
          ctx.fillStyle = lit ? "#F3E4C9" : "#6B7A88";
          ctx.textAlign = "center";
          const label =
            n.kind === "theme" && n.label.length > 14
              ? n.label.slice(0, 12) + "…"
              : n.label;
          ctx.fillText(label, n.x, n.y + n.r + 12);
        }
        ctx.globalAlpha = 1;
      });

      if (!reduced) state.raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      alive = false;
      if (stateRef.current?.raf) cancelAnimationFrame(stateRef.current.raf);
    };
  }, [hover, reduced, selectedId]);

  const hitTest = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (let i = state.nodes.length - 1; i >= 0; i--) {
      const n = state.nodes[i];
      if (Math.hypot(n.x - x, n.y - y) <= n.r + 8) return n;
    }
    return null;
  }, []);

  const selectedNode = graph.nodes.find((n) => n.id === selectedId);
  const focusedSources = useMemo(() => {
    if (!selectedId) return 0;
    let c = 0;
    focusSet.forEach((id) => {
      if (id.startsWith("s:") || id.startsWith("d:")) c++;
    });
    return c;
  }, [focusSet, selectedId]);

  const onClick = (e: React.MouseEvent) => {
    const n = hitTest(e.clientX, e.clientY);
    if (!n) {
      setSelectedId(null);
      return;
    }
    if (n.kind === "theme") {
      setSelectedId((prev) => (prev === n.id ? null : n.id));
      return;
    }
    const now = Date.now();
    if (
      lastSourceClick &&
      lastSourceClick.id === n.id &&
      now - lastSourceClick.t < 1200 &&
      n.href
    ) {
      router.push(n.href);
      return;
    }
    setLastSourceClick({ id: n.id, t: now });
    setSelectedId(n.id);
  };

  return (
    <div className="fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden bg-[#0A2947]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Full-screen interlinked data graph. Click a theme to highlight only its connected datasets."
        onMouseMove={(e) => {
          const n = hitTest(e.clientX, e.clientY);
          setHover(n?.id ?? null);
          if (canvasRef.current)
            canvasRef.current.style.cursor = n ? "pointer" : "default";
        }}
        onMouseLeave={() => setHover(null)}
        onClick={onClick}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-5 sm:p-8">
        <div className="pointer-events-auto max-w-md">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-[#8B5E3C]" />
            <p className="font-display text-sm font-semibold tracking-tight text-[#F3E4C9]">
              Indian Data Guide®
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#D3D4C0]/80">
            {selectedNode
              ? selectedNode.kind === "theme"
                ? `${selectedNode.label} — ${focusedSources} sources · others dim`
                : `${selectedNode.label} · double-click or open`
              : "Click a theme. Only linked sources light up."}
          </p>
          {selectedNode?.kind === "source" && selectedNode.href && (
            <button
              type="button"
              className="mt-3 border border-[#F3E4C9]/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F3E4C9] transition hover:bg-[#F3E4C9] hover:text-[#0A2947]"
              onClick={() => router.push(selectedNode.href!)}
            >
              Open {selectedNode.label} →
            </button>
          )}
        </div>
        <nav className="pointer-events-auto flex flex-wrap justify-end gap-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#D3D4C0]">
          {[
            { href: "/academic", label: "Academic" },
            { href: "/series", label: "Series" },
            { href: "/explore", label: "Explore" },
            { href: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline hover:text-[#F3E4C9]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="pointer-events-none absolute bottom-5 left-0 right-0 z-10 px-4 text-center text-[10px] uppercase tracking-[0.18em] text-[#D3D4C0]/40">
        Esc clears · theme focus is exclusive
      </p>
    </div>
  );
}
