import type { AcademicBadge as Badge } from "@/types/dataset";

const LABELS: Record<Badge, string> = {
  "core-reference": "Core reference",
  "survey-microdata": "Survey microdata",
  replication: "Replication package",
  "mixed-restricted": "Mixed / restricted inputs",
  "metadata-incomplete": "Metadata incomplete",
};

const STYLES: Record<Badge, string> = {
  "core-reference":
    "border-sky-500/40 bg-sky-500/10 text-sky-200",
  "survey-microdata":
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  replication:
    "border-violet-500/40 bg-violet-500/10 text-violet-200",
  "mixed-restricted":
    "border-orange-500/40 bg-orange-500/10 text-orange-200",
  "metadata-incomplete":
    "border-neutral-500/40 bg-neutral-500/10 text-neutral-300",
};

export function AcademicBadge({
  badge,
  className = "",
}: {
  badge: Badge;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${STYLES[badge]} ${className}`}
    >
      {LABELS[badge]}
    </span>
  );
}

export function AcademicBadgeList({
  badges,
}: {
  badges?: Badge[];
}) {
  if (!badges?.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <AcademicBadge key={b} badge={b} />
      ))}
    </span>
  );
}
