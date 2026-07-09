"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getGraphChildrenForCluster,
  getThemeNodes,
} from "@/lib/graphData";
import type { ClusterId } from "@/types/dataset";

type NetNode = {
  id: string;
  label: string;
  kind: "theme" | "child";
  clusterId: ClusterId;
  color: string;
  href?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  active: boolean;
};

type NetEdge = { a: string; b: string };

const PURPLE = "#a78bfa";
const PURPLE_DIM = "#7c3aed";
const GRAY = "#525252";

export function ObsidianGraphFull() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeTheme, setActiveTheme] = useState<ClusterId | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const activeRef = useRef<ClusterId | null>(null);
  activeRef.current = activeTheme;

  const stateRef = useRef<{
    nodes: NetNode[];
    edges: NetEdge[];
    byId: Map<string, NetNode>;
    w: number;
    h: number;
    raf: number;
  } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const rebuild = useCallback((w: number, h: number, theme: ClusterId | null) => {
    const cx = w / 2;
    const cy = h / 2;
    const ring = Math.min(w, h) * 0.28;
    const themes = getThemeNodes();
    const nodes: NetNode[] = [];
    const edges: NetEdge[] = [];
    const byId = new Map<string, NetNode>();

    themes.forEach((t, i) => {
      const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
      const isActive = theme === t.id;
      const dim = theme !== null && !isActive;
      const node: NetNode = {
        id: `t:${t.id}`,
        label: t.label,
        kind: "theme",
        clusterId: t.id,
        color: dim ? GRAY : isActive ? PURPLE : PURPLE_DIM,
        x: cx + Math.cos(angle) * ring,
        y: cy + Math.sin(angle) * ring,
        vx: 0,
        vy: 0,
        r: isActive ? 22 : 18,
        active: isActive || theme === null,
      };
      nodes.push(node);
      byId.set(node.id, node);
    });

    for (let i = 0; i < themes.length; i++) {
      edges.push({
        a: `t:${themes[i].id}`,
        b: `t:${themes[(i + 1) % themes.length].id}`,
      });
    }

    if (theme) {
      const children = getGraphChildrenForCluster(theme);
      const parent = byId.get(`t:${theme}`);
      const n = children.length || 1;
      children.forEach((ch, j) => {
        const angle =
          ((themes.findIndex((t) => t.id === theme) / themes.length) *
            Math.PI *
            2 -
            Math.PI / 2) +
          ((j - (n - 1) / 2) * 0.22);
        const dist = ring + 90 + (j % 4) * 18;
        const node: NetNode = {
          id: ch.id,
          label: ch.label,
          kind: "child",
          clusterId: theme,
          color: PURPLE,
          href: ch.href,
          x: (parent?.x ?? cx) + Math.cos(angle) * (dist - ring) * 0.15 + Math.cos(angle) * dist * 0.55,
          y: (parent?.y ?? cy) + Math.sin(angle) * (dist - ring) * 0.15 + Math.sin(angle) * dist * 0.55,
          vx: 0,
          vy: 0,
          r: 7,
          active: true,
        };
        // place around active theme
        const baseAngle =
          (themes.findIndex((t) => t.id === theme) / themes.length) * Math.PI * 2 -
          Math.PI / 2;
        const spread = ((j / n) * 2 - 1) * Math.min(1.2, 0.15 * n);
        node.x = cx + Math.cos(baseAngle + spread) * (ring + 100 + (j % 3) * 22);
        node.y = cy + Math.sin(baseAngle + spread) * (ring + 100 + (j % 3) * 22);
        nodes.push(node);
        byId.set(node.id, node);
        edges.push({ a: `t:${theme}`, b: ch.id });
      });
    }

    return { nodes, edges, byId, w, h, raf: stateRef.current?.raf ?? 0 };
  }, []);

  const resize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stateRef.current = rebuild(w, h, activeRef.current);
  }, [rebuild]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    stateRef.current = rebuild(st.w, st.h, activeTheme);
  }, [activeTheme, rebuild]);

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

      if (!reduced) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = a.r + b.r + 24;
            if (dist < minDist) {
              const f = ((minDist - dist) / dist) * 0.025;
              a.vx -= dx * f;
              a.vy -= dy * f;
              b.vx += dx * f;
              b.vy += dy * f;
            }
          }
        }
        edges.forEach((e) => {
          const a = byId.get(e.a);
          const b = byId.get(e.b);
          if (!a || !b) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const target =
            a.kind === "theme" && b.kind === "theme" ? 140 : 85;
          const f = ((dist - target) / dist) * 0.0035;
          a.vx += dx * f;
          a.vy += dy * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
        });
        nodes.forEach((n) => {
          n.vx += (w / 2 - n.x) * 0.00025;
          n.vy += (h / 2 - n.y) * 0.00025;
          n.vx *= 0.88;
          n.vy *= 0.88;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + 12, Math.min(w - n.r - 12, n.x));
          n.y = Math.max(n.r + 28, Math.min(h - n.r - 36, n.y));
        });
      }

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.5);
      g.addColorStop(0, "rgba(124, 58, 237, 0.1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      edges.forEach((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return;
        const lit =
          a.kind === "child" ||
          b.kind === "child" ||
          (hover && (hover === a.id || hover === b.id));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = lit
          ? "rgba(167, 139, 250, 0.55)"
          : "rgba(82, 82, 82, 0.45)";
        ctx.lineWidth = lit ? 1.5 : 1;
        ctx.stroke();
      });

      nodes.forEach((n) => {
        const isHover = hover === n.id;
        const glow = n.kind === "theme" && n.active && activeRef.current === n.clusterId;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (isHover || glow ? 3 : 0), 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = glow || isHover ? PURPLE : "transparent";
        ctx.shadowBlur = glow ? 22 : isHover ? 14 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Labels: always for themes; for children when visible
        if (n.kind === "theme" || n.kind === "child") {
          ctx.font =
            n.kind === "theme"
              ? "600 13px var(--font-plex-sans), system-ui, sans-serif"
              : "500 11px var(--font-plex-sans), system-ui, sans-serif";
          ctx.fillStyle =
            n.kind === "theme" && activeRef.current && activeRef.current !== n.clusterId
              ? "#737373"
              : "#f5f5f5";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + n.r + 16);
        }
      });

      if (!reduced) state.raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      alive = false;
      if (stateRef.current?.raf) cancelAnimationFrame(stateRef.current.raf);
    };
  }, [hover, reduced, activeTheme]);

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

  const onClick = (e: React.MouseEvent) => {
    const n = hitTest(e.clientX, e.clientY);
    if (!n) return;
    if (n.kind === "theme") {
      setActiveTheme((prev) =>
        prev === n.clusterId ? null : n.clusterId
      );
      return;
    }
    if (n.href) router.push(n.href);
  };

  const activeName = activeTheme
    ? getThemeNodes().find((t) => t.id === activeTheme)?.fullLabel
    : null;

  return (
    <div ref={wrapRef} className="fixed inset-0 z-0 bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Full-page theme graph. Click a major theme to light related datasets."
        onMouseMove={(e) => {
          const n = hitTest(e.clientX, e.clientY);
          setHover(n?.id ?? null);
          if (canvasRef.current)
            canvasRef.current.style.cursor = n ? "pointer" : "default";
        }}
        onMouseLeave={() => setHover(null)}
        onClick={onClick}
      />

      {/* Floating chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-6">
        <div className="pointer-events-auto">
          <p className="text-sm font-semibold text-white">Indian Data Guide</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {activeName
              ? `${activeName} — related sources lit`
              : "Themes only — click a theme to light datasets"}
          </p>
        </div>
        <nav className="pointer-events-auto flex flex-wrap gap-2 text-xs">
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

      <p className="pointer-events-none absolute bottom-4 left-0 right-0 z-10 text-center text-[11px] text-neutral-600">
        Click theme to expand · click again to collapse · click a source to open
      </p>
    </div>
  );
}
