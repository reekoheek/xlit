import { ObjectType } from './ObjectType.js';
import { assert } from '@open-wc/testing';

describe('ObjectType', () => {
  describe('#cast()', () => {
    it('cast to string', () => {
      const type = new ObjectType();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.deepStrictEqual(type.cast({}), {});
      assert.deepStrictEqual(type.cast({ foo: 'bar' }), { foo: 'bar' });

      assert.throws(() => type.cast('foo'), /invalid object/);
    });
  });
});
