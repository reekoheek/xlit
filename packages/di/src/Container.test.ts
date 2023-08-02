import { beforeEach, describe, expect, it } from 'vitest';
import { Container } from './Container.js';

describe('Container', () => {
  beforeEach(() => {
    Container.reset();
  });

  describe('.instance()', () => {
    it('return singleton instance', () => {
      const instance1 = Container.instance();
      const instance2 = Container.instance();
      expect(instance1).toStrictEqual(instance2);
    });
  });

  describe('#provide()', () => {
    it('add provider', () => {
      const container = new Container();
      container.provide('foo', () => 'foo');
      expect(Object.keys(container['fns'])).toMatchObject(['foo']);

      expect(() => {
        container.provide('foo', () => 'bar');
      }).toThrowError(/already provided key/);
    });
  });

  describe('#lookup()', () => {
    it('lookup with key', () => {
      const container = new Container();
      const hits: string[] = [];
      container.provide('foo', () => {
        hits.push('hit');
        return 'foo';
      });
      const value = container.lookup('foo');
      expect(value).toStrictEqual('foo');
      expect(hits).toMatchObject(['hit']);

      expect(() => {
        container.lookup('bar');
      }).toThrowError(/provider not found to lookup/);
    });
  });
});
