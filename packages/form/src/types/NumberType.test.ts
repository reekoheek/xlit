import { NumberType } from './NumberType.js';
import { assert } from '@open-wc/testing';
import { assertRejects } from 'testutil';

describe('NumberType', () => {
  describe('#cast()', () => {
    it('cast to string', () => {
      const type = new NumberType();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.strictEqual(type.cast('92'), 92);
      assert.strictEqual(type.cast(100), 100);

      assert.throws(() => type.cast({}), /must be number/);
    });
  });

  describe('#min()', () => {
    it('validate min', async() => {
      const type = new NumberType().min(3);
      await assertRejects(() => type['filters'][0](2), /minimum value must be 3/);
      assert.strictEqual(await type['filters'][0](3), 3);
      assert.strictEqual(await type['filters'][0](4), 4);
      assert.strictEqual(await type['filters'][0](undefined), undefined);
    });
  });

  describe('#max()', () => {
    it('validate max', async() => {
      const type = new NumberType().max(3);
      await assertRejects(() => type['filters'][0](4), /maximum value must be 3/);
      assert.strictEqual(await type['filters'][0](3), 3);
      assert.strictEqual(await type['filters'][0](2), 2);
      assert.strictEqual(await type['filters'][0](undefined), undefined);
    });
  });
});
