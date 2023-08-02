import { describe, it, expect } from 'vitest';
import { BigIntType } from './BigIntType.js';

describe('BigIntType', () => {
  describe('#cast()', () => {
    it('cast to bigint', async() => {
      const schema = new BigIntType();
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect(await schema.resolve(null)).toStrictEqual(undefined);
      expect(await schema.resolve('')).toStrictEqual(undefined);
      expect(await schema.resolve(1000)).toStrictEqual(1000n);
      expect(await schema.resolve('1000')).toStrictEqual(1000n);

      await expect(async() => await schema.resolve({})).rejects.toThrowError(/invalid bigint/);
    });
  });

  describe('#gte()', () => {
    it('validate greater than equal', async() => {
      const schema = new BigIntType().gte(3n);
      expect(await schema.resolve(3)).toStrictEqual(3n);
      expect(await schema.resolve(4)).toStrictEqual(4n);
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      await expect(() => schema.resolve(2)).rejects.toThrowError(/must be greater than or equal to 3/);
    });
  });

  describe('#gt()', () => {
    it('validate greater than', async() => {
      const schema = new BigIntType().gt(3n);
      expect(await schema.resolve(4)).toStrictEqual(4n);
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      await expect(() => schema.resolve(3)).rejects.toThrowError(/must be greater than 3/);
    });
  });

  describe('#lte()', () => {
    it('validate lower than equal', async() => {
      const schema = new BigIntType().lte(3n);
      expect(await schema.resolve(3)).toStrictEqual(3n);
      expect(await schema.resolve(2)).toStrictEqual(2n);
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      await expect(() => schema.resolve(4)).rejects.toThrowError(/must be lower than or equal to 3/);
    });
  });

  describe('#lt()', () => {
    it('validate greater than', async() => {
      const schema = new BigIntType().lt(3n);
      expect(await schema.resolve(2)).toStrictEqual(2n);
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      await expect(() => schema.resolve(3)).rejects.toThrowError(/must be lower than 3/);
    });
  });
});
