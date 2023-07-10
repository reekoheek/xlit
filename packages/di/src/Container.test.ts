import { describe, it, expect } from 'vitest';
import { Container, instance } from './index.js';

describe('Container', () => {
  describe('constructor', () => {
    it('create new container with configuration', () => {
      const container = new Container()
        .provide('bar', () => 'bar')
        .provide('baz', () => 'baz');

      expect(Object.keys(container['fns'])).toMatchObject(['bar', 'baz']);
    });
  });

  describe('#provide()', () => {
    it('add provider', async() => {
      const container = new Container();
      let hit = 0;
      container.provide('obj', (c) => {
        expect(c).toStrictEqual(container);
        hit++;
        return hit;
      });
      expect(await container.lookup('obj')).toStrictEqual(1);
      expect(await container.lookup('obj')).toStrictEqual(2);
    });
  });

  describe('#lookup()', () => {
    it('lookup instance', async() => {
      const container = new Container()
        .provide('foo', instance('foo'));
      expect(await container.lookup('foo')).toStrictEqual('foo');
      expect(async() => await container.lookup('bar')).rejects.toThrow(/provider not found to lookup "bar"/);
    });
  });
});
