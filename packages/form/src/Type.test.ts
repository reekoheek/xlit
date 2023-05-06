import { Type } from './Type';
import { assertRejects } from './asserts/assertRejects';
import { Maybe } from './utils/Maybe';
import { assert } from '@open-wc/testing';

describe('Type', () => {
  describe('#resolve()', () => {
    it('resolve value', async() => {
      const aType = new TestType()
        .filter((value) => {
          aType.hits.push('filter-1');
          return Promise.resolve(value);
        })
        .filter((value) => {
          aType.hits.push('filter-2');
          return Promise.resolve(value);
        });

      assert.strictEqual(await aType.resolve('foo'), 'foo');
      assert.deepStrictEqual(aType.hits, ['filter-1', 'filter-2']);
    });
  });

  describe('#required()', () => {
    it('add required filter', async() => {
      const aType = new TestType().required();
      assert.strictEqual(aType['filters'].length, 1);
      assert.strictEqual(await aType['filters'][0]('foo'), 'foo');
      await assertRejects(() => aType['filters'][0](undefined), /must be required/);
    });
  });

  describe('#default()', () => {
    it('return value or default value', async() => {
      const aType = new TestType().default('def');
      assert.strictEqual(aType['filters'].length, 1);
      assert.strictEqual(await aType['filters'][0]('foo'), 'foo');
      assert.strictEqual(await aType['filters'][0](undefined), 'def');
    });
  });
});

class TestType extends Type<string> {
  hits: string[] = [];

  cast(value: unknown): Maybe<string> {
    this.hits.push('cast');
    return `${value}`;
  }
}
