import { NumberField } from './NumberField.js';
import { assert } from '@open-wc/testing';
import { assertRejects } from 'testutil';

describe('NumberField', () => {
  describe('#cast()', () => {
    it('cast to string', () => {
      const type = new NumberField();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.strictEqual(type.cast('92'), 92);
      assert.strictEqual(type.cast(100), 100);

      assert.throws(() => type.cast({}), /invalid number/);
    });
  });

  describe('#min()', () => {
    it('validate min', async() => {
      const type = new NumberField().min(3);
      await assertRejects(() => type.runFilters(2), /minimum value must be 3/);
      assert.strictEqual(await type.runFilters(3), 3);
      assert.strictEqual(await type.runFilters(4), 4);
      assert.strictEqual(await type.runFilters(undefined), undefined);
    });
  });

  describe('#max()', () => {
    it('validate max', async() => {
      const type = new NumberField().max(3);
      await assertRejects(() => type.runFilters(4), /maximum value must be 3/);
      assert.strictEqual(await type.runFilters(3), 3);
      assert.strictEqual(await type.runFilters(2), 2);
      assert.strictEqual(await type.runFilters(undefined), undefined);
    });
  });
});
