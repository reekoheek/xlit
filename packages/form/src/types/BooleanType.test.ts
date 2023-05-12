import { BooleanType } from './BooleanType.js';
import { assert } from '@open-wc/testing';

describe('BooleanType', () => {
  describe('#cast()', () => {
    it('cast to string', () => {
      const type = new BooleanType();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.strictEqual(type.cast('true'), true);
      assert.strictEqual(type.cast('false'), false);
      assert.strictEqual(type.cast(true), true);
      assert.strictEqual(type.cast(false), false);

      assert.throws(() => type.cast({}), /must be boolean/);
    });
  });
});
