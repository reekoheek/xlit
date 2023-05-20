import { assert } from '@open-wc/testing';
import { provide } from './provide';

describe('provide()', () => {
  it('add provide entry to metadata', () => {
    @provide()
    class Component {
      @provide()
      foo = 'foo';
    }

    assert.strictEqual(Component.prototype['__diMetadata'].provideClassEntry?.to, 'component');
    assert.strictEqual(Component.prototype['__diMetadata'].provideEntries.length, 1);
  });
});
