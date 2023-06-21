import { StringField } from './StringField.js';
import { assert } from '@open-wc/testing';
import { assertRejects } from 'testutil';

describe('StringField', () => {
  describe('#cast()', () => {
    it('cast to string', () => {
      const type = new StringField();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.strictEqual(type.cast('foo'), 'foo');

      assert.throws(() => type.cast(0), /invalid string/);
    });
  });

  describe('#minLength()', () => {
    it('validate min length', async() => {
      const type = new StringField().minLength(3);
      await assertRejects(() => type.runFilters('12'), /minimum length must be 3/);
      assert.strictEqual(await type.runFilters('123'), '123');
      assert.strictEqual(await type.runFilters('1234'), '1234');
      assert.strictEqual(await type.runFilters(undefined), undefined);
    });
  });

  describe('#maxLength()', () => {
    it('validate max length', async() => {
      const type = new StringField().maxLength(3);
      await assertRejects(() => type.runFilters('1234'), /maximum length must be 3/);
      assert.strictEqual(await type.runFilters('123'), '123');
      assert.strictEqual(await type.runFilters('12'), '12');
      assert.strictEqual(await type.runFilters(undefined), undefined);
    });
  });

  describe('#trim()', () => {
    it('trim', async() => {
      const type = new StringField().trim();
      assert.strictEqual(await type.runFilters('foo'), 'foo');
      assert.strictEqual(await type.runFilters(' foo '), 'foo');
      assert.strictEqual(await type.runFilters('  '), undefined);
      assert.strictEqual(await type.runFilters(undefined), undefined);
    });
  });

  describe('#match()', () => {
    it('match regexp', async() => {
      const type = new StringField().match(/[0-9]+/, 'wrong number');
      assert.strictEqual(await type.runFilters(undefined), undefined);
      assert.strictEqual(await type.runFilters('234'), '234');
      await assertRejects(async() => await type.runFilters('abc'), 'wrong number');
    });
  });
});
