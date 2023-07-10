import { describe, it, expect } from 'vitest';
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

    expect(metadata['provideClassEntry']?.to).toStrictEqual('component');
    expect(metadata['provideEntries']?.length).toStrictEqual(1);
  });
});
