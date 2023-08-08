import { assert } from '@open-wc/testing';
import { Context, Router } from './index.js';

describe('Router', () => {
  describe('#use()', () => {
    it('add middlewares', () => {
      const router = new Router();
      const retval = router.use(() => Promise.resolve());
      assert.strictEqual(router['middlewares'].length, 1);
      assert.strictEqual(router, retval);
    });
  });

  describe('#route()', () => {
    it('add routes', () => {
      const router = new Router();
      const retval = router.route('/foo', createRouteFn('foo'));
      assert.strictEqual(router['routes'].length, 1);
      assert.strictEqual(router, retval);
    });

    it('throw error on invalid optional params', () => {
      const router = new Router();
      assert.throws(() => router.route('/foo[[', createRouteFn('foo')), /invalid use of optional params/);
    });
  });

  describe('#dispatch()', () => {
    it('run middlewares', async() => {
      const router = new Router();
      router.use(async(ctx, next) => {
        ctx.state.hits = ['1'];
        await next();
        ctx.state.hits.push('/1');
      });
      router.use(async(ctx, next) => {
        ctx.state.hits.push('2');
        await next();
        ctx.state.hits.push('/2');
      });
      router.route('/foo', (ctx) => {
        ctx.state.hits.push('foo');
        const result = document.createElement('foo');
        return Promise.resolve(result);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let ctx = new Context<any>('/foo');
      await router.dispatch(ctx);
      assert.strictEqual(ctx.result?.tagName, 'FOO');
      assert.deepStrictEqual(ctx.state.hits, ['1', '2', 'foo', '/2', '/1']);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx = new Context<any>('/bar');
      await router.dispatch(ctx);
      assert.strictEqual(ctx.result, undefined);
      assert.deepStrictEqual(ctx.state.hits, ['1', '2', '/2', '/1']);
    });
  });
});

function createRouteFn(tagName: string) {
  return () => Promise.resolve(document.createElement(tagName));
}
