import { StringType } from './StringType';
import { assert } from '@open-wc/testing';
import { assertRejects } from './asserts/assertRejects';

describe('StringType', () => {
  describe('#cast()', () => {
    it('cast to string', () => {
      const type = new StringType();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.strictEqual(type.cast('   '), undefined);
      assert.strictEqual(type.cast('foo'), 'foo');
      assert.strictEqual(type.cast(' foo '), 'foo');

      assert.throws(() => type.cast(0), /must be string/);
    });
  });

  describe('#minLength()', () => {
    it('validate min length', async() => {
      const type = new StringType().minLength(3);
      await assertRejects(() => type['filters'][0]('12'), /minimum length must be 3/);
      assert.strictEqual(await type['filters'][0]('123'), '123');
      assert.strictEqual(await type['filters'][0]('1234'), '1234');
      assert.strictEqual(await type['filters'][0](undefined), undefined);
    });
  });

  describe('#maxLength()', () => {
    it('validate max length', async() => {
      const type = new StringType().maxLength(3);
      await assertRejects(() => type['filters'][0]('1234'), /maximum length must be 3/);
      assert.strictEqual(await type['filters'][0]('123'), '123');
      assert.strictEqual(await type['filters'][0]('12'), '12');
      assert.strictEqual(await type['filters'][0](undefined), undefined);
    });
  });
});
