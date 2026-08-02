import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Mail } from "lucide-react";
import { datasets } from "@/data/datasets";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Editorial methodology",
  description:
    "How the Guide to Indian Data selects sources, normalizes metadata, labels access, records limitations, and handles corrections.",
  path: "/methodology",
});

const accessLabels = [
  {
    label: "Open download",
    meaning:
      "A user can reach downloadable files without an application or paid account. File formats and documentation quality may still vary.",
  },
  {
    label: "Public dashboard",
    meaning:
      "The source is openly viewable, but bulk files or stable machine-readable access may not be available.",
  },
  {
    label: "Registration required",
    meaning:
      "An account or project description is required before files can be accessed. Registration is not described as open download.",
  },
  {
    label: "Data-use agreement",
    meaning:
      "Access depends on accepting specific terms, institutional review, or a formal application process.",
  },
  {
    label: "Request-only",
    meaning:
      "The source identifies a request path, but approval, response time, or continued availability is uncertain.",
  },
  {
    label: "Paid subscription",
    meaning:
      "Meaningful access requires payment or an institutional subscription; a preview alone does not count as open data.",
  },
];

const editorialFields = [
  "A plain-language summary of what the source is useful for",
  "Stewarding institution and original host",
  "Geographic level and time coverage",
  "Access conditions and practical friction",
  "Representative variables, formats, and technical tags",
  "Best-use guidance, limitations, and complementary datasets",
];

export default function MethodologyPage() {
  return (
    <article className="max-w-4xl">
      <header className="mb-12 max-w-3xl">
        <p className="page-kicker">Editorial standard</p>
        <h1 className="page-title">How this guide is researched</h1>
        <p className="page-lede">
          The Guide to Indian Data currently organizes {datasets.length} dataset
          records. It does not host the underlying data or replace official
          documentation. Its original contribution is a consistent research
          layer that helps people judge relevance, access, and limitations
          before opening a portal or beginning an application.
        </p>
      </header>

      <section className="grid-hairline sm:grid-cols-3" aria-label="Editorial workflow">
        {[
          {
            number: "01",
            title: "Select",
            text: "Include sources with a recognizable steward, a clear connection to research on India, and enough public evidence to describe without speculation.",
          },
          {
            number: "02",
            title: "Normalize",
            text: "Translate uneven portal descriptions into comparable fields while preserving the source's own terminology, attribution, and access conditions.",
          },
          {
            number: "03",
            title: "Qualify",
            text: "Add practical guidance about best uses, limitations, documentation gaps, and related sources that may strengthen or challenge an analysis.",
          },
        ].map((step) => (
          <div key={step.number} className="bg-obsidian-panel p-6 sm:p-7">
            <p className="font-mono text-[10px] text-[#C4A574]">{step.number}</p>
            <h2 className="font-display mt-3 text-xl font-semibold text-[#F3E4C9]">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#D3D4C0]">
              {step.text}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="page-kicker">Selection</p>
          <h2 className="section-title mt-3">What belongs in the catalog</h2>
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-[#D3D4C0]">
          <p>
            Sources are considered when they support empirical work on India or
            provide essential research infrastructure such as geographic
            boundaries, administrative concordances, or documented replication
            files. Government surveys and administrative systems sit alongside
            academic deposits and maintained community projects because each
            solves a different part of the research workflow.
          </p>
          <p>
            Inclusion is not an endorsement of every value in a dataset. A
            record can be useful and still have serious limits: restricted
            access, historical geography, irregular updates, weak metadata, or
            uncertain continuity. Those qualifications belong on the record,
            not in fine print.
          </p>
          <p>
            Thin mirrors, unexplained file dumps, and sources with no credible
            attribution are not treated as equivalent to documented primary
            sources. Community repositories are labeled as such and linked to
            their maintainers rather than presented as official releases.
          </p>
        </div>
      </section>

      <section className="surface mt-12 p-6 sm:p-8">
        <h2 className="section-title">What the guide adds</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#D3D4C0]">
          Source portals often describe their own products well, but they rarely
          use the same vocabulary as one another. The guide records a compact
          set of comparable fields while directing users back to the original
          host for files, current rules, and authoritative documentation.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {editorialFields.map((field) => (
            <li
              key={field}
              className="flex gap-3 border-t border-obsidian-border pt-3 text-sm leading-relaxed text-[#D3D4C0]"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#C4A574]" aria-hidden />
              {field}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <p className="page-kicker">Access language</p>
        <h2 className="section-title mt-3">Labels describe the route, not the value</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#D3D4C0]">
          “Public” is not used as a synonym for “downloadable.” The access label
          records what a researcher is likely to encounter at the source. Users
          should still read the host&apos;s current terms before collecting or
          publishing data.
        </p>
        <dl className="mt-7 grid border-t border-obsidian-border sm:grid-cols-2">
          {accessLabels.map((item) => (
            <div
              key={item.label}
              className="border-b border-obsidian-border py-5 sm:odd:pr-7 sm:even:pl-7 sm:odd:border-r"
            >
              <dt className="font-display text-lg font-semibold text-[#F3E4C9]">
                {item.label}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#C8C9BC]">
                {item.meaning}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="surface p-6 sm:p-8">
          <h2 className="section-title">Updates and verification</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#D3D4C0]">
            Catalog changes are made from public source documentation and
            project research notes. Dates, links, and access routes can change
            after publication, especially on government portals. The guide
            therefore states uncertainty where appropriate and asks users to
            verify current rules with the host.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#D3D4C0]">
            Dataset summaries are written for this catalog. They are not copied
            abstracts, and they should not be cited as substitutes for a source
            questionnaire, codebook, methodology report, or repository record.
          </p>
        </div>
        <div className="surface p-6 sm:p-8">
          <h2 className="section-title">Corrections and accountability</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#D3D4C0]">
            A catalog of changing public systems will sometimes be incomplete.
            Corrections are welcome when a link has moved, an access label no
            longer reflects the host, or an editorial summary misses an
            important limitation. Please include the record URL and a primary
            source when possible.
          </p>
          <a
            href="mailto:Taha.i.siddiq@gmail.com?subject=Indian%20Data%20Guide%20correction"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#C4A574] link-underline"
          >
            <Mail className="size-4" aria-hidden />
            Send a correction
          </a>
        </div>
      </section>

      <section className="mt-12 border-t border-obsidian-border pt-8">
        <h2 className="section-title">Continue into the catalog</h2>
        <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
          {[
            { href: "/explore", label: "Explore all datasets" },
            { href: "/clusters", label: "Browse themes" },
            { href: "/series", label: "Compare series" },
            { href: "/about", label: "About the maintainer" },
            { href: "/privacy", label: "Privacy and advertising" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm text-[#C4A574] link-underline"
            >
              {link.label}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
