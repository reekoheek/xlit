import { assert } from '@open-wc/testing';
import { singleton } from './singleton.js';
import { Container } from './Container.js';

describe('singleton()', () => {
  it('generate singleton provider', () => {
    let i = 0;
    const fn = singleton(() => i++);
    assert.strictEqual(0, fn(new Container()));
    assert.strictEqual(0, fn(new Container()));
  });
});
