import { assert } from '@open-wc/testing';
import { provide } from './provide.js';
import { metadataOf } from './Metadata.js';

describe('provide()', () => {
  it('add provide entry to metadata', () => {
    @provide()
    class Component {
      @provide()
      foo = 'foo';
    }

    const metadata = metadataOf(Component.prototype);

    assert.strictEqual(metadata['provideClassEntry']?.to, 'component');
    assert.strictEqual(metadata['provideEntries'].length, 1);
  });
});
