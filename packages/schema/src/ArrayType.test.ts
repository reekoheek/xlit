import { describe, it, expect } from 'vitest';
import { ArrayType } from './ArrayType.js';
import { StringType } from './StringType.js';
import { SchemaError } from './SchemaError.js';

describe('ArrayType', () => {
  describe('#cast()', () => {
    it('cast to array of type', async() => {
      const schema = new ArrayType(new StringType());

      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect(await schema.resolve(['foo', 'bar'])).toEqual(['foo', 'bar']);

      await expect(async() => await schema.resolve(99)).rejects.toThrowError(/invalid array/);
      await expect(async() => await schema.resolve(['foo', 1])).rejects.toThrowError(SchemaError);
    });
  });
});
