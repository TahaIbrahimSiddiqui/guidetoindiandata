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
  /** Unique phase for ambient floating drift */
  phase: number;
  floatAmp: number;
};

type SimEdge = { a: string; b: string; kind: string };

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
  warm: boolean;
};

type Nebula = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: string;
  a: number;
  drift: number;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedStars(w: number, h: number, count = 260): Star[] {
  const rand = mulberry32((w * 73856093) ^ (h * 19349663) ^ 0x9e3779b9);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * w,
      y: rand() * h,
      r: 0.35 + rand() * 1.55,
      a: 0.12 + rand() * 0.55,
      phase: rand() * Math.PI * 2,
      speed: 0.35 + rand() * 1.5,
      warm: rand() > 0.78,
    });
  }
  return stars;
}

function seedNebulae(w: number, h: number): Nebula[] {
  const rand = mulberry32((w * 2654435761) ^ (h * 1597334677));
  const palette = [
    "rgba(139, 94, 60, 0.16)",
    "rgba(196, 165, 116, 0.12)",
    "rgba(80, 60, 120, 0.1)",
    "rgba(40, 80, 120, 0.08)",
    "rgba(243, 228, 201, 0.06)",
  ];
  const list: Nebula[] = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    list.push({
      x: rand() * w,
      y: rand() * h,
      rx: Math.min(w, h) * (0.2 + rand() * 0.32),
      ry: Math.min(w, h) * (0.14 + rand() * 0.24),
      color: palette[i % palette.length],
      a: 0.5 + rand() * 0.5,
      drift: rand() * Math.PI * 2,
    });
  }
  return list;
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(200,200,200,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Full-viewport Obsidian force graph with universe graphics:
 * deep space, starfield, nebulae, constellation edges, stellar nodes.
 */
export function ObsidianGraphFull({
  embedded = false,
}: {
  /** When true, fills parent section (scroll page) instead of fixed fullscreen. */
  embedded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
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
  const hoverRef = useRef<string | null>(null);
  hoverRef.current = hover;

  const stateRef = useRef<{
    nodes: SimNode[];
    edges: SimEdge[];
    byId: Map<string, SimNode>;
    stars: Star[];
    nebulae: Nebula[];
    shoot: ShootingStar | null;
    nextShoot: number;
    w: number;
    h: number;
    raf: number;
  } | null>(null);

  const focusSet = useMemo(
    () => getFocusSet(selectedId, graph.nodes, graph.edges),
    [selectedId, graph],
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
      // Wider theme ring so source clouds have room
      const themeRing = Math.min(w, h) * 0.42;

      const themes = graph.nodes.filter((n) => n.kind === "theme");
      const sources = graph.nodes.filter((n) => n.kind === "source");

      const nodes: SimNode[] = [];
      const themePos = new Map<
        string,
        { x: number; y: number; angle: number }
      >();

      themes.forEach((n, i) => {
        const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * themeRing;
        const y = cy + Math.sin(angle) * themeRing;
        themePos.set(n.id, { x, y, angle });
        nodes.push({
          ...n,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 13,
          phase: Math.random() * Math.PI * 2,
          floatAmp: 0.55 + Math.random() * 0.45,
        });
      });

      const byPrimary = new Map<string, GraphNodeDef[]>();
      sources.forEach((n) => {
        const primary = n.themeIds[0] ?? "data-catalogs";
        const key = `t:${primary}`;
        const list = byPrimary.get(key) ?? [];
        list.push(n);
        byPrimary.set(key, list);
      });

      // Spread datasets in wide arcs around each theme (not tight clusters)
      byPrimary.forEach((list, themeKey) => {
        const anchor = themePos.get(themeKey);
        const baseAngle = anchor?.angle ?? 0;
        const ax = anchor?.x ?? cx;
        const ay = anchor?.y ?? cy;

        list.forEach((n, j) => {
          const count = list.length;
          // Fan across a wide angle on the inward + tangential sides
          const fan =
            count === 1
              ? 0
              : (j / (count - 1) - 0.5) * Math.min(2.4, 0.35 + count * 0.14);
          // Radial distance grows with index — spiral so nodes don't stack
          const ring = Math.floor(j / 5);
          const dist =
            110 +
            ring * 48 +
            (j % 5) * 22 +
            Math.random() * 18;
          // Prefer outward from center so themes and sources use full viewport
          const a = baseAngle + fan * 0.85;
          const x = ax + Math.cos(a) * dist;
          const y = ay + Math.sin(a) * dist;
          nodes.push({
            ...n,
            x: Math.min(w - 24, Math.max(24, x)),
            y: Math.min(h - 48, Math.max(56, y)),
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: 4.5,
            phase: Math.random() * Math.PI * 2,
            floatAmp: 0.7 + Math.random() * 0.8,
          });
        });
      });

      const byId = new Map(nodes.map((n) => [n.id, n]));
      const edges: SimEdge[] = graph.edges.map((e) => ({
        a: e.a,
        b: e.b,
        kind: e.kind,
      }));

      const prev = stateRef.current;
      return {
        nodes,
        edges,
        byId,
        stars: prev?.w === w && prev?.h === h ? prev.stars : seedStars(w, h),
        nebulae:
          prev?.w === w && prev?.h === h ? prev.nebulae : seedNebulae(w, h),
        shoot: null as ShootingStar | null,
        nextShoot: performance.now() + 4000 + Math.random() * 6000,
        w,
        h,
        raf: prev?.raf ?? 0,
      };
    },
    [graph],
  );

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const host = containerRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = host?.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect?.width || window.innerWidth));
    const h = Math.max(320, Math.floor(rect?.height || window.innerHeight));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const prev = stateRef.current;
    const next = initSim(w, h);
    if (prev && Math.abs(prev.w - w) < 4 && Math.abs(prev.h - h) < 4) {
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
      next.stars = prev.stars;
      next.nebulae = prev.nebulae;
      next.shoot = prev.shoot;
      next.nextShoot = prev.nextShoot;
    }
    stateRef.current = next;
  }, [initSim]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    const host = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (host && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => resize());
      ro.observe(host);
    }
    return () => {
      window.removeEventListener("resize", resize);
      ro?.disconnect();
    };
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
      const { nodes, edges, byId, w, h, stars, nebulae } = state;
      const focus = focusRef.current;
      const hasFocus = focus.size > 0;
      const t = performance.now() / 1000;

      if (!reduced) {
        // Stronger repulsion so datasets stay spread out
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const bothSources = a.kind === "source" && b.kind === "source";
            const sameTheme =
              bothSources &&
              a.themeIds[0] &&
              a.themeIds[0] === b.themeIds[0];
            const minDist =
              a.r +
              b.r +
              (a.kind === "theme" || b.kind === "theme"
                ? 48
                : sameTheme
                  ? 42
                  : bothSources
                    ? 28
                    : 22);
            if (dist < minDist) {
              const f = ((minDist - dist) / dist) * (sameTheme ? 0.045 : 0.032);
              a.vx -= dx * f;
              a.vy -= dy * f;
              b.vx += dx * f;
              b.vy += dy * f;
            }
          }
        }

        // Loose pull to primary theme — keeps clouds near theme without clustering
        nodes.forEach((n) => {
          if (n.kind !== "source") return;
          const primary = n.themeIds[0];
          if (!primary) return;
          const theme = byId.get(`t:${primary}`);
          if (!theme) return;
          const dx = theme.x - n.x;
          const dy = theme.y - n.y;
          const dist = Math.hypot(dx, dy) || 1;
          const target = 145; // farther orbital distance
          const f = ((dist - target) / dist) * 0.0042;
          n.vx += dx * f;
          n.vy += dy * f;
        });

        // Very weak secondary theme links
        edges.forEach((e) => {
          if (e.kind !== "theme-source") return;
          const a = byId.get(e.a);
          const b = byId.get(e.b);
          if (!a || !b) return;
          const theme = a.kind === "theme" ? a : b;
          const source = a.kind === "source" ? a : b;
          if (theme.kind !== "theme" || source.kind !== "source") return;
          const primary = source.themeIds[0];
          if (primary && theme.themeId === primary) return;
          const dx = theme.x - source.x;
          const dy = theme.y - source.y;
          const dist = Math.hypot(dx, dy) || 1;
          const f = ((dist - 200) / dist) * 0.00045;
          source.vx += dx * f;
          source.vy += dy * f;
        });

        // Themes float on a slowly breathing outer ring
        const cx = w / 2;
        const cy = h / 2;
        const themeRing =
          Math.min(w, h) * (0.4 + 0.015 * Math.sin(t * 0.25));
        const themes = nodes.filter((n) => n.kind === "theme");
        themes.forEach((n, i) => {
          const angle =
            (i / themes.length) * Math.PI * 2 -
            Math.PI / 2 +
            t * 0.012; // slow orbit drift
          const tx = cx + Math.cos(angle) * themeRing;
          const ty = cy + Math.sin(angle) * themeRing;
          n.vx += (tx - n.x) * 0.005;
          n.vy += (ty - n.y) * 0.005;
        });

        // Ambient floating bob for every node
        nodes.forEach((n) => {
          const amp = n.floatAmp ?? 0.6;
          n.vx += Math.sin(t * 0.55 + n.phase) * 0.012 * amp;
          n.vy += Math.cos(t * 0.42 + n.phase * 1.3) * 0.011 * amp;
          // Micro swirl
          n.vx += Math.cos(t * 0.2 + n.phase) * 0.004;
          n.vy += Math.sin(t * 0.18 + n.phase) * 0.004;

          if (n.x < 20) n.vx += 0.12;
          if (n.x > w - 20) n.vx -= 0.12;
          if (n.y < 56) n.vy += 0.12;
          if (n.y > h - 40) n.vy -= 0.12;

          // Higher damping → more "weightless" float
          n.vx *= 0.94;
          n.vy *= 0.94;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + 14, Math.min(w - n.r - 14, n.x));
          n.y = Math.max(n.r + 56, Math.min(h - n.r - 48, n.y));
        });
      }

      // ── Pure black universe background ──────────────────
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Deep space radial glow (very subtle cream/gold center)
      const sky = ctx.createRadialGradient(
        w * 0.5,
        h * 0.42,
        0,
        w * 0.5,
        h * 0.42,
        Math.max(w, h) * 0.65,
      );
      sky.addColorStop(0, "rgba(18, 14, 10, 0.9)");
      sky.addColorStop(0.35, "rgba(8, 8, 10, 0.5)");
      sky.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Soft vignette
      const vig = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.12,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.7,
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // Nebulae (slow drift)
      nebulae.forEach((neb, i) => {
        const dx = !reduced ? Math.cos(t * 0.05 + neb.drift) * 18 : 0;
        const dy = !reduced ? Math.sin(t * 0.04 + neb.drift * 1.3) * 14 : 0;
        const nx = neb.x + dx;
        const ny = neb.y + dy;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, neb.rx);
        g.addColorStop(0, neb.color);
        g.addColorStop(0.55, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = neb.a * (0.75 + 0.25 * Math.sin(t * 0.3 + i));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(nx, ny, neb.rx, neb.ry, neb.drift * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Starfield
      stars.forEach((s) => {
        const twinkle = reduced
          ? 1
          : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        const alpha = s.a * twinkle;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm
          ? `rgba(243, 228, 201, ${alpha})`
          : `rgba(210, 220, 255, ${alpha})`;
        ctx.fill();
        // Occasional soft core glow
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = s.warm
            ? `rgba(196, 165, 116, ${alpha * 0.12})`
            : `rgba(140, 170, 255, ${alpha * 0.1})`;
          ctx.fill();
        }
      });

      // Shooting star (rare)
      if (!reduced) {
        const now = performance.now();
        if (!state.shoot && now > state.nextShoot) {
          const fromLeft = Math.random() > 0.5;
          state.shoot = {
            x: fromLeft ? -20 : w + 20,
            y: Math.random() * h * 0.45,
            vx: fromLeft ? 6 + Math.random() * 4 : -(6 + Math.random() * 4),
            vy: 1.5 + Math.random() * 2.5,
            life: 0,
            maxLife: 45 + Math.random() * 35,
          };
          state.nextShoot = now + 8000 + Math.random() * 12000;
        }
        if (state.shoot) {
          const sh = state.shoot;
          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.life += 1;
          const lifeT = sh.life / sh.maxLife;
          const alpha = (1 - lifeT) * 0.85;
          const trail = 28;
          const grad = ctx.createLinearGradient(
            sh.x,
            sh.y,
            sh.x - sh.vx * trail * 0.35,
            sh.y - sh.vy * trail * 0.35,
          );
          grad.addColorStop(0, `rgba(243, 228, 201, ${alpha})`);
          grad.addColorStop(1, "rgba(243, 228, 201, 0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(sh.x - sh.vx * trail * 0.35, sh.y - sh.vy * trail * 0.35);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(sh.x, sh.y, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 250, 240, ${alpha})`;
          ctx.fill();
          if (sh.life >= sh.maxLife || sh.x < -80 || sh.x > w + 80) {
            state.shoot = null;
          }
        }
      }

      // ── Constellation edges ─────────────────────────────
      edges.forEach((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return;
        if (e.kind === "theme-ring") return;

        let isFocusedEdge = false;

        if (e.kind === "theme-source") {
          const theme = a.kind === "theme" ? a : b;
          const source = a.kind === "source" ? a : b;
          if (theme.kind !== "theme" || source.kind !== "source") return;
          const isPrimary =
            source.themeIds[0] && theme.themeId === source.themeIds[0];
          if (!isPrimary && !hasFocus) return;
          if (hasFocus && !(focus.has(a.id) && focus.has(b.id))) return;
          isFocusedEdge = hasFocus && focus.has(a.id) && focus.has(b.id);
        } else if (e.kind === "source-source") {
          const sel = selectedRef.current;
          const selNode = sel ? byId.get(sel) : null;
          if (
            !(
              selNode?.kind === "source" &&
              focus.has(a.id) &&
              focus.has(b.id)
            )
          )
            return;
          isFocusedEdge = true;
        } else {
          return;
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        if (isFocusedEdge) {
          // Steady focus highlight — no pulse
          ctx.globalAlpha = 0.75;
          ctx.strokeStyle = "rgba(243, 228, 201, 0.72)";
          ctx.lineWidth = 1.5;
          ctx.shadowColor = "rgba(243, 228, 201, 0.35)";
          ctx.shadowBlur = 4;
        } else {
          // Faint constellation dust lines
          ctx.globalAlpha = 0.18;
          ctx.strokeStyle = "rgba(180, 200, 230, 0.4)";
          ctx.lineWidth = 0.6;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // ── Stellar nodes ───────────────────────────────────
      const ordered = [...nodes].sort((a, b) =>
        a.kind === "theme" ? 1 : b.kind === "theme" ? -1 : 0,
      );

      ordered.forEach((n) => {
        const isHover = hoverRef.current === n.id;
        const isSel = selectedRef.current === n.id;
        const isSource = n.kind === "source";
        const inFocus = !hasFocus || focus.has(n.id);
        const boost = isHover || isSel ? 1 : 0;
        const r = n.r + boost * 2;

        // Outer atmospheric glow
        if (n.kind === "theme" || isHover || isSel || (hasFocus && inFocus)) {
          const glowR = r * (n.kind === "theme" ? 3.6 : 2.8);
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
          const base = isSource ? "#c8d0e0" : n.color;
          glow.addColorStop(
            0,
            hexToRgba(base, n.kind === "theme" ? 0.35 : 0.28),
          );
          glow.addColorStop(0.45, hexToRgba(base, 0.08));
          glow.addColorStop(1, hexToRgba(base, 0));
          ctx.globalAlpha =
            hasFocus && !inFocus ? 0.35 : isSel ? 0.95 : isHover ? 0.8 : 0.65;
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core body
        ctx.globalAlpha = hasFocus && !inFocus ? 0.55 : 1;
        const core = ctx.createRadialGradient(
          n.x - r * 0.25,
          n.y - r * 0.25,
          0,
          n.x,
          n.y,
          r,
        );
        if (isSource) {
          core.addColorStop(0, "#f2f4f8");
          core.addColorStop(0.55, "#c8cdd8");
          core.addColorStop(1, "#8a92a3");
        } else {
          core.addColorStop(0, "#ffffff");
          core.addColorStop(0.35, n.color);
          core.addColorStop(1, hexToRgba(n.color, 0.85));
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = core;
        if (isSel && n.kind === "theme") {
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 16;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        if (n.kind === "theme") {
          ctx.strokeStyle = inFocus
            ? "rgba(243, 228, 201, 0.55)"
            : "rgba(160, 170, 190, 0.3)";
          ctx.lineWidth = inFocus && hasFocus ? 2 : 1;
          ctx.stroke();
        }

        // Specular highlight
        ctx.beginPath();
        ctx.arc(
          n.x - r * 0.3,
          n.y - r * 0.3,
          Math.max(1, r * 0.28),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fill();

        const showLabel =
          n.kind === "theme" ||
          (isSource && (isHover || isSel || (hasFocus && inFocus)));
        if (showLabel) {
          ctx.font =
            n.kind === "theme"
              ? "600 11px var(--font-body), system-ui, sans-serif"
              : "500 9px var(--font-body), system-ui, sans-serif";
          ctx.fillStyle = isSource
            ? "rgba(220, 225, 235, 0.92)"
            : "rgba(243, 228, 201, 0.95)";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 4;
          const label =
            n.kind === "theme" && n.label.length > 14
              ? n.label.slice(0, 12) + "…"
              : n.label;
          ctx.fillText(label, n.x, n.y + n.r + 13);
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
      });

      state.raf = requestAnimationFrame(draw);
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
    <div
      ref={containerRef}
      className={
        embedded
          ? "relative h-full w-full overflow-hidden bg-black"
          : "fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden bg-black"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Universe-style interlinked data graph. Click a theme to highlight its constellation of datasets."
        onMouseMove={(e) => {
          const n = hitTest(e.clientX, e.clientY);
          setHover(n?.id ?? null);
          if (canvasRef.current)
            canvasRef.current.style.cursor = n ? "pointer" : "default";
        }}
        onMouseLeave={() => setHover(null)}
        onClick={onClick}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4 sm:p-6">
        <div className="pointer-events-auto max-w-md rounded-xl border border-white/[0.08] bg-black/60 px-4 py-3 backdrop-blur-md">
          {!embedded && (
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-[#8B5E3C]" />
              <p className="font-display text-sm font-semibold tracking-tight text-[#F3E4C9]">
                Indian Data Guide
                <span className="align-super text-[0.65em] text-[#C4A574]/80">
                  ®
                </span>
              </p>
            </div>
          )}
          <p className="text-xs leading-relaxed text-[#C8C9BC]/90">
            {selectedNode
              ? selectedNode.kind === "theme"
                ? `${selectedNode.label} — ${focusedSources} sources lit`
                : `${selectedNode.label} · double-click or open`
              : "Click a theme to light its constellation. Datasets float nearby."}
          </p>
          {selectedNode?.kind === "source" && selectedNode.href && (
            <button
              type="button"
              className="mt-3 min-h-11 border border-[#F3E4C9]/30 bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F3E4C9] transition hover:bg-[#F3E4C9] hover:text-black"
              onClick={() => router.push(selectedNode.href!)}
            >
              Open {selectedNode.label} →
            </button>
          )}
        </div>
        {!embedded && (
          <nav
            className="pointer-events-auto flex flex-wrap justify-end gap-3 rounded-xl border border-white/[0.08] bg-black/55 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#C8C9BC] backdrop-blur-md sm:gap-5"
            aria-label="Universe graph navigation"
          >
            {[
              { href: "/academic", label: "Academic" },
              { href: "/series", label: "Series" },
              { href: "/explore", label: "Explore" },
              { href: "/about", label: "About" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex min-h-11 items-center link-underline hover:text-[#F3E4C9]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <p className="pointer-events-none absolute bottom-4 left-0 right-0 z-10 px-4 text-center text-[10px] uppercase tracking-[0.18em] text-white/25">
        Esc clears · scroll for more
      </p>
    </div>
  );
}
