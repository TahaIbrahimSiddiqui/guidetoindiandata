"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { clusters } from "@/data/clusters";
import { seriesList } from "@/data/series";

type NetNode = {
  id: string;
  label: string;
  kind: "cluster" | "series";
  color: string;
  href: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

type NetEdge = { a: string; b: string };

const PURPLE = "#a78bfa";
const PURPLE_DIM = "#7c3aed";

function buildGraph(width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const ring = Math.min(width, height) * 0.26;
  const nodes: NetNode[] = [];
  const edges: NetEdge[] = [];
  const byId = new Map<string, NetNode>();

  clusters.forEach((cluster, i) => {
    const angle = (i / clusters.length) * Math.PI * 2 - Math.PI / 2;
    const node: NetNode = {
      id: `c:${cluster.id}`,
      label: cluster.shortName,
      kind: "cluster",
      color: PURPLE_DIM,
      href: `/explore?cluster=${cluster.id}`,
      x: cx + Math.cos(angle) * ring,
      y: cy + Math.sin(angle) * ring,
      vx: 0,
      vy: 0,
      r: 16,
    };
    nodes.push(node);
    byId.set(node.id, node);
  });

  for (let i = 0; i < clusters.length; i++) {
    edges.push({
      a: `c:${clusters[i].id}`,
      b: `c:${clusters[(i + 1) % clusters.length].id}`,
    });
  }

  // Place series near their cluster
  const byCluster = new Map<string, typeof seriesList>();
  seriesList.forEach((s) => {
    const list = byCluster.get(s.cluster) ?? [];
    list.push(s);
    byCluster.set(s.cluster, list);
  });

  clusters.forEach((cluster, i) => {
    const baseAngle = (i / clusters.length) * Math.PI * 2 - Math.PI / 2;
    const list = byCluster.get(cluster.id) ?? [];
    list.forEach((s, j) => {
      const spread = (j - (list.length - 1) / 2) * 0.32;
      const angle = baseAngle + spread;
      const dist = ring + 78 + (j % 3) * 10;
      const node: NetNode = {
        id: `s:${s.slug}`,
        label: s.shortTitle,
        kind: "series",
        color: s.pinned ? PURPLE : "#9ca3af",
        href: `/series/${s.slug}`,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        r: s.pinned ? 10 : 7,
      };
      nodes.push(node);
      byId.set(node.id, node);
      edges.push({ a: `c:${cluster.id}`, b: node.id });
    });
  });

  // Link related series
  seriesList.forEach((s) => {
    s.pairsWithSeries?.forEach((other) => {
      if (s.slug < other) {
        edges.push({ a: `s:${s.slug}`, b: `s:${other}` });
      }
    });
  });

  return { nodes, edges, byId };
}

export function ObsidianGraphHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
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
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(320, rect.width);
    const h = Math.max(380, Math.min(520, rect.width * 0.52));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const graph = buildGraph(w, h);
    stateRef.current = {
      ...graph,
      w,
      h,
      raf: stateRef.current?.raf ?? 0,
    };
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

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
            const minDist = a.r + b.r + 26;
            if (dist < minDist) {
              const f = ((minDist - dist) / dist) * 0.02;
              dx *= f;
              dy *= f;
              a.vx -= dx;
              a.vy -= dy;
              b.vx += dx;
              b.vy += dy;
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
            a.kind === "cluster" && b.kind === "cluster" ? 130 : 72;
          const f = ((dist - target) / dist) * 0.004;
          a.vx += dx * f;
          a.vy += dy * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
        });
        nodes.forEach((n) => {
          n.vx += (w / 2 - n.x) * 0.00035;
          n.vy += (h / 2 - n.y) * 0.00035;
          n.vx *= 0.9;
          n.vy *= 0.9;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + 8, Math.min(w - n.r - 8, n.x));
          n.y = Math.max(n.r + 8, Math.min(h - n.r - 8, n.y));
        });
      }

      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.42);
      g.addColorStop(0, "rgba(124, 58, 237, 0.12)");
      g.addColorStop(1, "rgba(13, 13, 13, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      edges.forEach((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return;
        const active = hover && (hover === a.id || hover === b.id);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = active
          ? "rgba(167, 139, 250, 0.65)"
          : "rgba(167, 139, 250, 0.15)";
        ctx.lineWidth = active ? 1.6 : 1;
        ctx.stroke();
      });

      nodes.forEach((n) => {
        const isHover = hover === n.id;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (isHover ? 3 : 0), 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isHover ? 16 : n.kind === "cluster" ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (n.kind === "cluster" || isHover || n.r >= 10) {
          ctx.font = "600 11px var(--font-plex-sans), system-ui, sans-serif";
          ctx.fillStyle = isHover ? "#f5f3ff" : "rgba(229,231,235,0.85)";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + n.r + 13);
        }
      });

      if (!reduced) state.raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      alive = false;
      if (stateRef.current?.raf) cancelAnimationFrame(stateRef.current.raf);
    };
  }, [hover, reduced]);

  const hitTest = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (let i = state.nodes.length - 1; i >= 0; i--) {
      const n = state.nodes[i];
      if (Math.hypot(n.x - x, n.y - y) <= n.r + 6) return n;
    }
    return null;
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-obsidian-border bg-obsidian-panel"
        role="img"
        aria-label="Obsidian-style graph of data series and clusters. Click a series node to open its year timeline."
        onMouseMove={(e) => {
          const n = hitTest(e.clientX, e.clientY);
          setHover(n?.id ?? null);
          if (canvasRef.current)
            canvasRef.current.style.cursor = n ? "pointer" : "default";
        }}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          const n = hitTest(e.clientX, e.clientY);
          if (n) router.push(n.href);
        }}
      />
      <p className="mt-2 text-center text-xs text-obsidian-muted">
        Local graph · clusters (hubs) · series notes (NFHS, NSS PLFS, HCES…) · click to open
        {reduced ? " · motion reduced" : ""}
      </p>
    </div>
  );
}
