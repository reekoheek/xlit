import { assert } from '@open-wc/testing';
import { assertRejects } from 'testutil';
import { Container, instance } from './index.js';

describe('Container', () => {
  describe('constructor', () => {
    it('create new container with configuration', () => {
      const container = new Container()
        .provide('bar', () => 'bar')
        .provide('baz', () => 'baz');

      assert.deepStrictEqual(['bar', 'baz'], Object.keys(container['fns']));
    });
  });

  describe('#provide()', () => {
    it('add provider', async() => {
      const container = new Container();
      let hit = 0;
      container.provide('obj', (c) => {
        assert.strictEqual(c, container);
        hit++;
        return hit;
      });
      assert.strictEqual(1, await container.lookup('obj'));
      assert.strictEqual(2, await container.lookup('obj'));
    });
  });

  describe('#lookup()', () => {
    it('lookup instance', async() => {
      const container = new Container()
        .provide('foo', instance('foo'));
      assert.strictEqual(await container.lookup('foo'), 'foo');
      await assertRejects(() => container.lookup('bar'), /provider not found to lookup "bar"/);
    });
  });
});
