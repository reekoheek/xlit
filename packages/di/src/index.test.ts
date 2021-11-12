import { fixture, html, assert } from '@open-wc/testing';
import { Container, lookup, container, inject, injectable, provide, attach, detach } from './index';

describe('di', () => {
  describe('Container', () => {
    describe('constructor', () => {
      it('create new container with configuration', () => {
        const container = new Container({
          instances: {
            foo: 'foo',
          },
          singletons: {
            bar: () => 'bar',
          },
          factories: {
            baz: () => 'baz',
          },
        });

        assert.deepStrictEqual(['foo', 'bar', 'baz'], Object.keys(container.fns));
      });
    });

    describe('#instance()', () => {
      it('provide instance', () => {
        const container = new Container();
        container.instance('obj', 'foo');
        assert.strictEqual('foo', container.lookup('obj'));
        container.instance('obj', 'bar');
        assert.strictEqual('bar', container.lookup('obj'));
      });
    });

    describe('#singleton()', () => {
      it('provide singleton factory', () => {
        const container = new Container();
        let hit = 0;
        container.singleton('obj', () => hit++);
        assert.strictEqual(0, container.lookup('obj'));
        assert.strictEqual(0, container.lookup('obj'));
      });
    });

    describe('#factory()', () => {
      it('provide instance factory', () => {
        const container = new Container();
        let hit = 0;
        container.factory('obj', () => hit++);
        assert.strictEqual(0, container.lookup('obj'));
        assert.strictEqual(1, container.lookup('obj'));
      });

      it('take container as parameter', () => {
        const container = new Container();
        container.factory('obj', (c) => container === c);
        assert.isTrue(container.lookup('obj'));
      });
    });
  });

  describe('lookup()', () => {
    it('dispatch di-lookup event', async () => {
      const root = await fixture(html`<root></root>`);
      root.addEventListener('di-lookup', (evt) => {
        const e = evt as CustomEvent<{ name: string; instance: unknown }>;
        assert.strictEqual(true, evt.bubbles);
        assert.strictEqual(true, evt.composed);
        e.detail.instance = e.detail.name;
      });
      assert.strictEqual('foo', lookup(root, 'foo'));
      assert.strictEqual('bar', lookup(root, 'bar'));
    });
  });

  describe('provide()', () => {
    it('dispatch di-provide event', async () => {
      interface IDetail {
        name: string;
        type: string;
        value: string;
      }
      const root = await fixture(html`<root></root>`);
      const details: IDetail[] = [];
      root.addEventListener('di-provide', (evt) => {
        const e = evt as CustomEvent<IDetail>;
        assert.strictEqual(true, evt.bubbles);
        assert.strictEqual(true, evt.composed);
        details.push(e.detail);
      });
      provide(root, { name: 'foo', type: 'singleton', value: 'foo' });
      provide(root, { name: 'bar', type: 'factory', value: 'bar' });
      provide(root, { name: 'baz', type: 'instance', value: 'baz' });
      assert.deepStrictEqual([
        { name: 'foo', type: 'singleton', value: 'foo' },
        { name: 'bar', type: 'factory', value: 'bar' },
        { name: 'baz', type: 'instance', value: 'baz' },
      ], details);
    });
  });

  describe('attach()', () => {
    it('attach container to element', async () => {
      const root = await fixture(html`<root></root>`);
      attach(root);
      assert.isTrue('__diContainer' in root);
      assert.isTrue('__diLookupListener' in root);
      assert.isTrue('__diProvideListener' in root);
    });
  });

  describe('detach()', () => {
    it('detach container from element', async () => {
      const root = await fixture(html`<root></root>`);
      detach(root);
      assert.isFalse('__diContainer' in root);
      assert.isFalse('__diLookupListener' in root);
      assert.isFalse('__diProvideListener' in root);
    });
  });

  describe('@container()', () => {
    it('define new container', async () => {
      @container()
      class TDIContainer extends HTMLElement {}
      customElements.define('tdi-container', TDIContainer);

      const el = await fixture(html`<tdi-container></tdi-container>`);
      assert.isTrue('__diContainer' in el);
    });
  });

  describe('@inject()', () => {
    it('inject property', async () => {
      class TDIInjectElement extends container({
        instances: {
          foo: 'foo',
        },
      })(HTMLElement) {
        @inject()
        foo!: string;

        @inject('foo')
        bar!: string;
      }
      customElements.define('tdi-inject', TDIInjectElement);

      const el: TDIInjectElement = await fixture(html`<tdi-inject></tdi-inject>`);
      assert.strictEqual('foo', el.foo);
      assert.strictEqual('foo', el.bar);
    });
  });

  describe('@injectable()', () => {
    it('provide to container', async () => {
      let i = 0;
      class TDIInjectableElement extends container()(HTMLElement) {
        @injectable()
        foo = 'foo';

        @injectable({ type: 'singleton' })
        bar = () => `bar-${i++}`;

        @injectable({ type: 'factory' })
        baz = () => `baz-${i++}`;

        @injectable({ type: 'singleton' })
        foox = (c: Container) => c.lookup('foo') + 'x';
      }
      customElements.define('tdi-injectable', TDIInjectableElement);

      const el: TDIInjectableElement = await fixture(html`<tdi-injectable></tdi-injectable>`);
      assert.strictEqual('foo', lookup(el, 'foo'));
      assert.strictEqual('foo', lookup(el, 'foo'));
      assert.strictEqual('bar-0', lookup(el, 'bar'));
      assert.strictEqual('bar-0', lookup(el, 'bar'));
      assert.strictEqual('baz-1', lookup(el, 'baz'));
      assert.strictEqual('baz-2', lookup(el, 'baz'));
      assert.strictEqual('foox', lookup(el, 'foox'));
    });
  });
});
