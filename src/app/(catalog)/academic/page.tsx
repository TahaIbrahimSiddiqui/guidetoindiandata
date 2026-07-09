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
    <section className="mb-16">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[#F3E4C9]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#D3D4C0]">
        {blurb}
      </p>
      <div className="mt-6 grid-hairline sm:grid-cols-2">
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
  const github = byKind(["github-community"]);

  return (
    <div>
      <header className="mb-14 max-w-3xl">
        <p className="page-kicker">Research layer</p>
        <h1 className="page-title">
          Academic,
          <br />
          Dataverse &amp; GitHub
        </h1>
        <p className="page-lede">
          Harvard Dataverse deposits, journal replications, and community GitHub
          repos. Where licenses were not reported, we flag metadata incomplete
          instead of inventing terms.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/explore?source=academic" className="btn-ghost">
            Academic
          </Link>
          <Link href="/explore?source=replication" className="btn-ghost">
            Replications
          </Link>
          <Link href="/explore?source=github" className="btn-ghost">
            GitHub
          </Link>
          <Link href="/series/access-energy" className="btn-ghost">
            ACCESS series
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
      <Shelf
        title="GitHub & community data"
        blurb="Boundaries, elections ETL, night lights, schools, and packaging repos from content/github_dataset.md."
        items={github}
      />
    </div>
  );
}
