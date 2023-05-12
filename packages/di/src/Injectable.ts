import { DIError } from './DIError.js';
import { Metadata } from './Metadata.js';

export interface Injectable {
  [key: string]: unknown;
  __diMetadata?: Metadata;
  __diInjected: Promise<unknown>;
}

function isInjectable(o: unknown): o is Injectable {
  return (o as Injectable).__diInjected !== undefined;
}

export function injected(obj: unknown): Promise<unknown> {
  if (!isInjectable(obj)) {
    throw new DIError('object is not injectable');
  }

  return obj.__diInjected;
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
