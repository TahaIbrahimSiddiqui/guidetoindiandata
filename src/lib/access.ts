import type { AccessType } from "@/types/dataset";

export const ACCESS_LABELS: Record<AccessType, string> = {
  "open-download": "Open download",
  "public-dashboard": "Public dashboard",
  registration: "Registration required",
  "data-use-agreement": "Data-use agreement",
  "request-only": "Request-only",
  "paid-subscription": "Paid subscription",
};

export const ACCESS_STYLES: Record<AccessType, string> = {
  "open-download":
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "public-dashboard":
    "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  registration: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  "data-use-agreement":
    "border-orange-500/40 bg-orange-500/10 text-orange-200",
  "request-only": "border-rose-500/40 bg-rose-500/10 text-rose-200",
  "paid-subscription":
    "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200",
};
