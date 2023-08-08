import { assert } from '@open-wc/testing';
import { Context } from './Context.js';
import { Route } from './Route.js';

describe('Route', () => {
  describe('#test()', () => {
    it('return true if match pattern', () => {
      const route = new Route('/foo/{foo}', new MockRouteFn().fn());
      assert.strictEqual(route.test(new Context('/foo/bar')), true);
    });

    it('return true if wildcard path', () => {
      const route = new Route('*', new MockRouteFn().fn());
      assert.strictEqual(route.test(new Context('/foo/bar')), true);
    });

    it('return true if same path', () => {
      const route = new Route('/foo/bar', new MockRouteFn().fn());
      assert.strictEqual(route.test(new Context('/foo/bar')), true);
      assert.strictEqual(route.test(new Context('/foo/baz')), false);
    });
  });

  describe('#invoke()', () => {
    it('parse params', () => {
      const routeFn = new MockRouteFn();
      const route = new Route('/foo/{foo}/bar/{bar}[/baz/{baz}]', routeFn.fn());
      route.invoke(new Context('/foo/1/bar/2'));
      assert.deepEqual(routeFn.hits[0].params, { foo: '1', bar: '2' });
      route.invoke(new Context('/foo/1/bar/2/baz/3'));
      assert.deepEqual(routeFn.hits[1].params, { foo: '1', bar: '2', baz: '3' });
    });
  });
});

class MockRouteFn {
  hits: Context<object>[] = [];

  constructor(private tagName = 'div') {

  }

  fn() {
    return (ctx: Context<object>) => {
      this.hits.push(ctx);
      return Promise.resolve(document.createElement(this.tagName));
    };
  }
}
