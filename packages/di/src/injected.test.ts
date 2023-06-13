import { assert } from '@open-wc/testing';
import { injected } from './injected.js';

describe('injected()', () => {
  it('return promise', () => {
    assert.strictEqual(injected({ __diInjected: Promise.resolve() }) instanceof Promise, true);
    assert.throws(() => injected({}), /object.is not inject/);
  });
});
