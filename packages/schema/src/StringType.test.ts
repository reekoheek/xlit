import { describe, it, expect } from 'vitest';
import { StringType } from './StringType.js';

describe('StringType', () => {
  describe('#resolve()', () => {
    it('resolve value', async() => {
      const schema = new StringType();
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect(await schema.resolve(null)).toStrictEqual(undefined);
      expect(await schema.resolve('')).toStrictEqual(undefined);
      expect(await schema.resolve('foo')).toStrictEqual('foo');

      await expect(async() => await schema.resolve(0)).rejects.toThrowError(/invalid string/);
    });
  });

  describe('#minLength()', () => {
    it('validate min length', async() => {
      const schema = new StringType().minLength(3);
      await expect(async() => await schema.resolve('12')).rejects.toThrowError(/minimum length must be 3/);
      expect(await schema.resolve('123'), '123');
      expect(await schema.resolve('1234'), '1234');
      expect(await schema.resolve(undefined), undefined);
    });
  });

  describe('#maxLength()', () => {
    it('validate max length', async() => {
      const schema = new StringType().maxLength(3);
      await expect(async() => await schema.resolve('1234')).rejects.toThrowError(/maximum length must be 3/);
      expect(await schema.resolve('123'), '123');
      expect(await schema.resolve('12'), '12');
      expect(await schema.resolve(undefined), undefined);
    });
  });

  describe('#trim()', () => {
    it('trim', async() => {
      const schema = new StringType().trim();
      expect(await schema.resolve('foo'), 'foo');
      expect(await schema.resolve(' foo '), 'foo');
      expect(await schema.resolve('  '), undefined);
      expect(await schema.resolve(undefined), undefined);
    });
  });

  describe('#match()', () => {
    it('match regexp', async() => {
      const schema = new StringType().match(/\d+/, 'wrong number');
      expect(await schema.resolve(undefined), undefined);
      expect(await schema.resolve('234'), '234');
      await expect(async() => await schema.resolve('abc')).rejects.toThrowError('wrong number');
    });
  });
});
