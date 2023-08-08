import { assert } from '@open-wc/testing';
import { Context } from './Context.js';

describe('Context', () => {
  describe('#equals()', () => {
    it('false if different path', () => {
      const ctx1 = new Context('/foo');
      const ctx2 = new Context('/bar');
      assert.strictEqual(ctx1.equals(ctx2), false);
    });

    it('false if different query', () => {
      const ctx1 = new Context('/foo?bar=1');
      const ctx2 = new Context('/foo?bar=2');
      assert.strictEqual(ctx1.equals(ctx2), false);
    });

    it('true if same path and query', () => {
      const ctx1 = new Context('/foo?bar=1&baz=2');
      const ctx2 = new Context('/foo?baz=2&bar=1');
      assert.strictEqual(ctx1.equals(ctx2), true);
    });
  });
});
