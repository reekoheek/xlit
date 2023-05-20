import { assert } from '@open-wc/testing';
import { lookup } from './lookup';

describe('lookup()', () => {
  it('add lookup entry to metadata', () => {
    class Component {
      @lookup()
      foo!: string;

      @lookup()
      bar!: string;
    }

    assert.strictEqual(Component.prototype['__diMetadata'].lookupEntries.length, 2);
  });
});
