import { describe, it, expect } from 'vitest';
import { Context } from './Context.js';

describe('Context', () => {
  describe('#equals()', () => {
    it('false if different path', () => {
      const ctx1 = new Context('/foo');
      const ctx2 = new Context('/bar');
      expect(ctx1.equals(ctx2)).toStrictEqual(false);
    });

    it('false if different query', () => {
      const ctx1 = new Context('/foo?bar=1');
      const ctx2 = new Context('/foo?bar=2');
      expect(ctx1.equals(ctx2)).toStrictEqual(false);
    });

    it('true if same path and query', () => {
      const ctx1 = new Context('/foo?bar=1&baz=2');
      const ctx2 = new Context('/foo?baz=2&bar=1');
      expect(ctx1.equals(ctx2)).toStrictEqual(true);
    });
  });
});
