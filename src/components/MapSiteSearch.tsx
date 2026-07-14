"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  searchSite,
  SITE_SEARCH_KIND_LABEL,
  type SiteSearchResult,
} from "@/lib/siteSearch";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/**
 * Minimalist site search for the solar map overlay.
 * Ranks datasets, series, themes, and key pages — click navigates away.
 */
export function MapSiteSearch({ className }: Props) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 120);
    return () => window.clearTimeout(t);
  }, [query]);

  const results = useMemo(
    () => (debounced ? searchSite(debounced, 8) : []),
    [debounced],
  );

  useEffect(() => {
    setActive(0);
    setOpen(Boolean(debounced) && results.length > 0);
  }, [debounced, results.length]);

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setDebounced("");
      router.push(href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (query) {
        setQuery("");
        setDebounced("");
      }
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) {
      if (e.key === "Enter" && query.trim()) {
        // Fallback: open Explore with the query
        e.preventDefault();
        go(`/explore?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active] ?? results[0];
      if (hit) go(hit.href);
    }
  };

  const showPanel = open && results.length > 0;
  const showEmpty = open && debounced.length >= 2 && results.length === 0;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative w-full max-w-[min(100%,20rem)] sm:max-w-[22rem]",
        className,
      )}
    >
      <label htmlFor="map-site-search" className="sr-only">
        Search the catalog
      </label>
      <div
        className={`flex min-h-11 items-center gap-2 rounded-full border bg-black/65 px-3 backdrop-blur-md transition sm:px-3.5 ${
          open || query
            ? "border-[#C4A574]/40 shadow-[0_0_0_1px_rgba(196,165,116,0.12)]"
            : "border-white/[0.1]"
        }`}
      >
        <Search
          className="size-3.5 shrink-0 text-[#C4A574]/90"
          aria-hidden
        />
        <input
          ref={inputRef}
          id="map-site-search"
          type="search"
          role="combobox"
          aria-expanded={showPanel || showEmpty}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel ? `${listId}-opt-${active}` : undefined
          }
          autoComplete="off"
          placeholder="Search catalog…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#F3E4C9] outline-none placeholder:text-[#C8C9BC]/55"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebounced("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[#C8C9BC] transition hover:bg-white/10 hover:text-[#F3E4C9]"
            aria-label="Clear search"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      {(showPanel || showEmpty) && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 max-h-[min(60dvh,20rem)] overflow-y-auto rounded-2xl border border-white/[0.1] bg-black/90 py-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        >
          {showEmpty ? (
            <p className="px-3.5 py-3 text-xs text-[#C8C9BC]/80">
              No matches. Try an acronym (NFHS, PLFS) or theme (labour, health).
            </p>
          ) : (
            results.map((r, i) => (
              <ResultRow
                key={r.id}
                id={`${listId}-opt-${i}`}
                result={r}
                active={i === active}
                onHover={() => setActive(i)}
                onSelect={() => go(r.href)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ResultRow({
  id,
  result,
  active,
  onHover,
  onSelect,
}: {
  id: string;
  result: SiteSearchResult;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      id={id}
      role="option"
      aria-selected={active}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition ${
        active ? "bg-[#C4A574]/15" : "hover:bg-white/[0.04]"
      }`}
    >
      <span className="mt-0.5 shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#C4A574]">
        {SITE_SEARCH_KIND_LABEL[result.kind]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[#F3E4C9]">
          {result.title}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-[#C8C9BC]/85">
          {result.subtitle}
        </span>
      </span>
    </button>
  );
}
