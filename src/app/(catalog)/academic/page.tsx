import Link from "next/link";
import { DatasetCard } from "@/components/DatasetCard";
import { InContentAd } from "@/components/ads/ContentWithAds";
import { datasets } from "@/data/datasets";
import type { Dataset, SourceKind } from "@/types/dataset";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic & Dataverse",
  description:
    "Harvard Dataverse India datasets, energy-access surveys, and peer-reviewed replication packages.",
};

function byKind(kinds: SourceKind[]) {
  return datasets.filter((d) => kinds.includes(d.sourceKind as SourceKind));
}

function Shelf({
  title,
  blurb,
  items,
}: {
  title: string;
  blurb: string;
  items: Dataset[];
}) {
  if (!items.length) return null;
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-obsidian-text">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-obsidian-muted">{blurb}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map((d) => (
          <DatasetCard key={d.slug} dataset={d} />
        ))}
      </div>
    </section>
  );
}

export default function AcademicPage() {
  const reference = byKind(["academic-reference"]);
  const surveys = byKind(["academic-survey"]);
  const replications = byKind(["replication"]);
  const projects = byKind(["academic-project"]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-obsidian-text">
          Academic & Dataverse
        </h1>
        <p className="mt-3 max-w-3xl text-obsidian-muted leading-relaxed">
          India-focused records from Harvard Dataverse and journal replication
          archives—energy access surveys, historical census collections,
          electoral datasets, and peer-reviewed packages. Sourced from{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-violet-200">
            content/academic_dataset_harvard.md
          </code>
          . Where the audit marked fields NR (not reported), badges say{" "}
          <strong className="text-obsidian-text">Metadata incomplete</strong>{" "}
          rather than inventing licenses.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/explore?source=academic"
            className="text-obsidian-purple-bright hover:underline"
          >
            Explore academic only
          </Link>
          <Link
            href="/explore?source=replication"
            className="text-obsidian-purple-bright hover:underline"
          >
            Explore replications
          </Link>
          <Link
            href="/series/access-energy"
            className="text-obsidian-purple-bright hover:underline"
          >
            ACCESS energy series
          </Link>
        </div>
      </header>

      <Shelf
        title="Core reference data"
        blurb="Reusable baselines: long-run census, population estimates, electoral criminality."
        items={reference}
      />
      <InContentAd />
      <Shelf
        title="Survey microdata"
        blurb="ACCESS, IRES, gender-energy, TAFSSA, and other respondent/household surveys."
        items={surveys}
      />
      <Shelf
        title="Replication packages"
        blurb="Article-linked archives—always open both paper DOI and data DOI when available."
        items={replications}
      />
      <Shelf
        title="Project-specific & thematic"
        blurb="Searchable deposits that are valuable but not the national reference spine."
        items={projects}
      />
    </div>
  );
}
