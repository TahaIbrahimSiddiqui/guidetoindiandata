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

const PURPLE = "#a78bfa";

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
      const themeRing = Math.min(w, h) * 0.32;
      const sourceRing = Math.min(w, h) * 0.18;

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
          r: 20,
        });
      });
      sources.forEach((n, i) => {
        const angle = (i / Math.max(sources.length, 1)) * Math.PI * 2;
        const jitter = 40 + (i % 5) * 12;
        nodes.push({
          ...n,
          x: cx + Math.cos(angle) * (sourceRing + jitter),
          y: cy + Math.sin(angle) * (sourceRing + jitter),
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: 8,
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

    // preserve positions if possible
    const prev = stateRef.current;
    const next = initSim(w, h);
    if (prev) {
      for (const n of next.nodes) {
        const p = prev.byId.get(n.id);
        if (p) {
          n.x = Math.min(w - 20, Math.max(20, p.x));
          n.y = Math.min(h - 20, Math.max(20, p.y));
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
        // repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = a.r + b.r + (a.kind === "theme" || b.kind === "theme" ? 36 : 22);
            if (dist < minDist) {
              const f = ((minDist - dist) / dist) * 0.04;
              a.vx -= dx * f;
              a.vy -= dy * f;
              b.vx += dx * f;
              b.vy += dy * f;
            }
          }
        }
        // springs
        edges.forEach((e) => {
          const a = byId.get(e.a);
          const b = byId.get(e.b);
          if (!a || !b) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          let target = 100;
          if (e.kind === "theme-ring") target = 150;
          if (e.kind === "theme-source") target = 110;
          if (e.kind === "source-source") target = 70;
          const strength = e.kind === "theme-ring" ? 0.002 : 0.006;
          const f = ((dist - target) / dist) * strength;
          a.vx += dx * f;
          a.vy += dy * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
        });
        // anchors: themes soft pull to ring
        const cx = w / 2;
        const cy = h / 2;
        const themeRing = Math.min(w, h) * 0.32;
        const themes = nodes.filter((n) => n.kind === "theme");
        themes.forEach((n, i) => {
          const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
          const tx = cx + Math.cos(angle) * themeRing;
          const ty = cy + Math.sin(angle) * themeRing;
          n.vx += (tx - n.x) * 0.01;
          n.vy += (ty - n.y) * 0.01;
        });
        // mild center gravity for sources
        nodes.forEach((n) => {
          if (n.kind === "source") {
            n.vx += (cx - n.x) * 0.0004;
            n.vy += (cy - n.y) * 0.0004;
          }
          n.vx *= 0.86;
          n.vy *= 0.86;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + 10, Math.min(w - n.r - 10, n.x));
          n.y = Math.max(n.r + 48, Math.min(h - n.r - 40, n.y));
        });
      }

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.55);
      g.addColorStop(0, "rgba(124, 58, 237, 0.08)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      edges.forEach((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return;
        const inFocus =
          !hasFocus || (focus.has(a.id) && focus.has(b.id));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        if (inFocus) {
          ctx.strokeStyle =
            e.kind === "source-source"
              ? "rgba(167, 139, 250, 0.45)"
              : "rgba(167, 139, 250, 0.55)";
          ctx.lineWidth = hasFocus ? 1.6 : 1;
        } else {
          ctx.strokeStyle = "rgba(64, 64, 64, 0.2)";
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();
      });

      // draw dimmed first, then focused on top
      const ordered = [...nodes].sort((a, b) => {
        const af = !hasFocus || focus.has(a.id) ? 1 : 0;
        const bf = !hasFocus || focus.has(b.id) ? 1 : 0;
        return af - bf;
      });

      ordered.forEach((n) => {
        const lit = !hasFocus || focus.has(n.id);
        const isHover = hover === n.id;
        const isSel = selectedRef.current === n.id;
        ctx.globalAlpha = lit ? 1 : 0.18;
        ctx.beginPath();
        ctx.arc(
          n.x,
          n.y,
          n.r + (isHover || isSel ? 3 : 0),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = n.kind === "theme" ? n.color : lit ? PURPLE : "#525252";
        ctx.shadowColor = lit && (isSel || n.kind === "theme") ? n.color : "transparent";
        ctx.shadowBlur = isSel ? 24 : lit && n.kind === "theme" ? 12 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // labels: themes always; sources when lit or hover
        if (n.kind === "theme" || lit || isHover) {
          ctx.font =
            n.kind === "theme"
              ? "600 13px var(--font-plex-sans), system-ui, sans-serif"
              : "500 10px var(--font-plex-sans), system-ui, sans-serif";
          ctx.fillStyle = lit ? "#f5f5f5" : "#737373";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + n.r + 14);
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
    // source: second click within 1.2s opens; first focuses
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
    <div className="fixed inset-0 z-0 bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Interlinked Obsidian graph. All sources float. Click a theme to focus linked datasets. NFHS links to Health and Education."
        onMouseMove={(e) => {
          const n = hitTest(e.clientX, e.clientY);
          setHover(n?.id ?? null);
          if (canvasRef.current)
            canvasRef.current.style.cursor = n ? "pointer" : "default";
        }}
        onMouseLeave={() => setHover(null)}
        onClick={onClick}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="pointer-events-auto max-w-sm">
          <p className="text-sm font-semibold text-white">Indian Data Guide</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {selectedNode
              ? selectedNode.kind === "theme"
                ? `Focus: ${selectedNode.label} — multi-linked sources lit (incl. cross-theme like NFHS)`
                : `Focus: ${selectedNode.label} — linked themes & pairs lit · double-click to open`
              : "Everything floating · click a theme to focus · Esc clears"}
          </p>
          {selectedNode?.kind === "source" && selectedNode.href && (
            <button
              type="button"
              className="pointer-events-auto mt-2 rounded-md border border-violet-400/40 bg-violet-500/20 px-3 py-1.5 text-xs text-violet-100 hover:bg-violet-500/30"
              onClick={() => router.push(selectedNode.href!)}
            >
              Open {selectedNode.label}
            </button>
          )}
        </div>
        <nav className="pointer-events-auto flex flex-wrap justify-end gap-2 text-xs">
          {[
            { href: "/series", label: "Series" },
            { href: "/explore", label: "Explore" },
            { href: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md border border-white/10 bg-black/50 px-2.5 py-1.5 text-neutral-300 backdrop-blur hover:border-violet-400/40 hover:text-violet-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="pointer-events-none absolute bottom-4 left-0 right-0 z-10 px-4 text-center text-[11px] text-neutral-600">
        Interlinked graph · NFHS lights for Health and Education · double-click a
        source to open
      </p>
    </div>
  );
}
