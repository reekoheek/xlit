import { Field } from './Field.js';
import { assertRejects } from 'testutil';
import { Maybe } from './Maybe.js';
import { assert } from '@open-wc/testing';

class TestField extends Field<string> {
  hits: string[] = [];

  cast(value: unknown): Maybe<string> {
    this.hits.push('cast');
    return `${value}`;
  }
}

describe('Field', () => {
  describe('#resolve()', () => {
    it('resolve value', async() => {
      const aField = new TestField()
        .filter((value) => {
          aField.hits.push('filter-1');
          return Promise.resolve(value);
        })
        .filter((value) => {
          aField.hits.push('filter-2');
          return Promise.resolve(value);
        });

      assert.strictEqual(await aField.runFilters('foo'), 'foo');
      assert.deepStrictEqual(aField.hits, ['filter-1', 'filter-2']);
    });
  });

  describe('#required()', () => {
    it('add required filter', async() => {
      const aField = new TestField().required();
      assert.strictEqual(aField['filters'].length, 1);
      assert.strictEqual(await aField['filters'][0]('foo'), 'foo');
      await assertRejects(() => aField['filters'][0](undefined), /must be required/);
    });
  });

  describe('#default()', () => {
    it('return value or default value', async() => {
      const aField = new TestField().default('def');
      assert.strictEqual(aField['filters'].length, 1);
      assert.strictEqual(await aField['filters'][0]('foo'), 'foo');
      assert.strictEqual(await aField['filters'][0](undefined), 'def');
    });
  });

  describe('#set()', () => {
    it('set attribute', () => {
      const aField = new TestField().set('foo', 'bar');
      assert.strictEqual(aField['attributes'].foo, 'bar');
    });
  });

  describe('#get()', () => {
    it('get attribute', () => {
      const aField = new TestField().set('foo', 'bar');
      assert.strictEqual(aField.get('foo'), 'bar');
      assert.throw(() => aField.get('bar'), /attribute not found/);
    });
  });

  describe('#unset()', () => {
    it('unset attribute', () => {
      const aField = new TestField().set('foo', 'bar');
      aField.unset('foo');
      assert.strictEqual(aField['attributes'].foo, undefined);
    });
  });
});
