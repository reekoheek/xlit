import { describe, it, expect } from 'vitest';
import { lookup } from './lookup.js';
import { metadataOf } from './Metadata.js';

describe('lookup()', () => {
  it('add lookup entry to metadata', () => {
    class Component {
      @lookup()
      foo!: string;

      @lookup()
      bar!: string;
    }

    const metadata = metadataOf(Component.prototype);
    expect(metadata['lookupEntries'].length).toStrictEqual(2);
  });
});
