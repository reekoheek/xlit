import { describe, it, expect } from 'vitest';
import { UnknownType } from './UnknownType.js';

describe('UnknownType', () => {
  describe('#cast()', () => {
    it('cast to class instance', async() => {
      class Foo {
        constructor(public bar: string) {

        }
      }

      const schema = new UnknownType((value) => new Foo(`${value}`));
      expect(await schema.resolve(undefined)).toStrictEqual(undefined);
      expect(await schema.resolve(null)).toStrictEqual(undefined);
      expect(await schema.resolve('')).toStrictEqual(undefined);
      expect(await schema.resolve('bar')).instanceOf(Foo);
    });

    it('cast without factory', async() => {
      interface Foo {
        bar?: string;
      }

      const schema = new UnknownType<Foo>();
      expect(await schema.resolve({})).toEqual({});
    });
  });
});
