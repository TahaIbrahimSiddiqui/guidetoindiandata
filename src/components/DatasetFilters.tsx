"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useMemo, useTransition } from "react";
import { clusters } from "@/data/clusters";
import { datasets } from "@/data/datasets";
import { ACCESS_LABELS } from "@/lib/access";
import { uniqueSorted } from "@/lib/search";
import type { AccessType } from "@/types/dataset";

export function DatasetFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const categories = useMemo(
    () => uniqueSorted(datasets.flatMap((d) => d.categories)),
    []
  );
  const geographies = useMemo(
    () => uniqueSorted(datasets.flatMap((d) => d.geographyLevel)),
    []
  );
  const frequencies = useMemo(
    () =>
      uniqueSorted(
        datasets.map((d) => d.updateFrequency.split(/[/,]/)[0].trim())
      ).slice(0, 20),
    []
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => {
        router.push(`/explore?${next.toString()}`);
      });
    },
    [params, router]
  );

  const selectClass =
    "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50";

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/50 p-4 ${
        pending ? "opacity-80" : ""
      }`}
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search title, variables, host…"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => setParam("q", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-cyan-400/50"
          aria-label="Search datasets"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-xs text-slate-400">
          Source layer
          <select
            className={`mt-1 ${selectClass}`}
            value={params.get("source") ?? ""}
            onChange={(e) => setParam("source", e.target.value)}
          >
            <option value="">All</option>
            <option value="government">Government / national</option>
            <option value="academic">Academic / Dataverse</option>
            <option value="replication">Replication packages</option>
            <option value="github">GitHub & community</option>
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Category
          <select
            className={`mt-1 ${selectClass}`}
            value={params.get("category") ?? ""}
            onChange={(e) => setParam("category", e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Access type
          <select
            className={`mt-1 ${selectClass}`}
            value={params.get("accessType") ?? ""}
            onChange={(e) => setParam("accessType", e.target.value)}
          >
            <option value="">All</option>
            {(Object.keys(ACCESS_LABELS) as AccessType[]).map((k) => (
              <option key={k} value={k}>
                {ACCESS_LABELS[k]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Geography
          <select
            className={`mt-1 ${selectClass}`}
            value={params.get("geography") ?? ""}
            onChange={(e) => setParam("geography", e.target.value)}
          >
            <option value="">All</option>
            {geographies.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Cluster
          <select
            className={`mt-1 ${selectClass}`}
            value={params.get("cluster") ?? ""}
            onChange={(e) => setParam("cluster", e.target.value)}
          >
            <option value="">All</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Update frequency
          <select
            className={`mt-1 ${selectClass}`}
            value={params.get("frequency") ?? ""}
            onChange={(e) => setParam("frequency", e.target.value)}
          >
            <option value="">All</option>
            {frequencies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Institution / host
          <input
            className={`mt-1 ${selectClass}`}
            placeholder="e.g. MoSPI, NCRB"
            defaultValue={params.get("institution") ?? ""}
            onChange={(e) => setParam("institution", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
