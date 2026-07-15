import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  GitBranch,
  Package,
  Search,
  Terminal,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "AdminLineageAI",
  description:
    "AdminLineageAI is an open-source Python package for AI-assisted administrative crosswalks across districts, states, and other units.",
  path: "/adminlineage-ai",
});

const projectLinks = [
  {
    label: "PyPI package",
    href: "https://pypi.org/project/adminlineage/",
  },
  {
    label: "GitHub repo",
    href: "https://github.com/TahaIbrahimSiddiqui/AdminLineageAI",
  },
  {
    label: "Zenodo DOI",
    href: "https://doi.org/10.5281/zenodo.20126370",
  },
];

const useCases = [
  "Match scheme datasets to standard administrative lists such as census tables.",
  "Handle spelling variants and language-specific forms like Paschimi Singhbhum and West Singhbhum.",
  "Reason over administrative splits, mergers, transfers, and renames where clean public evolution lists are missing.",
  "Create new evolution crosswalks between periods, while preserving review artifacts for manual checking.",
];

const features = [
  "Candidate generation before LLM calls, with exact string matching and pruning to control token cost.",
  "Hierarchical matching within exact scopes such as country, state, or district.",
  "Grounded Gemini adjudication with strict JSON output and resumable artifacts.",
  "Optional replay so repeated semantic requests can reuse completed LLM work.",
];

const outputs = [
  "evolution_key.csv",
  "evolution_key.parquet",
  "review_queue.csv",
  "run_metadata.json",
  "links_raw.jsonl",
];

export default function AdminLineagePage() {
  return (
    <div className="max-w-5xl">
      <header className="mb-12 max-w-3xl">
        <p className="page-kicker">Open-source package</p>
        <h1 className="page-title">AdminLineageAI</h1>
        <p className="page-lede">
          AI-assisted administrative crosswalks for districts, subdistricts,
          states, and countries across datasets that come from different sources
          or time periods.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {projectLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              {link.label}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          ))}
        </div>
      </header>

      <section className="surface-elevated mb-8 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#C4A574]/25 bg-[#C4A574]/10 text-[#C4A574]">
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#F3E4C9]">
              Experimental utility, review required
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#D3D4C0]/95">
              Treat AdminLineageAI outputs as assistive crosswalks, not final
              truth. The package is designed to reduce manual work while keeping
              a clear review trail, especially for important administrative
              matches.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Package,
            label: "Install",
            value: "pip install adminlineage",
          },
          {
            icon: Search,
            label: "Grounding",
            value: "Gemini + Google Search",
          },
          {
            icon: GitBranch,
            label: "Artifacts",
            value: "CSV, Parquet, JSONL",
          },
        ].map((item) => (
          <div key={item.label} className="surface p-5">
            <item.icon className="size-5 text-[#C4A574]" aria-hidden />
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C4A574]">
              {item.label}
            </p>
            <p className="mt-2 font-mono text-sm text-[#F3E4C9]">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          <h2 className="section-title">What it helps with</h2>
          <ul className="mt-5 space-y-4 text-sm leading-relaxed text-[#D3D4C0]/95">
            {useCases.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-[#C4A574]"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface p-6">
          <h2 className="section-title">Core workflow</h2>
          <ol className="mt-5 space-y-4 text-sm leading-relaxed text-[#D3D4C0]/95">
            {[
              "Load two administrative-unit tables.",
              "Choose the name columns, IDs, years, country, and optional exact-match scopes.",
              "Generate candidate matches and ask Gemini to adjudicate the hard cases.",
              "Review the evolution key and flagged rows before using the crosswalk downstream.",
            ].map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="font-mono text-xs text-[#C4A574]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <h2 className="section-title">Important features</h2>
          <ul className="mt-5 space-y-4 text-sm leading-relaxed text-[#D3D4C0]/95">
            {features.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#C4A574]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface p-6">
          <div className="mb-4 flex items-center gap-3">
            <Terminal className="size-5 text-[#C4A574]" aria-hidden />
            <h2 className="section-title">Python API quick start</h2>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-obsidian-border bg-black/55 p-4 text-xs leading-relaxed text-[#D3D4C0]">
            <code>{`import pandas as pd
import adminlineage

df_from = pd.read_csv("from_units.csv")
df_to = pd.read_csv("to_units.csv")

crosswalk_df, metadata = adminlineage.build_evolution_key(
    df_from,
    df_to,
    country="India",
    year_from=1951,
    year_to=2001,
    map_col_from="district",
    map_col_to="district",
    exact_match=["state"],
    relationship="auto",
    model="gemini-3.1-flash-lite",
    replay_enabled=True,
)`}</code>
          </pre>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="section-title">Outputs to review</h2>
        <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-border sm:grid-cols-2 lg:grid-cols-5">
          {outputs.map((output) => (
            <div key={output} className="bg-obsidian-panel p-4">
              <FileText className="size-4 text-[#C4A574]" aria-hidden />
              <p className="mt-3 font-mono text-xs text-[#F3E4C9]">
                {output}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface mt-12 p-6 sm:p-8">
        <h2 className="section-title">Where this fits in the guide</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#D3D4C0]/95">
          Many Indian datasets are useful only after their geography is made
          comparable across time. AdminLineageAI sits alongside this guide as a
          tool for building and auditing those administrative crosswalks, while
          this website helps researchers discover source datasets, variables,
          access conditions, and documentation.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/explore?source=github" className="btn-ghost">
            Browse GitHub datasets
          </Link>
          <Link href="/about" className="btn-ghost">
            About this guide
          </Link>
        </div>
      </section>
    </div>
  );
}
