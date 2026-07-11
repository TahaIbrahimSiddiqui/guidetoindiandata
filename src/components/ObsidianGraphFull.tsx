"use client";

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
  phase: number;
  floatAmp: number;
  /** Home-theme orbital radius (sources only). */
  orbitR: number;
  /** Current angle around home theme. */
  orbitAngle: number;
  /** Angular speed (rad/s). */
  orbitSpeed: number;
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
  for (let i = 0; i < 7; i++) {
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

function homeId(n: GraphNodeDef): string | undefined {
  return n.homeThemeId ?? n.themeIds[0];
}

/** Truncate canvas labels so they don't blow past the viewport. */
function truncateLabel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(1, maxChars - 1))}…`;
}

/**
 * Draw centered text clamped inside the canvas; flip above the node if the
 * default under-node position would clip the bottom edge.
 */
function fillClampedLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  yBelow: number,
  yAbove: number,
  w: number,
  h: number,
  pad = 10,
) {
  const tw = ctx.measureText(text).width;
  const half = tw / 2;
  const tx = Math.max(pad + half, Math.min(w - pad - half, x));
  let ty = yBelow;
  if (ty > h - pad) ty = yAbove;
  if (ty < pad + 8) ty = Math.min(h - pad, yBelow);
  ctx.fillText(text, tx, ty);
}

/**
 * Universe graph: each domain theme is a sun; datasets revolve around their
 * home theme. Multi-theme membership still highlights on click.
 */
export function ObsidianGraphFull({
  embedded = false,
  showChrome = true,
}: {
  embedded?: boolean;
  /** Top HUD chrome (title + external nav). Off when MapExperience owns chrome. */
  showChrome?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  /** Larger hit targets + mobile HUD when finger / narrow screens. */
  const [coarsePointer, setCoarsePointer] = useState(false);
  const coarseRef = useRef(false);
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
    lastT: number;
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

  useEffect(() => {
    const update = () => {
      const coarse =
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768;
      setCoarsePointer(coarse);
      coarseRef.current = coarse;
    };
    update();
    window.addEventListener("resize", update);
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  const initSim = useCallback(
    (w: number, h: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const minSide = Math.min(w, h);
      // Theme suns on a wide outer ring — tighter on phones so labels fit
      const themeRing = minSide * (w < 480 ? 0.3 : 0.34);

      const themes = graph.nodes.filter((n) => n.kind === "theme");
      const sources = graph.nodes.filter((n) => n.kind === "source");
      const rand = mulberry32(0xc0ffee ^ (w * 31) ^ (h * 17));

      const nodes: SimNode[] = [];
      const themePos = new Map<
        string,
        { x: number; y: number; angle: number; color: string }
      >();

      themes.forEach((n, i) => {
        const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * themeRing;
        const y = cy + Math.sin(angle) * themeRing;
        themePos.set(n.id, { x, y, angle, color: n.color });
        nodes.push({
          ...n,
          x,
          y,
          vx: 0,
          vy: 0,
          r: 14,
          phase: rand() * Math.PI * 2,
          floatAmp: 0.4 + rand() * 0.3,
          orbitR: 0,
          orbitAngle: angle,
          orbitSpeed: 0.008 + rand() * 0.004,
        });
      });

      // Group sources by home theme for orbital shells
      const byHome = new Map<string, GraphNodeDef[]>();
      sources.forEach((n) => {
        const home = homeId(n) ?? "international-india";
        const key = `t:${home}`;
        const list = byHome.get(key) ?? [];
        list.push(n);
        byHome.set(key, list);
      });

      const maxOrbitBudget = minSide * (w < 480 ? 0.13 : 0.16);

      byHome.forEach((list, themeKey) => {
        const anchor = themePos.get(themeKey);
        const ax = anchor?.x ?? cx;
        const ay = anchor?.y ?? cy;
        const count = list.length;
        // Multiple shells so large constellations stay readable
        const shellSize = Math.max(4, Math.ceil(Math.sqrt(count * 1.6)));
        const shells = Math.max(1, Math.ceil(count / shellSize));

        list.forEach((n, j) => {
          const shell = Math.floor(j / shellSize);
          const idxInShell = j % shellSize;
          const inShell = Math.min(shellSize, count - shell * shellSize);
          // Evenly space within shell + small jitter
          const baseAngle =
            (idxInShell / inShell) * Math.PI * 2 +
            shell * 0.35 +
            rand() * 0.12;
          // Inner shell tight, outer shells farther — scale with local count
          const baseR =
            52 +
            shell * (28 + Math.min(18, count * 0.6)) +
            (count > 12 ? 8 : 0);
          const orbitR = Math.min(
            maxOrbitBudget + shell * 12,
            baseR + rand() * 10,
          );
          // Slow, varied revolution (some reverse for organic feel)
          const dir = rand() > 0.42 ? 1 : -1;
          const orbitSpeed = dir * (0.045 + rand() * 0.07 + shell * 0.008);
          const x = ax + Math.cos(baseAngle) * orbitR;
          const y = ay + Math.sin(baseAngle) * orbitR;

          nodes.push({
            ...n,
            x: Math.min(w - 20, Math.max(20, x)),
            y: Math.min(h - 40, Math.max(48, y)),
            vx: 0,
            vy: 0,
            r: 4.2 + (n.id.startsWith("s:") ? 0.8 : 0),
            phase: rand() * Math.PI * 2,
            floatAmp: 0.5 + rand() * 0.5,
            orbitR,
            orbitAngle: baseAngle,
            orbitSpeed,
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
        lastT: performance.now() / 1000,
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
    // On small resizes keep angles/speeds but re-anchor orbits
    if (prev && Math.abs(prev.w - w) < 8 && Math.abs(prev.h - h) < 8) {
      for (const n of next.nodes) {
        const p = prev.byId.get(n.id);
        if (p && n.kind === "source") {
          n.orbitAngle = p.orbitAngle;
          n.orbitSpeed = p.orbitSpeed;
          n.orbitR = p.orbitR;
          n.phase = p.phase;
        }
      }
      next.byId = new Map(next.nodes.map((n) => [n.id, n]));
      next.stars = prev.stars;
      next.nebulae = prev.nebulae;
      next.shoot = prev.shoot;
      next.nextShoot = prev.nextShoot;
      next.lastT = prev.lastT;
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
      if (e.key === "Enter" && selectedRef.current) {
        const n = stateRef.current?.byId.get(selectedRef.current);
        if (n?.kind === "source" && n.href) router.push(n.href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

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
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, Math.max(0.001, now - state.lastT));
      state.lastT = now;
      const t = now;
      const selId = selectedRef.current;
      const selNode = selId ? byId.get(selId) : null;

      if (!reduced) {
        const cx = w / 2;
        const cy = h / 2;
        const minSide = Math.min(w, h);
        // Slightly inside 0.5 so suns + orbiters + labels stay off the frame edge
        const themeRing =
          minSide *
          ((w < 480 ? 0.3 : 0.34) + 0.01 * Math.sin(t * 0.22));

        // ── Theme suns: slow revolution on galaxy ring ──
        const themes = nodes.filter((n) => n.kind === "theme");
        themes.forEach((n, i) => {
          const angle =
            (i / themes.length) * Math.PI * 2 -
            Math.PI / 2 +
            t * 0.01;
          const tx = cx + Math.cos(angle) * themeRing;
          const ty = cy + Math.sin(angle) * themeRing;
          // Soft spring to ring slot (suns stay ordered)
          n.vx += (tx - n.x) * 0.08;
          n.vy += (ty - n.y) * 0.08;
          n.vx *= 0.82;
          n.vy *= 0.82;
          n.x += n.vx;
          n.y += n.vy;
        });

        // ── Sources: true orbital motion around home sun ──
        nodes.forEach((n) => {
          if (n.kind !== "source") return;
          const home = homeId(n);
          if (!home) return;
          const theme = byId.get(`t:${home}`);
          if (!theme) return;

          n.orbitAngle += n.orbitSpeed * dt;
          // Gentle radial breathe so shells don't look rigid
          const rBreath =
            n.orbitR *
            (1 + 0.03 * Math.sin(t * 0.6 + n.phase) * (n.floatAmp ?? 1));
          const tx = theme.x + Math.cos(n.orbitAngle) * rBreath;
          const ty = theme.y + Math.sin(n.orbitAngle) * rBreath;
          // Strong spring to orbital slot — this is the "revolve around" feel
          n.vx += (tx - n.x) * 0.14;
          n.vy += (ty - n.y) * 0.14;
          n.vx *= 0.78;
          n.vy *= 0.78;
          n.x += n.vx;
          n.y += n.vy;
        });

        // Soft collision between nearby sources (same orbit cloud)
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          if (a.kind !== "source") continue;
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            if (b.kind !== "source") continue;
            if (homeId(a) !== homeId(b)) continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = a.r + b.r + 14;
            if (dist < minDist) {
              const f = ((minDist - dist) / dist) * 0.04;
              a.x -= dx * f;
              a.y -= dy * f;
              b.x += dx * f;
              b.y += dy * f;
              // Nudge orbital angles apart so they unstick
              a.orbitAngle -= f * 0.15;
              b.orbitAngle += f * 0.15;
            }
          }
        }

        // Clamp to viewport softly — leave room for labels + map chrome/guide/HUD
        const bottomPad = coarseRef.current ? 88 : 64;
        const topPad = coarseRef.current ? 64 : 56;
        nodes.forEach((n) => {
          n.x = Math.max(n.r + 16, Math.min(w - n.r - 16, n.x));
          n.y = Math.max(n.r + topPad, Math.min(h - n.r - bottomPad, n.y));
        });
      }

      // ── Pure black universe ────────────────────────────
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

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
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = s.warm
            ? `rgba(196, 165, 116, ${alpha * 0.12})`
            : `rgba(140, 170, 255, ${alpha * 0.1})`;
          ctx.fill();
        }
      });

      if (!reduced) {
        const wall = performance.now();
        if (!state.shoot && wall > state.nextShoot) {
          const fromLeft = Math.random() > 0.5;
          state.shoot = {
            x: fromLeft ? -20 : w + 20,
            y: Math.random() * h * 0.45,
            vx: fromLeft ? 6 + Math.random() * 4 : -(6 + Math.random() * 4),
            vy: 1.5 + Math.random() * 2.5,
            life: 0,
            maxLife: 45 + Math.random() * 35,
          };
          state.nextShoot = wall + 8000 + Math.random() * 12000;
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

      // Keep constellation geometry inside the canvas box (labels/edges).
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();

      // ── Orbital rings around each theme sun ────────────
      nodes.forEach((theme) => {
        if (theme.kind !== "theme") return;
        const isSelTheme = selId === theme.id;
        const inFocusTheme = !hasFocus || focus.has(theme.id);

        // Collect home orbit radii for this sun
        const radii = new Set<number>();
        nodes.forEach((s) => {
          if (s.kind !== "source") return;
          if (homeId(s) !== theme.themeId) return;
          // quantize for a few clean rings
          radii.add(Math.round(s.orbitR / 12) * 12);
        });

        const ringAlpha = hasFocus
          ? isSelTheme
            ? 0.28
            : inFocusTheme
              ? 0.08
              : 0.03
          : 0.1;

        radii.forEach((r) => {
          if (r < 30) return;
          ctx.beginPath();
          ctx.ellipse(theme.x, theme.y, r, r * 0.92, 0.15, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(theme.color, ringAlpha);
          ctx.lineWidth = isSelTheme ? 1.1 : 0.55;
          ctx.setLineDash(isSelTheme ? [] : [3, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      });

      // ── Constellation edges ────────────────────────────
      edges.forEach((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return;
        if (e.kind === "theme-ring") return;

        if (e.kind === "theme-source") {
          const theme = a.kind === "theme" ? a : b;
          const source = a.kind === "source" ? a : b;
          if (theme.kind !== "theme" || source.kind !== "source") return;

          const home = homeId(source);
          const isPrimary = Boolean(
            home && theme.themeId && home === theme.themeId,
          );
          const edgeInFocus =
            hasFocus && focus.has(theme.id) && focus.has(source.id);

          // Idle: only faint home-orbit spokes
          if (!hasFocus) {
            if (!isPrimary) return;
            ctx.beginPath();
            ctx.moveTo(theme.x, theme.y);
            ctx.lineTo(source.x, source.y);
            ctx.globalAlpha = 0.1;
            ctx.strokeStyle = hexToRgba(theme.color, 0.55);
            ctx.lineWidth = 0.55;
            ctx.stroke();
            ctx.globalAlpha = 1;
            return;
          }

          if (!edgeInFocus) return;

          // Focused: home spokes solid cream; secondary dashed gold (always on).
          // Soften very long secondary spokes so they don't dominate the frame.
          const spokeLen = Math.hypot(source.x - theme.x, source.y - theme.y);
          const longCap = Math.min(w, h) * 0.55;
          ctx.beginPath();
          ctx.moveTo(theme.x, theme.y);
          ctx.lineTo(source.x, source.y);
          if (isPrimary) {
            ctx.globalAlpha = 0.8;
            ctx.strokeStyle = "rgba(243, 228, 201, 0.78)";
            ctx.lineWidth = 1.45;
            ctx.setLineDash([]);
            ctx.shadowColor = "rgba(243, 228, 201, 0.3)";
            ctx.shadowBlur = 4;
          } else {
            // Secondary membership — linked but orbits another sun
            const longFade =
              spokeLen > longCap
                ? Math.max(0.28, 0.55 * (longCap / spokeLen))
                : 0.55;
            ctx.globalAlpha = longFade;
            ctx.strokeStyle = "rgba(196, 165, 116, 0.7)";
            ctx.lineWidth = 1.05;
            ctx.setLineDash([4, 5]);
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          return;
        }

        if (e.kind === "source-source") {
          if (
            !(
              selNode?.kind === "source" &&
              focus.has(a.id) &&
              focus.has(b.id)
            )
          )
            return;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = "rgba(200, 210, 230, 0.55)";
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
      });

      // ── Nodes (sources under, suns on top) ─────────────
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

        // Theme-tinted body for sources from home sun
        const home = homeId(n);
        const homeTheme = home ? byId.get(`t:${home}`) : null;
        const tint = homeTheme?.color ?? n.color;

        if (n.kind === "theme" || isHover || isSel || (hasFocus && inFocus)) {
          const glowR = r * (n.kind === "theme" ? 3.8 : 2.6);
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
          const base = isSource ? tint : n.color;
          glow.addColorStop(
            0,
            hexToRgba(base, n.kind === "theme" ? 0.38 : 0.3),
          );
          glow.addColorStop(0.45, hexToRgba(base, 0.08));
          glow.addColorStop(1, hexToRgba(base, 0));
          ctx.globalAlpha =
            hasFocus && !inFocus ? 0.22 : isSel ? 0.95 : isHover ? 0.85 : 0.65;
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = hasFocus && !inFocus ? 0.28 : 1;
        const core = ctx.createRadialGradient(
          n.x - r * 0.25,
          n.y - r * 0.25,
          0,
          n.x,
          n.y,
          r,
        );
        if (isSource) {
          core.addColorStop(0, "#f4f2ec");
          core.addColorStop(0.45, hexToRgba(tint, 0.75));
          core.addColorStop(1, hexToRgba(tint, 0.55));
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
          ctx.shadowBlur = 18;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        if (n.kind === "theme") {
          ctx.strokeStyle =
            inFocus && hasFocus
              ? "rgba(243, 228, 201, 0.65)"
              : "rgba(160, 170, 190, 0.3)";
          ctx.lineWidth = inFocus && hasFocus ? 2.2 : 1;
          ctx.stroke();
        }

        // Specular
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

        // Home vs visitor badge when a theme is focused:
        // sources orbiting this sun are solid; secondary links get a ring
        if (
          isSource &&
          hasFocus &&
          inFocus &&
          selNode?.kind === "theme" &&
          selNode.themeId
        ) {
          const isHomeHere = home === selNode.themeId;
          if (!isHomeHere) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(196, 165, 116, 0.85)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        const showLabel =
          n.kind === "theme" ||
          (isSource && (isHover || isSel || (hasFocus && inFocus)));
        if (showLabel) {
          ctx.font =
            n.kind === "theme"
              ? "600 11px var(--font-body), system-ui, sans-serif"
              : "500 9px var(--font-body), system-ui, sans-serif";
          ctx.fillStyle = isSource
            ? "rgba(230, 228, 220, 0.95)"
            : "rgba(243, 228, 201, 0.95)";
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.shadowColor = "rgba(0,0,0,0.85)";
          ctx.shadowBlur = 4;
          const label =
            n.kind === "theme"
              ? truncateLabel(n.label, 14)
              : truncateLabel(n.label, isHover || isSel ? 28 : 22);
          fillClampedLabel(
            ctx,
            label,
            n.x,
            n.y + n.r + 13,
            n.y - n.r - 8,
            w,
            h,
            10,
          );
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
      });

      ctx.restore();

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
    // Finger-friendly hit slop on coarse pointers / narrow screens
    const slop = coarseRef.current ? 22 : 9;
    let best: SimNode | null = null;
    let bestDist = Infinity;
    for (let i = state.nodes.length - 1; i >= 0; i--) {
      const n = state.nodes[i];
      const d = Math.hypot(n.x - x, n.y - y);
      const max = n.r + slop + (n.kind === "theme" ? 6 : 0);
      if (d <= max && d < bestDist) {
        best = n;
        bestDist = d;
      }
    }
    return best;
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

  const homeOrbitCount = useMemo(() => {
    if (!selectedNode || selectedNode.kind !== "theme" || !selectedNode.themeId)
      return 0;
    return graph.nodes.filter(
      (n) =>
        n.kind === "source" &&
        (n.homeThemeId ?? n.themeIds[0]) === selectedNode.themeId,
    ).length;
  }, [graph.nodes, selectedNode]);

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
          : "fixed inset-0 z-0 h-dvh w-full overflow-hidden bg-black"
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-manipulation"
        role="img"
        aria-label="Universe graph: datasets orbit their home theme. Tap a theme to highlight linked sources."
        onMouseMove={(e) => {
          if (coarseRef.current) return;
          const n = hitTest(e.clientX, e.clientY);
          setHover(n?.id ?? null);
          if (canvasRef.current)
            canvasRef.current.style.cursor = n ? "pointer" : "default";
        }}
        onMouseLeave={() => setHover(null)}
        onClick={onClick}
      />

      {showChrome && (
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
                  ? `${selectedNode.label} sun — ${homeOrbitCount} home orbiters · ${focusedSources} linked`
                  : `${selectedNode.label} · double-tap or Open →`
                : "Tap a theme sun, then a dataset."}
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
        </div>
      )}

      {/* Selection HUD when parent owns chrome (map page) */}
      {!showChrome && selectedNode && (
        <div
          className={
            coarsePointer
              ? "pointer-events-none absolute inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 sm:inset-x-auto sm:right-5 sm:bottom-auto sm:top-20"
              : "pointer-events-none absolute right-4 top-20 z-20 sm:right-5 sm:top-20"
          }
        >
          <div className="pointer-events-auto mx-auto w-full max-w-sm rounded-xl border border-white/[0.1] bg-black/80 px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-md sm:mx-0 sm:max-w-xs">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C4A574]">
              {selectedNode.kind === "theme" ? "Theme" : "Dataset"}
            </p>
            <p className="mt-1 font-display text-base font-semibold text-[#F3E4C9]">
              {selectedNode.label}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#C8C9BC]/90">
              {selectedNode.kind === "theme"
                ? `${homeOrbitCount} home · ${focusedSources} linked — pick a node`
                : "Double-tap or open for full record"}
            </p>
            {selectedNode.kind === "source" && selectedNode.href && (
              <button
                type="button"
                className="mt-3 min-h-11 w-full rounded-lg border border-[#F3E4C9]/35 bg-[#8B5E3C] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#a06d45]"
                onClick={() => router.push(selectedNode.href!)}
              >
                Open full page →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
