import { DatetimeField } from './DatetimeField.js';
import { assert } from '@open-wc/testing';
import { assertRejects } from 'testutil';

describe('DatetimeField', () => {
  describe('#cast()', () => {
    it('cast to date', () => {
      const type = new DatetimeField();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.strictEqual(type.cast('2023-04-05T06:07:08.000Z')?.toJSON(), '2023-04-05T06:07:08.000Z');
      assert.strictEqual(type.cast(0)?.toJSON(), '1970-01-01T00:00:00.000Z');
      assert.strictEqual(type.cast(new Date('2023-04-05T06:07:08.000Z'))?.toJSON(), '2023-04-05T06:07:08.000Z');

      assert.throws(() => type.cast('ouch'), /invalid date/);
      assert.throws(() => type.cast(10000000000000000), /invalid date/);
      assert.throws(() => type.cast({}), /invalid date/);
    });
  });

  describe('#min()', () => {
    it('validate min', async() => {
      const type = new DatetimeField().min(new Date('2001-01-01T00:00:00.000Z'));
      await assertRejects(() => type.runFilters(new Date('2000-12-31T23:59:59.999Z')), /minimum value exceeded/);
      assert.strictEqual(await type.runFilters(undefined), undefined);
      assert.strictEqual(
        (await type.runFilters(new Date('2001-01-01T00:00:00.000Z')))?.toJSON(),
        '2001-01-01T00:00:00.000Z',
      );
      assert.strictEqual(
        (await type.runFilters(new Date('2001-01-01T00:00:00.001Z')))?.toJSON(),
        '2001-01-01T00:00:00.001Z',
      );
    });
  });

  describe('#max()', () => {
    it('validate max', async() => {
      const type = new DatetimeField().max(new Date('2001-01-01T00:00:00.000Z'));
      await assertRejects(() => type.runFilters(new Date('2001-01-01T00:00:00.001Z')), /maximum value exceeded/);
      assert.strictEqual(await type.runFilters(undefined), undefined);
      assert.strictEqual(
        (await type.runFilters(new Date('2001-01-01T00:00:00.000Z')))?.toJSON(),
        '2001-01-01T00:00:00.000Z',
      );
      assert.strictEqual(
        (await type.runFilters(new Date('2000-12-31T23:59:59.999Z')))?.toJSON(),
        '2000-12-31T23:59:59.999Z',
      );
    });
  });
});
