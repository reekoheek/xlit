import { describe, it, expect } from 'vitest';
import { BooleanType } from './BooleanType.js';

describe('BooleanType', () => {
  describe('#resolve()', () => {
    it('resolve value', async() => {
      const schema = new BooleanType();
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect(await schema.resolve(null)).toStrictEqual(undefined);
      expect(await schema.resolve('')).toStrictEqual(undefined);
      expect(await schema.resolve('true')).toStrictEqual(true);
      expect(await schema.resolve('false')).toStrictEqual(false);
      expect(await schema.resolve(true)).toStrictEqual(true);
      expect(await schema.resolve(false)).toStrictEqual(false);
      expect(await schema.resolve(0)).toStrictEqual(false);
      expect(await schema.resolve(1)).toStrictEqual(true);
      expect(await schema.resolve(-1)).toStrictEqual(true);
      expect(await schema.resolve(99)).toStrictEqual(true);

      await expect(async() => await schema.resolve({})).rejects.toThrowError(/invalid boolean/);
    });
  });
});
