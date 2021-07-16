import { fixture, html, assert } from '@open-wc/testing';
import {
  reset,
  configure,
  Container,
  lookup,
  provider,
  inject,
} from './index';

describe('di', () => {
  beforeEach(() => {
    reset();
  });

  describe('Container', () => {
    describe('#instance()', () => {
      it('provide instance', async () => {
        const foo = { foo: 'bar' };
        const container = new Container();
        container.instance('foo', foo);
        assert.strictEqual(container.lookup('foo'), foo);
        container.instance('bar', Promise.resolve(foo));
        assert.strictEqual(await container.lookup('foo'), foo);
      });
    });

    describe('#singleton()', () => {
      it('provide singleton factory', async () => {
        const container = new Container();
        let hit = 0;
        container.singleton('foo', () => {
          hit++;
          return 'foo';
        });
        assert.strictEqual(container.lookup('foo'), 'foo');
        assert.strictEqual(container.lookup('foo'), 'foo');
        assert.strictEqual(hit, 1);
        container.singleton('bar', () => Promise.resolve('bar'));
        assert.strictEqual(await container.lookup('bar'), 'bar');
      });
    });

    describe('#factory()', () => {
      it('provide instance factory', () => {
        const container = new Container();
        let hit = 0;
        container.factory('foo', () => {
          hit++;
          return hit;
        });
        assert.strictEqual(container.lookup('foo'), 1);
        assert.strictEqual(container.lookup('foo'), 2);
        assert.strictEqual(hit, 2);
      });
    });
  });

  describe('configure()', () => {
    it('return container singleton', () => {
      const container = configure();
      assert.strictEqual(configure(), container);
    });
  });

  describe('lookup()', () => {
    it('lookup from container singleton', () => {
      configure({
        instances: { foo: 'foo' },
      });
      assert.strictEqual(lookup(document.body, 'foo'), 'foo');
    });

    it('throw error if no result', () => {
      assert.throw(() => {
        lookup(window, 'foo');
      }, 'lookup no result');
    });
  });

  describe('@provider()', () => {
    before(() => {
      @provider({
        instances: {
          foo: 'foox',
        },
      })
      class TDIProvider extends HTMLElement {}
      customElements.define('tdi-provider', TDIProvider);
    });

    it('define new provider', async () => {
      configure({
        instances: {
          foo: 'foo',
          bar: 'bar',
        },
      });
      const el = await fixture(html`
        <tdi-provider>
          <div id="here"></div>
        </tdi-provider>
      `);
      const here = el.querySelector('#here');
      if (!here) throw new Error('fail querySelector');
      assert.strictEqual(lookup(here, 'foo'), 'foox');
      assert.strictEqual(lookup(here, 'bar'), 'bar');
      assert.strictEqual(lookup(el, 'foo'), 'foox');
      assert.strictEqual(lookup(document.body, 'foo'), 'foo');
    });
  });

  describe('@inject()', () => {
    it('inject property', async () => {
      const dt = new Date();
      configure({
        instances: {
          foo: 'foo',
          dt,
        },
      });
      class TDIEl extends HTMLElement {
        @inject()
        foo!: string;

        @inject('dt')
        now!: Date;
      }
      customElements.define('tdi-el', TDIEl);
      const el: TDIEl = await fixture(html`
        <tdi-el></tdi-el>
      `);
      assert.strictEqual(el.foo, 'foo');
      assert.strictEqual(el.now, dt);
    });
  });
});
