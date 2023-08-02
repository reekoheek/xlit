import { describe, it, expect } from 'vitest';
import { ObjectType } from './ObjectType.js';
import { StringType } from './StringType.js';
import { NestedSchemaError } from './NestedSchemaError.js';

const schema = new ObjectType({
  foo: new StringType().required(),
  bar: new StringType(),
});

describe('ObjectType', () => {
  describe('#cast()', () => {
    it('cast to object', async() => {
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect(await schema.resolve(null)).toStrictEqual(undefined);
      expect(await schema.resolve('')).toStrictEqual(undefined);

      expect(await schema.resolve({ foo: 'foo' })).toMatchObject({ foo: 'foo' });
      expect(await schema.resolve({ foo: 'foo', bar: 'bar' })).toMatchObject({ foo: 'foo', bar: 'bar' });

      await expect(async() => await schema.resolve(99)).rejects.toThrowError(/invalid object/);
    });

    it('throw schema error', async() => {
      try {
        await schema.resolve({});
        throw new Error('unexpected');
      } catch (err) {
        if (!(err instanceof NestedSchemaError)) {
          throw err;
        }
        expect(Object.keys(err.children)).toMatchObject(['foo']);
      }
    });
  });

  describe('#pick()', () => {
    it('return picked object type', async() => {
      const schema = new ObjectType({
        foo: new StringType(),
        bar: new StringType(),
      }).pick(['bar']);

      expect(await schema.resolve({ foo: '1', bar: '2' })).toMatchObject({ bar: '2' });
    });
  });
});
