import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRelatedDatasets } from "@/data/datasets";
import type { Dataset } from "@/types/dataset";

export function RelatedDatasets({ dataset }: { dataset: Dataset }) {
  const related = getRelatedDatasets(dataset);
  if (!related.length) return null;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title">Pairs well with</h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Many Indian data problems need survey + administrative combinations.
          </p>
        </div>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {related.map((d) => (
          <li key={d.slug}>
            <Link href={`/datasets/${d.slug}`} className="group block">
              <Card className="border-border bg-card/70 py-0 ring-1 ring-border transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-secondary/50 group-hover:ring-ring/40">
                <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] tracking-wide text-accent-foreground uppercase">
                      {d.shortTitle}
                    </p>
                    <CardTitle className="mt-1 text-sm font-medium leading-snug text-card-foreground group-hover:text-white">
                      {d.title}
                    </CardTitle>
                    <CardDescription className="sr-only">
                      Open related dataset {d.shortTitle}
                    </CardDescription>
                  </div>
                  <ArrowUpRight
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground/40 transition group-hover:text-accent-foreground"
                    aria-hidden
                  />
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
