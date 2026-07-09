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
      const themeRing = Math.min(w, h) * 0.4;

      const themes = graph.nodes.filter((n) => n.kind === "theme");
      const sources = graph.nodes.filter((n) => n.kind === "source");

      const nodes: SimNode[] = [];
      const themePos = new Map<string, { x: number; y: number; angle: number }>();

      themes.forEach((n, i) => {
        const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * themeRing;
        const y = cy + Math.sin(angle) * themeRing;
        themePos.set(n.id, { x, y, angle });
        nodes.push({
          ...n,
          x,
          y,
          vx: 0,
          vy: 0,
          r: 14,
        });
      });

      // Place each source near its *primary* theme (first themeId)
      // so NFHS sits by Health, not in the center cluster.
      const byPrimary = new Map<string, GraphNodeDef[]>();
      sources.forEach((n) => {
        const primary = n.themeIds[0] ?? "data-catalogs";
        const key = `t:${primary}`;
        const list = byPrimary.get(key) ?? [];
        list.push(n);
        byPrimary.set(key, list);
      });

      byPrimary.forEach((list, themeKey) => {
        const anchor = themePos.get(themeKey);
        const baseAngle = anchor?.angle ?? 0;
        const ax = anchor?.x ?? cx;
        const ay = anchor?.y ?? cy;

        list.forEach((n, j) => {
          // Fan around the primary theme, slightly inward toward center
          const spread =
            list.length === 1
              ? 0
              : ((j / (list.length - 1)) - 0.5) * Math.min(1.1, 0.12 * list.length + 0.35);
          const dist = 52 + (j % 4) * 18 + Math.random() * 10;
          const a = baseAngle + Math.PI + spread; // sit inward from outer ring
          const x = ax + Math.cos(a) * dist * 0.35 + Math.cos(baseAngle + spread) * dist * 0.55;
          const y = ay + Math.sin(a) * dist * 0.35 + Math.sin(baseAngle + spread) * dist * 0.55;
          nodes.push({
            ...n,
            x: Math.min(w - 20, Math.max(20, x)),
            y: Math.min(h - 40, Math.max(48, y)),
            vx: 0,
            vy: 0,
            r: 5,
          });
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

        // Strong pull only to *primary* theme (themeIds[0]) so sources stay near it
        nodes.forEach((n) => {
          if (n.kind !== "source") return;
          const primary = n.themeIds[0];
          if (!primary) return;
          const theme = byId.get(`t:${primary}`);
          if (!theme) return;
          const dx = theme.x - n.x;
          const dy = theme.y - n.y;
          const dist = Math.hypot(dx, dy) || 1;
          const target = 70;
          const f = ((dist - target) / dist) * 0.012;
          n.vx += dx * f;
          n.vy += dy * f;
        });

        // Weak links to secondary themes only (keeps multi-link without centering)
        edges.forEach((e) => {
          if (e.kind !== "theme-source") return;
          const a = byId.get(e.a);
          const b = byId.get(e.b);
          if (!a || !b) return;
          const theme = a.kind === "theme" ? a : b;
          const source = a.kind === "source" ? a : b;
          if (theme.kind !== "theme" || source.kind !== "source") return;
          const primary = source.themeIds[0];
          if (primary && theme.themeId === primary) return; // already strong-pull
          const dx = theme.x - source.x;
          const dy = theme.y - source.y;
          const dist = Math.hypot(dx, dy) || 1;
          const f = ((dist - 140) / dist) * 0.0015;
          source.vx += dx * f;
          source.vy += dy * f;
        });

        // Themes gently anchored on outer ring
        const cx = w / 2;
        const cy = h / 2;
        const themeRing = Math.min(w, h) * 0.4;
        const themes = nodes.filter((n) => n.kind === "theme");
        themes.forEach((n, i) => {
          const angle = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
          const tx = cx + Math.cos(angle) * themeRing;
          const ty = cy + Math.sin(angle) * themeRing;
          n.vx += (tx - n.x) * 0.02;
          n.vy += (ty - n.y) * 0.02;
        });

        // Keep nodes on screen — no center gravity
        nodes.forEach((n) => {
          if (n.x < 16) n.vx += 0.2;
          if (n.x > w - 16) n.vx -= 0.2;
          if (n.y < 48) n.vy += 0.2;
          if (n.y > h - 36) n.vy -= 0.2;
          n.vx *= 0.86;
          n.vy *= 0.86;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + 12, Math.min(w - n.r - 12, n.x));
          n.y = Math.max(n.r + 52, Math.min(h - n.r - 44, n.y));
        });
      }

      // Pure black canvas — less visual noise
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Edges: primary theme spokes only (not ring); no fading of datasets
      edges.forEach((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return;
        if (e.kind === "theme-ring") return;

        // Only draw primary theme→source edges by default (less clutter)
        if (e.kind === "theme-source") {
          const theme = a.kind === "theme" ? a : b;
          const source = a.kind === "source" ? a : b;
          if (theme.kind !== "theme" || source.kind !== "source") return;
          const isPrimary =
            source.themeIds[0] && theme.themeId === source.themeIds[0];
          if (!isPrimary && !hasFocus) return;
          if (hasFocus && !(focus.has(a.id) && focus.has(b.id))) return;
          ctx.globalAlpha = hasFocus ? 0.5 : 0.2;
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
          ctx.globalAlpha = 0.35;
        } else {
          return;
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = "rgba(200, 200, 200, 0.55)";
        ctx.lineWidth = hasFocus ? 1.2 : 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw all nodes fully visible — no fade
      const ordered = [...nodes].sort((a, b) =>
        a.kind === "theme" ? 1 : b.kind === "theme" ? -1 : 0
      );

      ordered.forEach((n) => {
        const isHover = hover === n.id;
        const isSel = selectedRef.current === n.id;
        const isSource = n.kind === "source";
        const inFocus = !hasFocus || focus.has(n.id);

        // No fade: full opacity for all nodes; focus only thickens/highlights
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (isHover || isSel ? 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isSource ? "#c8c8c8" : n.color;
        ctx.shadowColor =
          (isSel || isHover) && n.kind === "theme" ? n.color : "transparent";
        ctx.shadowBlur = isSel && n.kind === "theme" ? 16 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (n.kind === "theme") {
          ctx.strokeStyle = inFocus
            ? "rgba(230, 230, 230, 0.5)"
            : "rgba(160, 160, 160, 0.35)";
          ctx.lineWidth = inFocus && hasFocus ? 2 : 1;
          ctx.stroke();
        }

        // Theme labels always; source labels on hover or when theme focused
        const showLabel =
          n.kind === "theme" ||
          (isSource && (isHover || isSel || (hasFocus && inFocus)));
        if (showLabel) {
          ctx.font =
            n.kind === "theme"
              ? "600 11px var(--font-body), system-ui, sans-serif"
              : "500 9px var(--font-body), system-ui, sans-serif";
          ctx.fillStyle = isSource ? "#d0d0d0" : "#eaeaea";
          ctx.textAlign = "center";
          const label =
            n.kind === "theme" && n.label.length > 14
              ? n.label.slice(0, 12) + "…"
              : n.label;
          ctx.fillText(label, n.x, n.y + n.r + 12);
        }
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
    <div className="fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden bg-black">
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
