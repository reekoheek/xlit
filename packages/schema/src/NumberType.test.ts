import { describe, it, expect } from 'vitest';
import { NumberType } from './NumberType.js';

describe('NumberType', () => {
  describe('#resolve()', () => {
    it('resolve value', async() => {
      const schema = new NumberType();
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect(await schema.resolve(null)).toStrictEqual(undefined);
      expect(await schema.resolve('')).toStrictEqual(undefined);
      expect(await schema.resolve('92')).toStrictEqual(92);
      expect(await schema.resolve(100)).toStrictEqual(100);

      await expect(async() => await schema.resolve({})).rejects.toThrowError(/invalid number/);
    });
  });

  describe('#gte()', () => {
    it('validate greater than equal', async() => {
      const schema = new NumberType().gte(3);
      expect(await schema.resolve(3)).toStrictEqual(3);
      expect(await schema.resolve(4)).toStrictEqual(4);
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      await expect(() => schema.resolve(2.99)).rejects.toThrowError(/must be greater than or equal to 3/);
    });
  });

  describe('#gt()', () => {
    it('validate greater than', async() => {
      const schema = new NumberType().gt(3);
      expect(await schema.resolve(3.1)).toStrictEqual(3.1);
      expect(await schema.resolve(4)).toStrictEqual(4);
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      await expect(() => schema.resolve(3)).rejects.toThrowError(/must be greater than 3/);
    });
  });

  describe('#lte()', () => {
    it('validate lower than equal', async() => {
      const schema = new NumberType().lte(3);
      expect(await schema.resolve(3)).toStrictEqual(3);
      expect(await schema.resolve(2)).toStrictEqual(2);
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      await expect(() => schema.resolve(3.1)).rejects.toThrowError(/must be lower than or equal to 3/);
    });
  });

  describe('#lt()', () => {
    it('validate greater than', async() => {
      const schema = new NumberType().lt(3);
      expect(await schema.resolve(2.99)).toStrictEqual(2.99);
      expect(await schema.resolve(2)).toStrictEqual(2);
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      await expect(() => schema.resolve(3)).rejects.toThrowError(/must be lower than 3/);
    });
  });
});
