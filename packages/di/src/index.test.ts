import { assert, fixture, html } from '@open-wc/testing';
import { assertRejects } from 'testutil';
import { Container, instance, singleton, injected } from './index';

describe('Container', () => {
  describe('constructor', () => {
    it('create new container with configuration', () => {
      const container = new Container({
        bar: () => 'bar',
        baz: () => 'baz',
      });

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

  describe('#unprovide()', () => {
    it('remove provider', () => {
      const container = new Container({
        foo: instance('foo'),
      });
      container.unprovide('foo');
      assert.strictEqual(container['fns'].foo, undefined);
    });
  });

  describe('#lookup()', () => {
    it('lookup instance', async() => {
      const container = new Container({
        foo: instance('foo'),
      });
      assert.strictEqual(await container.lookup('foo'), 'foo');
      await assertRejects(() => container.lookup('bar'), /provider not found to lookup "bar"/);
    });
  });

  describe('@injectProvide()', () => {
    it('inject property to provide', async() => {
      const container = new Container();

      @container.injectable()
      class Component {
        @container.injectProvide()
        foo = 'foo';
      }

      const obj = new Component();
      await injected(obj);
      assert.strictEqual(await container.lookup('foo'), 'foo');
    });
  });

  describe('@injectLookup()', () => {
    it('inject property from lookup', async() => {
      const container = new Container({
        foo: instance('foo'),
      });

      @container.injectable()
      class Component {
        @container.injectLookup()
        foo: string;
      }

      const obj = new Component();
      await injected(obj);
      assert.strictEqual(obj.foo, 'foo');
    });

    it('run for html element', async() => {
      const container = new Container({
        foo: instance('foo'),
      });

      @container.injectable()
      class TDIElement extends HTMLElement {
        @container.injectLookup()
        foo!: string;
      }
      customElements.define('tdi-lookup', TDIElement);

      const el = await fixture(html`<tdi-lookup></tdi-lookup>`);
      assert.strictEqual(el['foo'], 'foo');
    });
  });

  describe('instance()', () => {
    it('generate provider to instance', async() => {
      const fn = instance('foo');
      assert.strictEqual('foo', await fn(new Container()));
    });
  });

  describe('singleton()', () => {
    it('generate singleton provider', () => {
      let i = 0;
      const fn = singleton(() => i++);
      assert.strictEqual(0, fn(new Container()));
      assert.strictEqual(0, fn(new Container()));
    });
  });

  describe('injected()', () => {
    it('return promise', () => {
      assert.strictEqual(injected({ __diInjected: Promise.resolve() }) instanceof Promise, true);
      assert.throws(() => injected({}), /object.is not injectable/);
    });
  });
});
