import { fixture, html, assert } from '@open-wc/testing';
import { accessor, Container, container, instance, lookup, provide, singleton } from './index';

describe('di', () => {
  describe('Container', () => {
    describe('constructor', () => {
      it('create new container with configuration', () => {
        const container = new Container({
          bar: () => 'bar',
          baz: () => 'baz',
        });

        assert.deepStrictEqual(['bar', 'baz'], Object.keys(container.fns));
      });
    });

    describe('#provide()', () => {
      it('provide instance factory', () => {
        const container = new Container();
        let hit = 0;
        container.provide('obj', () => hit++);
        assert.strictEqual(0, container.lookup('obj'));
        assert.strictEqual(1, container.lookup('obj'));
      });

      it('take container as parameter', () => {
        const container = new Container();
        container.provide('obj', (c) => container === c);
        assert.isTrue(container.lookup('obj'));
      });
    });
  });

  describe('instance()', () => {
    it('generate factory to instance', () => {
      const fn = instance('foo');
      assert.strictEqual('foo', fn(new Container()));
    });
  });

  describe('singleton()', () => {
    it('generate singleton factory', () => {
      let i = 0;
      const fn = singleton(() => i++);
      assert.strictEqual(0, fn(new Container()));
      assert.strictEqual(0, fn(new Container()));
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

    it('avoid define container multiple times', () => {
      const A = container()(HTMLElement);
      const B = container()(A);
      assert.strictEqual(A, B);
    });
  });

  describe('@accessor()', () => {
    it('avoid define container multiple times', () => {
      const A = accessor()(HTMLElement);
      const B = accessor()(A);
      assert.strictEqual(A, B);
    });
  });

  describe('@lookup()', () => {
    it('lookup and inject property', async () => {
      class TDIInjectElement extends container({
        foo: () => 'foo',
      })(HTMLElement) {
        @lookup()
        foo!: string;

        @lookup('foo')
        bar!: string;
      }
      customElements.define('tdi-lookup', TDIInjectElement);

      const el: TDIInjectElement = await fixture(html`<tdi-lookup></tdi-lookup>`);
      assert.strictEqual('foo', el.foo);
      assert.strictEqual('foo', el.bar);
    });

    it('throw error if class not accessor element', () => {
      assert.throw(() => {
        class Foo extends HTMLElement {
          @lookup()
          foo: string;
        }
        console.info(Foo);
      }, 'lookup must be run on accessor element');
    });
  });

  describe('@provide()', () => {
    it('provide property value to container', async () => {
      let i = 0;
      const c = new Container();
      class TDIInjectableElement extends container(c)(HTMLElement) {
        @provide()
        foo = 'foo';

        @provide()
        bar = () => `bar-${i++}`;

        @provide('bazx')
        baz = 'baz';
      }
      customElements.define('tdi-provide', TDIInjectableElement);

      await fixture(html`<tdi-provide></tdi-provide>`);
      assert.strictEqual('foo', c.lookup('foo'));
      assert.strictEqual('foo', c.lookup('foo'));
      assert.strictEqual('bar-0', c.lookup('bar'));
      assert.strictEqual('bar-1', c.lookup('bar'));
      assert.strictEqual(undefined, c.lookup('baz'));
      assert.strictEqual('baz', c.lookup('bazx'));
    });

    it('throw error if class not accessor element', () => {
      assert.throw(() => {
        class Foo extends HTMLElement {
          @provide()
          foo = 'foo';
        }
        console.info(Foo);
      }, 'provide must be run on accessor element');
    });
  });
});
