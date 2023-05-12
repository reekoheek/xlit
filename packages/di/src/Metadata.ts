interface LookupEntry {
  readonly from: string;
  readonly to: string;
}

interface ProvideEntry {
  readonly from: string;
  readonly to: string;
}

export interface Metadata {
  readonly lookupEntries: LookupEntry[];
  readonly provideEntries: ProvideEntry[];
}
