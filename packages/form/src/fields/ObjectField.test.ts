import { ObjectField } from './ObjectField.js';
import { assert } from '@open-wc/testing';
import { StringField } from './StringField.js';
import { assertRejects } from 'testutil';

interface Foo {
  bar: string;
  baz?: string;
}

describe('ObjectField', () => {
  describe('#cast()', () => {
    it('cast to any', () => {
      const type = new ObjectField();
      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.deepStrictEqual(type.cast({}), {});
      assert.deepStrictEqual(type.cast({ foo: 'bar' }), { foo: 'bar' });

      assert.throws(() => type.cast('foo'), /invalid object/);
    });

    it('cast to type', () => {
      const type = new ObjectField<Foo>({
        bar: new StringField().required(),
        baz: new StringField(),
      });

      assert.strictEqual(type.cast(undefined), undefined);
      assert.strictEqual(type.cast(null), undefined);
      assert.strictEqual(type.cast(''), undefined);
      assert.deepStrictEqual(type.cast({}), {} as Foo);
      assert.deepStrictEqual(type.cast({ foo: 'bar' }), {} as Foo);

      assert.throws(() => type.cast('foo'), /invalid object/);
    });
  });

  describe('#resolve()', () => {
    it('resolve schema', async() => {
      const type = new ObjectField<Foo>({
        bar: new StringField().required(),
        baz: new StringField(),
      });

      assert.strictEqual(await type.runFilters(undefined), undefined);
      assert.deepStrictEqual(await type.runFilters({ bar: 'bar' }), { bar: 'bar' });
      await assertRejects(async() => await type.runFilters({ baz: 'baz' } as Foo), /invalid object violates schema/);
    });
  });
});
