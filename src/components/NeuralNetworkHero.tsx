"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clusters } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import type { ClusterId } from "@/types/dataset";

type NetNode = {
  id: string;
  label: string;
  kind: "cluster" | "dataset";
  clusterId: ClusterId;
  color: string;
  href: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

type NetEdge = { a: string; b: string };

const FEATURED_BY_CLUSTER: Partial<Record<ClusterId, string[]>> = {
  "health-demography": ["nfhs-5", "hmis", "srs-statistical-reports"],
  education: ["udise-plus", "nas-2021", "aser"],
  "labor-firms": ["plfs-annual-2023-24", "hces-2023-24", "asi-2023-24"],
  agriculture: ["agriculture-census-2015-16", "agmarknet", "sas-ag-households-2019"],
  "governance-justice": ["njdg", "crime-in-india", "lok-dhaba"],
  "climate-infra": ["imd-rainfall", "cpcb-aqi", "census-pca-2011"],
};

function buildGraph(width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const ring = Math.min(width, height) * 0.28;
  const nodes: NetNode[] = [];
  const edges: NetEdge[] = [];
  const byId = new Map<string, NetNode>();

  clusters.forEach((cluster, i) => {
    const angle = (i / clusters.length) * Math.PI * 2 - Math.PI / 2;
    const node: NetNode = {
      id: cluster.id,
      label: cluster.shortName,
      kind: "cluster",
      clusterId: cluster.id,
      color: cluster.color,
      href: `/explore?cluster=${cluster.id}`,
      x: cx + Math.cos(angle) * ring,
      y: cy + Math.sin(angle) * ring,
      vx: 0,
      vy: 0,
      r: 18,
    };
    nodes.push(node);
    byId.set(node.id, node);
  });

  // ring edges between neighboring clusters
  for (let i = 0; i < clusters.length; i++) {
    edges.push({
      a: clusters[i].id,
      b: clusters[(i + 1) % clusters.length].id,
    });
  }

  clusters.forEach((cluster, i) => {
    const baseAngle = (i / clusters.length) * Math.PI * 2 - Math.PI / 2;
    const slugs = FEATURED_BY_CLUSTER[cluster.id] ?? [];
    slugs.forEach((slug, j) => {
      const ds = datasets.find((d) => d.slug === slug);
      if (!ds) return;
      const spread = (j - (slugs.length - 1) / 2) * 0.28;
      const angle = baseAngle + spread;
      const dist = ring + 70 + j * 12;
      const node: NetNode = {
        id: slug,
        label: ds.shortTitle,
        kind: "dataset",
        clusterId: cluster.id,
        color: cluster.color,
        href: `/datasets/${slug}`,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        r: 8,
      };
      nodes.push(node);
      byId.set(node.id, node);
      edges.push({ a: cluster.id, b: slug });
    });
  });

  // a few cross links from pairsWith among featured
  const featured = new Set(nodes.filter((n) => n.kind === "dataset").map((n) => n.id));
  datasets.forEach((d) => {
    if (!featured.has(d.slug)) return;
    d.pairsWith.forEach((other) => {
      if (featured.has(other) && d.slug < other) {
        edges.push({ a: d.slug, b: other });
      }
    });
  });

  return { nodes, edges, byId };
}

export function NeuralNetworkHero() {
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
    const h = Math.max(360, Math.min(560, rect.width * 0.55));
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
        // light force simulation
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.hypot(dx, dy) || 1;
            const minDist = a.r + b.r + 28;
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
          const target = a.kind === "cluster" && b.kind === "cluster" ? 140 : 70;
          const f = ((dist - target) / dist) * 0.004;
          a.vx += dx * f;
          a.vy += dy * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
        });
        nodes.forEach((n) => {
          // gentle pull to origin ring layout center
          n.vx += (w / 2 - n.x) * 0.0004;
          n.vy += (h / 2 - n.y) * 0.0004;
          n.vx *= 0.9;
          n.vy *= 0.9;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + 8, Math.min(w - n.r - 8, n.x));
          n.y = Math.max(n.r + 8, Math.min(h - n.r - 8, n.y));
        });
      }

      ctx.clearRect(0, 0, w, h);

      // soft vignette glow
      const g = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.45);
      g.addColorStop(0, "rgba(34, 211, 238, 0.06)");
      g.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      edges.forEach((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return;
        const active =
          hover && (hover === a.id || hover === b.id || hover === a.clusterId);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = active
          ? "rgba(34, 211, 238, 0.55)"
          : "rgba(148, 163, 184, 0.18)";
        ctx.lineWidth = active ? 1.5 : 1;
        ctx.stroke();
      });

      nodes.forEach((n) => {
        const isHover = hover === n.id;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (isHover ? 3 : 0), 0, Math.PI * 2);
        ctx.fillStyle = n.color + (n.kind === "cluster" ? "cc" : "99");
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isHover ? 18 : n.kind === "cluster" ? 10 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.stroke();

        if (n.kind === "cluster" || isHover) {
          ctx.font =
            n.kind === "cluster"
              ? "600 12px IBM Plex Sans, system-ui, sans-serif"
              : "500 11px IBM Plex Sans, system-ui, sans-serif";
          ctx.fillStyle = isHover ? "#e2e8f0" : "rgba(226,232,240,0.85)";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + n.r + 14);
        }
      });

      if (!reduced) {
        state.raf = requestAnimationFrame(draw);
      }
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

  const onMove = (e: React.MouseEvent) => {
    const n = hitTest(e.clientX, e.clientY);
    setHover(n?.id ?? null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = n ? "pointer" : "default";
    }
  };

  const onClick = (e: React.MouseEvent) => {
    const n = hitTest(e.clientX, e.clientY);
    if (n) router.push(n.href);
  };

  const legend = useMemo(
    () => clusters.map((c) => ({ id: c.id, name: c.shortName, color: c.color })),
    []
  );

  return (
    <div className="relative w-full" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="w-full rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950"
        role="img"
        aria-label="Interactive neural network of Indian data clusters and featured datasets. Click a node to explore."
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        onClick={onClick}
      />
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {legend.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => router.push(`/explore?cluster=${item.id}`)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            {item.name}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        Hover nodes for labels · click to open a cluster or dataset
        {reduced ? " · motion reduced" : ""}
      </p>
    </div>
  );
}
