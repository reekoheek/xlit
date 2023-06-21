import { BooleanField } from './BooleanField.js';
import { assert } from '@open-wc/testing';

describe('BooleanField', () => {
  describe('#cast()', () => {
    it('cast to string', () => {
      const type = new BooleanField();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.strictEqual(type.cast('true'), true);
      assert.strictEqual(type.cast('false'), false);
      assert.strictEqual(type.cast(true), true);
      assert.strictEqual(type.cast(false), false);

      assert.throws(() => type.cast({}), /invalid boolean/);
    });
  });
});
