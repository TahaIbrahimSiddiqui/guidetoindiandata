import { Badge } from "@/components/ui/badge";
import { ACCESS_LABELS, ACCESS_STYLES } from "@/lib/access";
import { cn } from "@/lib/utils";
import type { AccessType } from "@/types/dataset";

export function AccessBadge({
  accessType,
  className = "",
}: {
  accessType: AccessType;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium tracking-wide",
        ACCESS_STYLES[accessType],
        className,
      )}
    >
      {ACCESS_LABELS[accessType]}
    </Badge>
  );
}
