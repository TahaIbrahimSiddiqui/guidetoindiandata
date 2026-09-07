export type DatasetUseSearchOverride = {
  additionalNames?: string[];
  requireIndiaContext?: boolean;
  disableTitleAutoApproval?: boolean;
};

/** Manual precision rules for names that are unusually broad or ambiguous. */
export const DATASET_USE_SEARCH_OVERRIDES: Record<
  string,
  DatasetUseSearchOverride
> = {
  hmis: { requireIndiaContext: true },
  iip: { requireIndiaContext: true },
  "road-accidents-india": { disableTitleAutoApproval: true },
  "data-gov-in-hub": { disableTitleAutoApproval: true },
  "nss-microdata-catalog": { disableTitleAutoApproval: true },
  "kerala-ogd-portal": { disableTitleAutoApproval: true },
  "niti-for-states-data": { disableTitleAutoApproval: true },
  "sage-global-elections-india-2019": {
    additionalNames: ["The Small-Area Global Elections (SAGE) Dataset"],
  },
};
