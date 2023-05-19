import { assert, fixture, html } from '@open-wc/testing';
import { assertRejects } from 'testutil';
import { Container, instance, injected } from './index';

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

  describe('#addProvider()', () => {
    it('add provider', async() => {
      const container = new Container();
      let hit = 0;
      container.addProvider('obj', (c) => {
        assert.strictEqual(c, container);
        hit++;
        return hit;
      });
      assert.strictEqual(1, await container.get('obj'));
      assert.strictEqual(2, await container.get('obj'));
    });
  });

  describe('#get()', () => {
    it('get instance', async() => {
      const container = new Container({
        foo: instance('foo'),
      });
      assert.strictEqual(await container.get('foo'), 'foo');
      await assertRejects(() => container.get('bar'), /provider not found to get "bar"/);
    });
  });

  describe('@inject()', () => {
    it('inject class', async() => {
      const container = new Container({
        foo: instance('foo'),
      });

      @container.inject()
      class Component {
        @container.lookup()
        foo!: string;
      }

      assert.strictEqual(!!container['fns'].component, true);
      const component: Component = await container.get('component');
      assert.strictEqual(component instanceof Component, true);
      assert.strictEqual(component.foo, 'foo');
    });
  });

  describe('@provide()', () => {
    it('inject property to provide', async() => {
      const container = new Container();

      @container.inject()
      class Component {
        @container.provide()
        foo = 'foo';
      }

      const obj = new Component();
      await injected(obj);
      assert.strictEqual(await container.get('foo'), 'foo');
    });
  });

  describe('@lookup()', () => {
    it('inject property from lookup', async() => {
      const container = new Container({
        foo: instance('foo'),
      });

      @container.inject()
      class Component {
        @container.lookup()
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

      @container.inject()
      class TDIElement extends HTMLElement {
        @container.lookup()
        foo!: string;
      }
      customElements.define('tdi-lookup', TDIElement);

      const el = await fixture(html`<tdi-lookup></tdi-lookup>`);
      assert.strictEqual(el['foo'], 'foo');
    });
  });
});
