import { DateType } from './DateType.js';
import { describe, it, expect } from 'vitest';

describe('DateType', () => {
  describe('#resolve()', () => {
    it('resolve value', async() => {
      const schema = new DateType();
      expect(await schema.resolve(undefined), undefined);
      expect(await schema.resolve(null), undefined);
      expect(await schema.resolve(''), undefined);
      expect((await schema.resolve('2023-04-05T06:07:08.000Z'))?.toJSON(), '2023-04-05T06:07:08.000Z');
      expect((await schema.resolve(0))?.toJSON(), '1970-01-01T00:00:00.000Z');
      expect((await schema.resolve(new Date('2023-04-05T06:07:08.000Z')))?.toJSON(), '2023-04-05T06:07:08.000Z');

      await expect(async() => await schema.resolve('ouch')).rejects.toThrowError(/invalid date/);
      await expect(async() => await schema.resolve(10000000000000000)).rejects.toThrowError(/invalid date/);
      await expect(async() => await schema.resolve({})).rejects.toThrowError(/invalid date/);
    });
  });

  describe('#gte', () => {
    it('validate greater than or equal', async() => {
      const schema = new DateType().gte(new Date(1000));
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect((await schema.resolve(new Date(1000)))?.toJSON()).toStrictEqual(new Date(1000).toJSON());
      await expect(async() => await schema.resolve(new Date(999))).rejects
        .toThrowError(/must be greater than or equal/);
    });
  });

  describe('#gt', () => {
    it('validate greater than', async() => {
      const schema = new DateType().gt(new Date(1000));
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect((await schema.resolve(new Date(1001)))?.toJSON()).toStrictEqual(new Date(1001).toJSON());
      await expect(async() => await schema.resolve(new Date(1000))).rejects
        .toThrowError(/must be greater than specified date/);
    });
  });

  describe('#lte', () => {
    it('validate lower than or equal', async() => {
      const schema = new DateType().lte(new Date(1000));
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect((await schema.resolve(new Date(1000)))?.toJSON()).toStrictEqual(new Date(1000).toJSON());
      expect((await schema.resolve(new Date(999)))?.toJSON()).toStrictEqual(new Date(999).toJSON());
      await expect(async() => await schema.resolve(new Date(1001))).rejects
        .toThrowError(/must be lower than or equal/);
    });
  });

  describe('#lt', () => {
    it('validate lower than', async() => {
      const schema = new DateType().lt(new Date(1000));
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect((await schema.resolve(new Date(999)))?.toJSON()).toStrictEqual(new Date(999).toJSON());
      await expect(async() => await schema.resolve(new Date(1000))).rejects
        .toThrowError(/must be lower than specified date/);
    });
  });
});
