import { assert } from '@open-wc/testing';
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
    assert.strictEqual(metadata['lookupEntries'].length, 2);
  });
});
