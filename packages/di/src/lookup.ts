import { metadataOf } from './Metadata.js';

export function lookup(name?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propName: string) => {
    const from = name ?? propName;
    const to = propName;
    metadataOf(target).addLookupEntry({ from, to });
  };
}
