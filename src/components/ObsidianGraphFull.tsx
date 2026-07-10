"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Database,
  Layers3,
  Network,
  Search,
} from "lucide-react";
import { buildInterlinkedGraph, type GraphNodeDef } from "@/lib/graphData";

const DEFAULT_THEME_ID = "t:population-demography";
const SOURCE_NODE_POSITIONS = [
  { x: 52, y: 14 },
  { x: 69, y: 20 },
  { x: 82, y: 34 },
  { x: 78, y: 56 },
  { x: 62, y: 72 },
  { x: 43, y: 78 },
  { x: 25, y: 64 },
  { x: 18, y: 43 },
  { x: 28, y: 24 },
  { x: 50, y: 31 },
  { x: 65, y: 42 },
  { x: 54, y: 61 },
  { x: 36, y: 54 },
  { x: 38, y: 37 },
  { x: 72, y: 76 },
  { x: 20, y: 78 },
  { x: 86, y: 16 },
  { x: 12, y: 18 },
];

function sourceLabel(node: GraphNodeDef) {
  return node.label.length > 42 ? `${node.label.slice(0, 39)}...` : node.label;
}

function sourceRank(node: GraphNodeDef) {
  const label = node.label.toLowerCase();
  if (/census|nfhs|plfs|udise|imd|data\.gov|hmis|ncrb/.test(label)) return 0;
  if (/survey|database|portal|catalog|collection/.test(label)) return 1;
  if (/github|datameet|replication/.test(label)) return 3;
  return 2;
}

export function ObsidianGraphFull() {
  const graph = useMemo(() => buildInterlinkedGraph(), []);
  const themes = useMemo(
    () => graph.nodes.filter((node) => node.kind === "theme"),
    [graph.nodes],
  );
  const sources = useMemo(
    () => graph.nodes.filter((node) => node.kind === "source"),
    [graph.nodes],
  );
  const themeById = useMemo(
    () => new Map(themes.map((theme) => [theme.id, theme])),
    [themes],
  );
  const sourceById = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  );
  const sourcesByTheme = useMemo(() => {
    const next = new Map<string, GraphNodeDef[]>();

    for (const theme of themes) {
      next.set(theme.id, []);
    }

    for (const edge of graph.edges) {
      if (edge.kind !== "theme-source") continue;
      const themeId = edge.a.startsWith("t:") ? edge.a : edge.b;
      const sourceId = edge.a.startsWith("t:") ? edge.b : edge.a;
      const source = sourceById.get(sourceId);
      if (!source) continue;
      next.set(themeId, [...(next.get(themeId) ?? []), source]);
    }

    for (const [themeId, list] of next) {
      next.set(
        themeId,
        [...list].sort(
          (a, b) => sourceRank(a) - sourceRank(b) || a.label.localeCompare(b.label),
        ),
      );
    }

    return next;
  }, [graph.edges, sourceById, themes]);

  const [selectedThemeId, setSelectedThemeId] = useState(DEFAULT_THEME_ID);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelectedSourceId(null);
      setSelectedThemeId(DEFAULT_THEME_ID);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedTheme = themeById.get(selectedThemeId) ?? themes[0];
  const activeSources = selectedTheme
    ? sourcesByTheme.get(selectedTheme.id) ?? []
    : [];
  const selectedSource = selectedSourceId
    ? sourceById.get(selectedSourceId)
    : activeSources[0];
  const plottedSources = activeSources.slice(0, SOURCE_NODE_POSITIONS.length);
  const sourceCount = activeSources.length;
  const mapSummary = selectedTheme
    ? `${selectedTheme.label}: ${sourceCount} linked sources`
    : "Choose a theme to inspect linked sources";

  return (
    <div className="fixed inset-0 z-0 h-[100dvh] w-screen overflow-y-auto bg-[#0A2947] text-[#F3E4C9]">
      <div
        className="pointer-events-none fixed inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(rgba(243,228,201,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(243,228,201,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.45) 62%, rgba(0,0,0,0.7))",
        }}
        aria-hidden
      />

      <header className="relative z-20 flex flex-wrap items-start justify-between gap-5 px-5 py-5 sm:px-8 lg:px-10">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-[#8B5E3C]" />
            <p className="font-display text-base font-semibold tracking-tight">
              Indian Data Guide
              <span className="align-super text-[0.65em] text-[#C4A574]/80">
                ®
              </span>
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#D3D4C0]/80">
            {mapSummary}. Select a lens, then open the best source for your
            research question.
          </p>
        </div>

        <nav
          className="flex flex-wrap justify-end gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D3D4C0]"
          aria-label="Knowledge map navigation"
        >
          {[
            { href: "/academic", label: "Academic" },
            { href: "/series", label: "Series" },
            { href: "/explore", label: "Explore" },
            { href: "/about", label: "About" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center link-underline hover:text-[#F3E4C9]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="relative z-10 grid min-h-[calc(100dvh-6rem)] gap-5 px-5 pb-8 sm:px-8 lg:grid-cols-[18rem_minmax(0,1fr)_22rem] lg:px-10">
        <aside className="surface-elevated order-2 p-4 lg:order-1 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <div className="flex items-center gap-2 text-[#C4A574]">
            <Layers3 className="size-4" aria-hidden />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Data lenses
            </h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {themes.map((theme) => {
              const active = theme.id === selectedTheme?.id;
              const count = sourcesByTheme.get(theme.id)?.length ?? 0;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setSelectedThemeId(theme.id);
                    setSelectedSourceId(null);
                  }}
                  className={`group flex min-h-12 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-all duration-200 ${
                    active
                      ? "border-[#C4A574]/70 bg-[#C4A574]/12 text-[#F3E4C9] shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
                      : "border-[#D3D4C0]/14 bg-[#071F36]/42 text-[#D3D4C0] hover:border-[#C4A574]/45 hover:bg-[#0D3152]"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2 shrink-0 rotate-45"
                      style={{ backgroundColor: theme.color }}
                      aria-hidden
                    />
                    <span className="truncate text-sm font-medium">
                      {theme.label}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[10px] tabular-nums opacity-70">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="order-1 lg:order-2" aria-labelledby="map-title">
          <div className="surface-elevated relative overflow-hidden p-4 sm:p-5 lg:min-h-[calc(100dvh-8rem)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="page-kicker mb-3">Curated Knowledge Map</p>
                <h1
                  id="map-title"
                  className="font-display max-w-2xl text-[clamp(2.2rem,5vw,4.5rem)] font-bold leading-[1.02] text-[#F3E4C9]"
                >
                  {selectedTheme?.label ?? "Indian data"} sources, mapped by
                  use.
                </h1>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Themes", value: themes.length },
                  { label: "Sources", value: sources.length },
                  { label: "Linked", value: sourceCount },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-md border border-[#D3D4C0]/14 bg-[#071F36]/55 px-3 py-2"
                  >
                    <p className="font-mono text-lg text-[#F3E4C9]">
                      {stat.value}
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[#D3D4C0]/55">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative mt-6 hidden min-h-[420px] overflow-hidden rounded-md border border-[#D3D4C0]/14 bg-[#071F36]/62 md:block"
              aria-label={mapSummary}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(211,212,192,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(211,212,192,0.035) 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                }}
                aria-hidden
              />
              <svg
                className="absolute inset-0 size-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                {plottedSources.map((source, index) => {
                  const position = SOURCE_NODE_POSITIONS[index];
                  const selected = source.id === selectedSource?.id;

                  return (
                    <line
                      key={source.id}
                      x1="50"
                      y1="50"
                      x2={position.x}
                      y2={position.y}
                      stroke={
                        selected
                          ? "rgba(196,165,116,0.72)"
                          : "rgba(211,212,192,0.16)"
                      }
                      strokeWidth={selected ? 0.38 : 0.18}
                    />
                  );
                })}
              </svg>

              <div className="absolute left-1/2 top-1/2 z-10 w-56 -translate-x-1/2 -translate-y-1/2 rounded-md border border-[#C4A574]/45 bg-[#0A2947]/95 p-5 text-center shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                <span
                  className="mx-auto block size-3 rotate-45"
                  style={{ backgroundColor: selectedTheme?.color }}
                  aria-hidden
                />
                <p className="mt-3 font-display text-2xl font-semibold leading-tight">
                  {selectedTheme?.label}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#D3D4C0]/80">
                  {sourceCount} linked sources with guide pages, access notes,
                  and variable clues.
                </p>
              </div>

              {plottedSources.map((source, index) => {
                const position = SOURCE_NODE_POSITIONS[index];
                const selected = source.id === selectedSource?.id;

                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => setSelectedSourceId(source.id)}
                    className={`absolute z-20 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums transition-all duration-200 hover:scale-110 focus-visible:scale-110 ${
                      selected
                        ? "border-[#F3E4C9] bg-[#C4A574] text-[#071F36] shadow-[0_0_0_6px_rgba(196,165,116,0.16)]"
                        : "border-[#D3D4C0]/30 bg-[#D3D4C0] text-[#071F36] hover:border-[#F3E4C9]"
                    }`}
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    title={source.label}
                    aria-label={`Inspect ${source.label}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 md:hidden">
              <div className="rounded-md border border-[#D3D4C0]/14 bg-[#071F36]/62 p-4">
                <div className="flex items-center gap-2 text-[#C4A574]">
                  <Network className="size-4" aria-hidden />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Mobile map
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#D3D4C0]/82">
                  {selectedTheme?.label} is open. The sources below are the
                  readable mobile version of the graph.
                </p>
              </div>
              {activeSources.slice(0, 8).map((source, index) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedSourceId(source.id)}
                  className={`flex min-h-14 items-center gap-3 rounded-md border p-3 text-left transition ${
                    selectedSource?.id === source.id
                      ? "border-[#C4A574]/70 bg-[#C4A574]/12"
                      : "border-[#D3D4C0]/14 bg-[#071F36]/52"
                  }`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#D3D4C0] font-mono text-xs text-[#071F36]">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#F3E4C9]">
                      {source.label}
                    </span>
                    <span className="text-xs text-[#D3D4C0]/65">
                      Tap to preview, then open from the detail panel.
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/explore?cluster=${selectedTheme?.themeId ?? ""}`}
                className="btn-primary"
              >
                <Search className="size-4" aria-hidden />
                Search this lens
              </Link>
              <Link href="/explore" className="btn-secondary">
                Open full catalog
              </Link>
            </div>
          </div>
        </section>

        <aside className="surface-elevated order-3 p-4 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <div className="flex items-center gap-2 text-[#C4A574]">
            <Database className="size-4" aria-hidden />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Source detail
            </h2>
          </div>

          {selectedSource ? (
            <div className="mt-4 rounded-md border border-[#C4A574]/32 bg-[#071F36]/58 p-4">
              <p className="font-display text-2xl font-semibold leading-tight">
                {selectedSource.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#D3D4C0]/82">
                Open the record for access friction, best uses, limitations,
                variables, and related sources.
              </p>
              {selectedSource.href && (
                <Link href={selectedSource.href} className="btn-primary mt-5">
                  Open source
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
          ) : null}

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
                Linked sources
              </p>
              <span className="font-mono text-xs text-[#D3D4C0]/55">
                {sourceCount}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {activeSources.slice(0, 10).map((source, index) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedSourceId(source.id)}
                  className={`group flex w-full min-h-12 items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                    selectedSource?.id === source.id
                      ? "border-[#C4A574]/70 bg-[#C4A574]/12"
                      : "border-[#D3D4C0]/12 bg-[#071F36]/42 hover:border-[#C4A574]/42 hover:bg-[#0D3152]"
                  }`}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#D3D4C0]/20 font-mono text-[10px] text-[#D3D4C0]/72">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#F3E4C9]">
                      {sourceLabel(source)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <p className="relative z-10 pb-5 text-center text-[10px] uppercase tracking-[0.18em] text-[#D3D4C0]/45">
        Esc resets · numbered nodes preview sources · catalog pages hold the
        full records
      </p>
    </div>
  );
}
