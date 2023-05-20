import { DIError } from './DIError.js';
import { metadataOf } from './Metadata.js';

export function lookup(name?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, ctx: unknown) => {
    if (typeof ctx !== 'string') throw new DIError('unimplemented new decorator spec');

    const from = name ?? ctx;
    const to = ctx;
    metadataOf(target).addLookupEntry({ from, to });
  };
}
