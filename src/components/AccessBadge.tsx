import { ACCESS_LABELS, ACCESS_STYLES } from "@/lib/access";
import type { AccessType } from "@/types/dataset";

export function AccessBadge({
  accessType,
  className = "",
}: {
  accessType: AccessType;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${ACCESS_STYLES[accessType]} ${className}`}
    >
      {ACCESS_LABELS[accessType]}
    </span>
  );
}
