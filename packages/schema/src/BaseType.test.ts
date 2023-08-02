import { BaseType } from './BaseType.js';
import { describe, it, expect } from 'vitest';

describe('BaseType', () => {
  describe('#filter()', () => {
    it('add filter', () => {
      class MockType extends BaseType<string> {
        protected cast() {
          return 'mock';
        }
      }

      const schema = new MockType();
      const result = schema.filter((value) => value);
      expect(result).toStrictEqual(schema);
      expect(schema['filters'].length).toStrictEqual(1);
    });
  });

  describe('#resolve()', () => {
    it('cast and run filters', async() => {
      class MockType extends BaseType<string> {
        hits: string[] = [];

        protected cast(value: unknown) {
          this.hits.push('cast:' + value);
          return `mock:${value}`;
        }
      }

      const schema = new MockType()
        .filter((value) => {
          schema.hits.push('filter:' + value);
          return value;
        });

      const result = await schema.resolve('val');
      expect(result).toStrictEqual('mock:val');
      expect(schema.hits).toMatchObject(['cast:val', 'filter:mock:val']);
    });
  });

  describe('#required()', () => {
    it('throw error if undefined', async() => {
      class MockType extends BaseType<string | undefined> {
        protected cast(value: unknown) {
          if (!value) {
            return undefined;
          }

          if (typeof value === 'string') {
            return value;
          }

          throw new Error('invalid string');
        }
      }

      const schema = new MockType().required();
      await expect(async() => await schema.resolve(undefined)).rejects.toThrowError(/must be required/);
      expect(await schema.resolve('foo')).toStrictEqual('foo');
    });
  });

  describe('#default()', () => {
    it('set default value if resolving empty value', async() => {
      class MockType extends BaseType<string | undefined> {
        protected cast(value: unknown): string | Promise<string | undefined> | undefined {
          return value as string;
        }
      }
      const schema = new MockType().default('bar');
      expect(await schema.resolve('foo')).toStrictEqual('foo');
      expect(await schema.resolve(undefined)).toStrictEqual('bar');
    });
  });
});
