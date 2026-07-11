import type { DatasetDraft } from "@/types/dataset";

/**
 * Automated catalog additions.
 *
 * The scheduled discovery workflow appends only records that pass duplicate
 * checks and the normal catalog audit. Keeping these separate from the
 * hand-curated government list makes later pruning/review easier.
 */
export const discoveredDatasets: DatasetDraft[] = [];
