import Link from "next/link";
import { getRelatedDatasets } from "@/data/datasets";
import type { Dataset } from "@/types/dataset";

export function RelatedDatasets({ dataset }: { dataset: Dataset }) {
  const related = getRelatedDatasets(dataset);
  if (!related.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-white">Pairs well with</h2>
      <p className="mt-1 text-sm text-slate-400">
        Many Indian data problems need survey + administrative combinations.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {related.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/datasets/${d.slug}`}
              className="block rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 transition hover:border-cyan-400/30"
            >
              <p className="font-mono text-xs text-cyan-300/80">{d.shortTitle}</p>
              <p className="mt-0.5 text-sm font-medium text-white">{d.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
