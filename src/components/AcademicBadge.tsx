import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AcademicBadge as BadgeType } from "@/types/dataset";

const LABELS: Record<BadgeType, string> = {
  "core-reference": "Core reference",
  "survey-microdata": "Survey microdata",
  replication: "Replication package",
  "mixed-restricted": "Mixed / restricted inputs",
  "metadata-incomplete": "Metadata incomplete",
  "github-repo": "GitHub repo",
  "historical-archive": "Historical archive",
};

const STYLES: Record<BadgeType, string> = {
  "core-reference": "border-sky-500/40 bg-sky-500/10 text-sky-200",
  "survey-microdata": "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  replication: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  "mixed-restricted": "border-orange-500/40 bg-orange-500/10 text-orange-200",
  "metadata-incomplete":
    "border-neutral-500/40 bg-neutral-500/10 text-neutral-300",
  "github-repo": "border-slate-400/40 bg-slate-500/15 text-slate-200",
  "historical-archive": "border-amber-500/40 bg-amber-500/10 text-amber-200",
};

function AcademicBadge({
  badge,
  className = "",
}: {
  badge: BadgeType;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border font-medium tracking-wide", STYLES[badge], className)}
    >
      {LABELS[badge]}
    </Badge>
  );
}

export function AcademicBadgeList({
  badges,
}: {
  badges?: BadgeType[];
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
