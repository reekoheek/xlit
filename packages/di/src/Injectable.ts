import { Metadata } from './Metadata.js';

export interface Injectable {
  [key: string]: unknown;
  __diMetadata?: Metadata;
  __diInjected: Promise<unknown>;
}

export function getMetadata(obj: Injectable) {
  if (!obj.__diMetadata) {
    obj.__diMetadata = {
      lookupEntries: [],
      provideEntries: [],
    };
  }

  return obj.__diMetadata;
}
