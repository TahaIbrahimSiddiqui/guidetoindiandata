import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Building2,
  Calendar,
  ExternalLink,
  GitBranch,
  ListTree,
  MapPin,
  RefreshCw,
  Table2,
} from "lucide-react";
import { AccessBadge } from "@/components/AccessBadge";
import { AcademicBadgeList } from "@/components/AcademicBadge";
import { RelatedDatasets } from "@/components/RelatedDatasets";
import { InContentAd } from "@/components/ads/ContentWithAds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCluster } from "@/data/clusters";
import { datasets, getDatasetBySlug } from "@/data/datasets";
import { getWaveForDataset } from "@/data/series";
import { guideKindLabel, resolveGuides } from "@/lib/guides";
import {
  breadcrumbJsonLd,
  datasetJsonLd,
  faqJsonLd,
  serializeJsonLd,
} from "@/lib/seo/jsonLd";
import {
  datasetFaqs,
  datasetSeoDescription,
  datasetSeoTitle,
} from "@/lib/seo/datasetMeta";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { resolveVariables } from "@/lib/variables";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return datasets.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = getDatasetBySlug(slug);
  if (!d) return { title: "Dataset" };
  return buildPageMetadata({
    title: datasetSeoTitle(d),
    description: datasetSeoDescription(d),
    path: `/datasets/${d.slug}`,
  });
}

export default async function DatasetPage({ params }: Props) {
  const { slug } = await params;
  const dataset = getDatasetBySlug(slug);
  if (!dataset) notFound();

  const cluster = getCluster(dataset.cluster);
  const seriesMeta = getWaveForDataset(dataset.slug);
  const variableInfo = resolveVariables(dataset);
  const guides = resolveGuides(dataset);
  const isLive = /live-fetch/i.test(variableInfo.source);
  const faqs = datasetFaqs(dataset);
  const faqSchema = faqJsonLd(faqs);

  const breadcrumbItems = [
    { name: "Map", path: "/map" },
    ...(seriesMeta
      ? [
          {
            name: seriesMeta.series.shortTitle,
            path: `/series/${seriesMeta.series.slug}`,
          },
        ]
      : cluster
        ? [{ name: cluster.shortName, path: "/clusters" }]
        : []),
    { name: dataset.shortTitle, path: `/datasets/${dataset.slug}` },
  ];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            datasetJsonLd(dataset, {
              seriesSlug: seriesMeta?.series.slug,
              seriesTitle: seriesMeta?.series.title,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd(breadcrumbItems)),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(faqSchema),
          }}
        />
      )}
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center gap-2 text-sm text-obsidian-muted"
      >
        <Link
          href="/map"
          className="transition-colors hover:text-obsidian-purple-bright"
        >
          Map
        </Link>
        <span aria-hidden className="text-obsidian-muted/50">
          /
        </span>
        {seriesMeta ? (
          <>
            <Link
              href={`/series/${seriesMeta.series.slug}`}
              className="transition-colors hover:text-obsidian-purple-bright"
            >
              {seriesMeta.series.shortTitle}
            </Link>
            <span aria-hidden className="text-obsidian-muted/50">
              /
            </span>
            <span className="font-mono text-obsidian-purple-bright">
              {seriesMeta.wave.yearLabel}
            </span>
          </>
        ) : (
          <>
            {cluster && (
              <>
                <span className="text-obsidian-muted">{cluster.shortName}</span>
                <span aria-hidden className="text-obsidian-muted/50">
                  /
                </span>
              </>
            )}
            <span className="text-obsidian-text">{dataset.shortTitle}</span>
          </>
        )}
      </nav>

      <div className="mb-6">
        <Link
          href="/map"
          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#C4A574] transition hover:text-[#F3E4C9]"
        >
          ← Back to solar map
        </Link>
      </div>

      {/* Header */}
      <header className="border-b border-obsidian-border pb-8">
        {seriesMeta && (
          <Link
            href={`/series/${seriesMeta.series.slug}`}
            className="mb-4 inline-flex items-center rounded-full border border-obsidian-purple/30 bg-obsidian-purple/10 px-3 py-1 font-mono text-xs text-obsidian-purple-bright transition hover:border-obsidian-purple/50"
          >
            Part of {seriesMeta.series.shortTitle} · {seriesMeta.wave.yearLabel}
          </Link>
        )}
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-obsidian-muted">
          {dataset.abbreviations.join(" · ")}
        </p>
        <h1 className="font-display mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-obsidian-text sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {dataset.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#D3D4C0]/95 sm:text-lg">
          {dataset.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <AccessBadge accessType={dataset.accessType} />
          <AcademicBadgeList badges={dataset.academicBadges} />
          <Badge variant="outline" className="font-normal">
            {dataset.sizeTier}
          </Badge>
          {dataset.flags?.includes("good-starting") && (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 font-medium text-emerald-300"
            >
              Good starting dataset
            </Badge>
          )}
          {dataset.flags?.includes("best-district") && (
            <Badge
              variant="outline"
              className="border-violet-500/30 bg-violet-500/10 font-medium text-violet-300"
            >
              Strong district source
            </Badge>
          )}
        </div>

        {(dataset.authors || dataset.publicationYear) && (
          <p className="mt-4 text-sm text-obsidian-muted">
            {dataset.authors}
            {dataset.authors && dataset.publicationYear ? " · " : ""}
            {dataset.publicationYear}
            {dataset.repository ? ` · ${dataset.repository}` : ""}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {dataset.categories.map((c) => (
            <Link
              key={c}
              href={`/explore?category=${encodeURIComponent(c)}`}
              className="chip transition hover:border-[#C4A574]/40 hover:text-[#F3E4C9]"
            >
              {c}
            </Link>
          ))}
        </div>

        <nav
          aria-label="On this page"
          className="mt-6 flex flex-wrap gap-2"
        >
          {guides.length > 0 && (
            <Button asChild variant="outline" size="sm" className="min-h-11">
              <a href="#guides">
                <BookOpen className="size-3.5" aria-hidden />
                Guides ({guides.length})
              </a>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <a href="#variables">
              <Table2 className="size-3.5" aria-hidden />
              Variables ({variableInfo.entries.length})
            </a>
          </Button>
          {dataset.background && (
            <Button asChild variant="outline" size="sm" className="min-h-11">
              <a href="#background">
                <GitBranch className="size-3.5" aria-hidden />
                Background
              </a>
            </Button>
          )}
          {(dataset.accessUrl || dataset.docsUrl || dataset.dataDoi) && (
            <Button asChild variant="outline" size="sm" className="min-h-11">
              <a href="#access">
                <ExternalLink className="size-3.5" aria-hidden />
                Access
              </a>
            </Button>
          )}
        </nav>
      </header>

      {/* Meta grid */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Meta
          icon={<Building2 className="h-4 w-4" />}
          label="Host / institution"
          value={`${dataset.host} · ${dataset.institution}`}
        />
        <Meta
          icon={<MapPin className="h-4 w-4" />}
          label="Geography"
          value={dataset.geographyLevel.join(", ")}
        />
        <Meta
          icon={<Calendar className="h-4 w-4" />}
          label="Time coverage"
          value={dataset.timeCoverage}
        />
        <Meta
          icon={<RefreshCw className="h-4 w-4" />}
          label="Update frequency"
          value={dataset.updateFrequency}
        />
      </div>

      {/* Best for / limitations */}
      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-5 sm:p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
            What this is best for
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-100">
            {dataset.bestFor}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5 sm:p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
            Main limitations
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-100">
            {dataset.limitations}
          </p>
        </div>
      </section>

      {/* FAQ — catalog only; powers FAQPage JSON-LD without marketing clutter */}
      {faqs.length > 0 && (
        <section id="faq" className="mt-10 scroll-mt-24">
          <h2 className="section-title">Quick answers</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-obsidian-muted">
            Short research-facing answers derived from this catalog record.
          </p>
          <dl className="mt-5 space-y-3">
            {faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-xl border border-obsidian-border bg-obsidian-panel/40 px-4 py-3.5 sm:px-5"
              >
                <dt className="text-sm font-medium text-obsidian-text">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-obsidian-muted">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Survey family background / previous rounds */}
      {dataset.background && (
        <section id="background" className="mt-10 scroll-mt-24">
          <div className="rounded-2xl border border-[#C4A574]/25 bg-gradient-to-br from-[#C4A574]/[0.08] to-transparent p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4A574]">
              <GitBranch className="size-3.5" aria-hidden />
              Background & previous rounds
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-100">
              {dataset.background}
            </p>
            {seriesMeta && (
              <p className="mt-4 text-sm text-obsidian-muted">
                Full design timeline:{" "}
                <Link
                  href={`/series/${seriesMeta.series.slug}`}
                  className="text-obsidian-purple-bright link-underline"
                >
                  {seriesMeta.series.shortTitle} series page
                </Link>
              </p>
            )}
          </div>
        </section>
      )}

      {/* Guides */}
      {guides.length > 0 && (
        <section id="guides" className="mt-12 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="section-title flex items-center gap-2.5">
                <BookOpen
                  className="h-5 w-5 text-obsidian-purple-bright"
                  aria-hidden
                />
                Guides for using this data
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-obsidian-muted">
                Official portals, user guides, codebooks, and tutorials for
                access and analysis.
              </p>
            </div>
            <span className="chip tabular-nums">
              {guides.length} link{guides.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {guides.map((guide) => (
              <li key={guide.url}>
                <a
                  href={guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl border border-obsidian-border bg-obsidian-panel/50 px-4 py-3.5 transition-all duration-300 hover:border-obsidian-purple/45 hover:bg-obsidian-purple/5"
                >
                  <span className="mt-0.5 shrink-0 rounded-md border border-obsidian-border bg-obsidian-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-obsidian-muted">
                    {guideKindLabel(guide.kind)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-obsidian-text transition-colors group-hover:text-obsidian-purple-bright">
                      {guide.title}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-obsidian-muted">
                      {guide.url.replace(/^https?:\/\//, "")}
                    </span>
                  </span>
                  <ExternalLink
                    className="mt-1 h-3.5 w-3.5 shrink-0 text-obsidian-muted transition group-hover:text-obsidian-purple-bright"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Variables */}
      <section id="variables" className="mt-12 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="section-title flex items-center gap-2.5">
              <ListTree
                className="h-5 w-5 text-obsidian-purple-bright"
                aria-hidden
              />
              Variables
              <span className="chip tabular-nums font-sans text-[11px] font-normal">
                {variableInfo.entries.length}
              </span>
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-obsidian-muted">
              {variableInfo.source}. Representative fields for the page table —
              verify the full dictionary on the official site.
            </p>
            {isLive && (
              <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                Sourced from live host documentation
              </p>
            )}
          </div>
          {variableInfo.url && (
            <Button asChild variant="outline" size="sm" className="min-h-11">
              <a
                href={variableInfo.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open official dictionary
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </Button>
          )}
        </div>

        <Card className="mt-5 gap-0 overflow-hidden border-border py-0 ring-1 ring-border">
          <Table className="min-w-[28rem]">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-11 px-4 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                  Name / code
                </TableHead>
                <TableHead className="h-11 px-4 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                  Description
                </TableHead>
                <TableHead className="hidden h-11 px-4 text-[11px] tracking-[0.12em] text-muted-foreground uppercase sm:table-cell">
                  Group
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variableInfo.entries.map((v) => (
                <TableRow
                  key={`${v.name}-${v.label}`}
                  className="border-border/80"
                >
                  <TableCell className="px-4 py-3 font-mono text-xs whitespace-normal text-accent-foreground">
                    {v.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-normal text-foreground">
                    {v.label}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3 whitespace-normal text-muted-foreground sm:table-cell">
                    {v.group ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <InContentAd />

      {/* Formats / tags / uses */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="border-border bg-card ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Formats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {dataset.formats.join(" · ")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Technical tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {dataset.technicalTags.map((t) => (
                <Badge key={t} variant="outline" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card ring-1 ring-border sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Example uses
            </CardTitle>
            <CardDescription className="sr-only">
              Typical research and analysis uses for this dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {dataset.exampleUses}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Academic identifiers */}
      {(dataset.dataDoi || dataset.paperDoi || dataset.recommendedCitation) && (
        <Card className="mt-8 border-border bg-card ring-1 ring-border">
          <CardHeader>
            <CardTitle className="font-display text-base text-foreground">
              Academic identifiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {dataset.dataDoi && (
              <p>
                <span className="text-foreground">Data DOI:</span>{" "}
                <a
                  href={`https://doi.org/${dataset.dataDoi}`}
                  className="font-mono text-accent-foreground transition hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dataset.dataDoi}
                </a>
              </p>
            )}
            {dataset.paperDoi && (
              <p>
                <span className="text-foreground">Paper DOI:</span>{" "}
                <a
                  href={`https://doi.org/${dataset.paperDoi}`}
                  className="font-mono text-accent-foreground transition hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dataset.paperDoi}
                </a>
              </p>
            )}
            {dataset.recommendedCitation && (
              <p className="border-t border-border pt-3 text-xs leading-relaxed">
                {dataset.recommendedCitation}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Access CTAs — show every available external path */}
      <div
        id="access"
        className="mt-10 flex scroll-mt-24 flex-wrap gap-3 border-t border-border pt-8"
      >
        {dataset.accessUrl && (
          <Button asChild size="lg" className="h-11">
            <a
              href={dataset.accessUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open access portal
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </Button>
        )}
        {!dataset.accessUrl && dataset.dataDoi && (
          <Button asChild size="lg" className="h-11">
            <a
              href={`https://doi.org/${dataset.dataDoi}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open data DOI
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </Button>
        )}
        {dataset.dataDoi && dataset.accessUrl && (
          <Button asChild variant="outline" size="lg" className="h-11">
            <a
              href={`https://doi.org/${dataset.dataDoi}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Data DOI
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </Button>
        )}
        {dataset.docsUrl && (
          <Button asChild variant="outline" size="lg" className="h-11">
            <a
              href={dataset.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </Button>
        )}
        {dataset.paperDoi && (
          <Button asChild variant="outline" size="lg" className="h-11">
            <a
              href={`https://doi.org/${dataset.paperDoi}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open paper
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </Button>
        )}
        {(() => {
          const repo = dataset.repository?.trim();
          if (!repo) return null;
          const href = /^https?:\/\//i.test(repo)
            ? repo
            : /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)
              ? `https://github.com/${repo}`
              : null;
          if (!href) return null;
          return (
            <Button asChild variant="outline" size="lg" className="h-11">
              <a href={href} target="_blank" rel="noopener noreferrer">
                Repository
                <ExternalLink className="size-4" aria-hidden />
              </a>
            </Button>
          );
        })()}
        {!dataset.accessUrl && !dataset.docsUrl && !dataset.dataDoi && (
          <p className="text-sm text-muted-foreground">
            Access via {dataset.host} — search the official portal for current
            download or request paths.
          </p>
        )}
      </div>

      <RelatedDatasets dataset={dataset} />
    </article>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-obsidian-border bg-obsidian-panel/60 p-4 transition-colors hover:border-[rgba(243,228,201,0.28)]">
      <div className="flex items-center gap-2 text-obsidian-muted">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm leading-snug text-obsidian-text">{value}</p>
    </div>
  );
}
