import { assert, fixture, html } from '@open-wc/testing';
import {
  component,
  Context,
  DefaultOutlet,
  getContextPath,
  getHistoryURL,
  invokeMiddlewareChain,
  Route,
  Router,
  RouterOptions,
  template,
} from './';

describe('router', () => {
  describe('Context', () => {
    describe('#equals()', () => {
      it('return true if same or false if not same', () => {
        const tests: {
          ctx1: Context;
          ctx2?: Context;
          expected: boolean;
        }[] = [
          {
            ctx1: new Context('/'),
            ctx2: new Context('/'),
            expected: true,
          },
          {
            ctx1: new Context('/'),
            ctx2: undefined,
            expected: false,
          },
          {
            ctx1: new Context('/'),
            ctx2: new Context('/foo'),
            expected: false,
          },
          {
            ctx1: new Context('/?bar=baz'),
            ctx2: new Context('/?bar=baz'),
            expected: true,
          },
          {
            ctx1: new Context('/?bar=baz'),
            ctx2: new Context('/?bar=bar'),
            expected: false,
          },
        ];

        tests.forEach(tt => {
          assert.strictEqual(tt.expected, tt.ctx1.equals(tt.ctx2));
        });
      });
    });
  });

  describe('DefaultOutlet', () => {
    describe('constructor', () => {
      it('create new outlet with marker', () => {
        const el = document.createElement('div');
        const outlet = new DefaultOutlet(el);
        assert.strictEqual(el, outlet.el);
        assert.strictEqual(true, el.innerHTML.includes('<!--marker-->'));
      });
    });

    describe('#render()', () => {
      it('render to element', async () => {
        const el = document.createElement('div');
        const outlet = new DefaultOutlet(el);
        const foo = document.createElement('foo');
        const bar = document.createElement('bar');
        await outlet.render(foo);
        assert.strictEqual(true, el.innerHTML.includes('<foo></foo>'));
        assert.strictEqual(false, el.innerHTML.includes('<bar></bar>'));
        await outlet.render(bar);
        assert.strictEqual(false, el.innerHTML.includes('<foo></foo>'));
        assert.strictEqual(true, el.innerHTML.includes('<bar></bar>'));
      });

      it('throw error if render non element', async () => {
        const outlet = new DefaultOutlet(document.createElement('div'));
        try {
          await outlet.render({});
          throw new Error('must error');
        } catch (err) {
          if (err instanceof Error) {
            assert.strictEqual('fail to render non element', err.message);
            return;
          }
          throw err;
        }
      });
    });
  });

  describe('invokeMiddlewareChain()', () => {
    it('invoke middleware chain', async () => {
      function mw (id: number) {
        return async (ctx: Context, next: () => Promise<void>) => {
          (ctx.state as string[]).push(`pre-${id}`);
          await next();
          (ctx.state as string[]).push(`post-${id}`);
        };
      }
      const middlewares = [mw(1), mw(2)];
      const ctx = new Context('/', []);
      await invokeMiddlewareChain(middlewares, ctx, (ctx) => {
        (ctx.state as string[]).push('next');
        return Promise.resolve();
      });
      assert.deepStrictEqual(['pre-1', 'pre-2', 'next', 'post-2', 'post-1'], ctx.state);
    });
  });

  describe('Route', () => {
    describe('constructor', () => {
      it('create new route', () => {
        const tests: {
          route: string;
          expectedPattern?: RegExp;
          expectedArgs?: string[];
        }[] = [
          {
            route: '/',
            expectedPattern: undefined,
            expectedArgs: undefined,
          },
          {
            route: '/foo/{id}',
            expectedPattern: /^\/foo\/([^\/]+)$/, // eslint-disable-line
            expectedArgs: ['id'],
          },
          {
            route: '/foo/{id}/bar[/{barId}]',
            expectedPattern: /^\/foo\/([^\/]+)\/bar(?:\/([^\/]+))?$/, // eslint-disable-line
            expectedArgs: ['id', 'barId'],
          },
        ];
        tests.forEach(tt => {
          const route = new Route(tt.route, emptyRouteFn);
          assert.strictEqual(tt.expectedPattern + '', route.pattern + '');
          assert.deepStrictEqual(tt.expectedArgs, route.args);
        });
      });

      it('throw error if invalid path specified', () => {
        assert.throw(() => new Route('/foo/[[', emptyRouteFn), 'invalid use of optional params');
      });
    });

    describe('#test()', () => {
      it('check if route eligible for context', () => {
        const tests: {
          route: string;
          path: string;
          expected: boolean;
        }[] = [
          {
            route: '/foo',
            path: '/foo',
            expected: true,
          },
          {
            route: '/foo',
            path: '/bar',
            expected: false,
          },
          {
            route: '*',
            path: '/foo',
            expected: true,
          },
          {
            route: '/foo/{id}',
            path: '/foo/1',
            expected: true,
          },
          {
            route: '/foo/{id}',
            path: '/foo/1/bar',
            expected: false,
          },
        ];

        tests.forEach(tt => {
          const route = new Route(tt.route, emptyRouteFn);
          const result = route.test(new Context(tt.path));
          assert.strictEqual(tt.expected, result);
        });
      });
    });

    describe('#invoke()', () => {
      it('mixin context', () => {
        const tests: {
          ctx: Context;
          route: string;
          params: Record<string, string>;
        }[] = [
          {
            ctx: new Context('/foo/foo-1/bar/bar-1'),
            route: '/foo/{fooId}/bar/{id}',
            params: { fooId: 'foo-1', id: 'bar-1' },
          },
          {
            ctx: new Context('/'),
            route: '/',
            params: {},
          },
        ];

        tests.forEach(tt => {
          const route = new Route(tt.route, emptyRouteFn);
          route.invoke(tt.ctx);
          assert.deepStrictEqual(tt.params, tt.ctx.params);
        });
      });

      it('throw error if route not suitable for context', async () => {
        try {
          const route = new Route('/bar/{id}', emptyRouteFn);
          await route.invoke(new Context('/foo/1'));
          throw new Error('must throw');
        } catch (err) {
          if (err instanceof Error) {
            assert.strictEqual('invalid route pattern', err.message);
            return;
          }
          throw err;
        }
      });

      it('return result with context', async () => {
        const route = new Route('/', () => Promise.resolve(document.createElement('foo')));
        const ctx = new Context('/');
        const result = await route.invoke(ctx);
        assert.strictEqual(ctx, (result as { ctx: unknown }).ctx);
      });
    });
  });

  describe('getContextPath()', () => {
    it('generate context path', () => {
      const tests: {
        location: URL;
        mode: 'hash' | 'history';
        basePath: string;
        expected: string;
      }[] = [
        {
          location: new URL('/?foo=bar', 'http://localhost'),
          mode: 'history',
          basePath: '/',
          expected: '/?foo=bar',
        },
        {
          location: new URL('/foo/bar', 'http://localhost'),
          mode: 'history',
          basePath: '/foo',
          expected: '/bar',
        },
        {
          location: new URL('/foo', 'http://localhost'),
          mode: 'hash',
          basePath: '/',
          expected: '/',
        },
        {
          location: new URL('#!/foo?bar=baz', 'http://localhost'),
          mode: 'hash',
          basePath: '/',
          expected: '/foo?bar=baz',
        },
      ];
      tests.forEach(tt => {
        const result = getContextPath(tt.location, tt.mode, tt.basePath);
        assert.strictEqual(tt.expected, result);
      });
    });

    it('throw error if location not in basePath', () => {
      assert.throw(() => {
        getContextPath(new URL('/foo/bar', 'http://localhost'), 'history', '/bar');
      }, 'invalid location');
    });
  });

  describe('#getHistoryURL()', () => {
    it('generate history url for push state or replace state', () => {
      const tests: {
        mode: 'hash' | 'history';
        basePath: string;
        path: string;
        expected: string;
      }[] = [
        {
          mode: 'hash',
          basePath: '/',
          path: '/',
          expected: '#!/',
        },
        {
          mode: 'hash',
          basePath: '/',
          path: '/foo',
          expected: '#!/foo',
        },
        {
          mode: 'hash',
          basePath: '/',
          path: '/foo?bar=baz',
          expected: '#!/foo?bar=baz',
        },
        {
          mode: 'history',
          basePath: '/',
          path: '/',
          expected: '/',
        },
        {
          mode: 'history',
          basePath: '/',
          path: '/foo?bar=baz',
          expected: '/foo?bar=baz',
        },
        {
          mode: 'history',
          basePath: '/foo',
          path: '/bar/baz',
          expected: '/foo/bar/baz',
        },
      ];
      tests.forEach(tt => {
        const u = getHistoryURL(tt.path, tt.mode, tt.basePath);
        assert.strictEqual(tt.expected, u);
      });
    });
  });

  describe('Router', () => {
    describe('constructor', () => {
      it('auto start', async () => {
        const r = new Router(new MockOutlet(), mockOptions({ startsIn: 0 }));
        let started = false;
        r.start = () => {
          started = true;
        };
        await sleep();
        assert.strictEqual(true, started);
      });
    });

    describe('#start()', () => {
      it('add popstate and click listener', () => {
        const mock = mockOptions();
        const r = new Router(new MockOutlet(), mock);
        r.route('*', emptyRouteFn);
        r.start();
        assert.deepStrictEqual(['add:popstate:', 'add:click:'], (mock.window as MockWindow).logs);
      });
    });

    describe('#stop()', () => {
      it('remove popstate and click listener', () => {
        const mock = mockOptions();
        const r = new Router(new MockOutlet(), mock);
        r.stop();
        assert.deepStrictEqual(['remove:popstate:', 'remove:click:'], (mock.window as MockWindow).logs);
      });
    });

    describe('#use()', () => {
      it('add middlewares', () => {
        const r = new Router(new MockOutlet(), mockOptions());
        const retval = r.use(() => Promise.resolve());
        assert.strictEqual(r.middlewares.length, 1);
        assert.strictEqual(r, retval);
      });
    });

    describe('#route()', () => {
      it('add routes', () => {
        const r = new Router(new MockOutlet(), mockOptions());
        const retval = r.route('/foo', emptyRouteFn);
        assert.strictEqual(r.routes.length, 1);
        assert.strictEqual(r, retval);
      });
    });

    describe('#dispatch()', () => {
      it('set ctx', async () => {
        const r = new Router(new MockOutlet(), mockOptions());
        r.route('/', emptyRouteFn);
        const ctx = new Context('/');
        await r.dispatch(ctx);
        assert.strictEqual(ctx, r.ctx);
      });

      it('invoke middleware', async () => {
        const logs = [];
        const r = new Router(new MockOutlet(), mockOptions());
        r.use(async (_, next) => {
          logs.push(1);
          await next();
        });
        r.route('/', emptyRouteFn);
        await r.dispatch(new Context('/'));
        assert.strictEqual(1, logs.length);
        await r.dispatch(new Context('/'));
        assert.strictEqual(1, logs.length);
      });

      it('throw error if route not found', async () => {
        const r = new Router(new MockOutlet(), mockOptions());
        try {
          await r.dispatch(new Context('/'));
          throw new Error('must error');
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'route not found') {
              return;
            }
          }
          throw err;
        }
      });

      it('render to outlet if route return value', async () => {
        const fn = () => {
          return Promise.resolve(document.createElement('foo'));
        };
        const el = document.createElement('div');
        const r = new Router(el, mockOptions()).route('/', fn);
        await r.dispatch(new Context('/'));
        assert.strictEqual(true, el.innerHTML.includes('<foo></foo>'));
      });
    });

    describe('#popstateListener()', () => {
      it('dispatch context', () => {
        const r = new Router(new MockOutlet(), mockOptions({
          mode: 'hash',
          basePath: '/',
          location: new URL('/#!/foo', 'http://localhost'),
        }));
        const evt = new PopStateEvent('popstate', { state: 'bar' });
        let dispatchCtx: Context;
        r.dispatch = (ctx) => {
          dispatchCtx = ctx;
          return Promise.resolve();
        };
        r.popstateListener(evt);
        assert.strictEqual('/foo', dispatchCtx.path);
        assert.strictEqual('bar', dispatchCtx.state);
      });
    });

    describe('#clickListener()', () => {
      it('propagate if target is not link', async () => {
        const root: HTMLElement = await fixture(html`<root><target><child></child></target></root>`);
        let invoked = false;
        root.addEventListener('click', (evt) => {
          assert.strictEqual(false, evt.defaultPrevented);
          evt.preventDefault();
          invoked = true;
        });
        const mock = mockOptions({
          window: root.querySelector('target'),
        });
        const r = new Router(new MockOutlet(), mock);
        r.route('*', emptyRouteFn);
        r.start();
        (root.querySelector('child') as HTMLElement).click();
        assert.strictEqual(true, invoked);
        r.stop();
      });

      it('push state and dispatch', async () => {
        const root: HTMLElement = await fixture(html`<root><target><a href="/foo?bar=baz"></a></target></root>`);
        let invoked = false;
        root.addEventListener('click', (evt) => {
          evt.preventDefault();
          invoked = true;
        });
        const mock = mockOptions({
          window: root.querySelector('target'),
        });
        const r = new Router(new MockOutlet(), mock);
        let dispatchedCtx: Context;
        r.dispatch = (ctx) => {
          dispatchedCtx = ctx;
          return Promise.resolve();
        };
        r.start();
        (root.querySelector('a') as HTMLElement).click();
        assert.strictEqual(false, invoked);
        assert.strictEqual('/foo', dispatchedCtx.path);
        assert.deepStrictEqual({ bar: 'baz' }, dispatchedCtx.query);
        r.stop();
      });
    });

    describe('#push()', () => {
      it('push state and dispatch', () => {
        const mock = mockOptions();
        const r = new Router(new MockOutlet(), mock);
        let dispatchCtx: Context;
        r.dispatch = (ctx) => {
          dispatchCtx = ctx;
          return Promise.resolve();
        };
        r.push('/foo', 'bar');
        assert.strictEqual('/foo', dispatchCtx.path);
        assert.strictEqual('push:/foo:bar', (mock.history as MockHistory).logs[0]);
      });
    });

    describe('#replace()', () => {
      it('replace state and dispatch', () => {
        const mock = mockOptions();
        const r = new Router(new MockOutlet(), mock);
        let dispatchCtx: Context;
        r.dispatch = (ctx) => {
          dispatchCtx = ctx;
          return Promise.resolve();
        };
        r.replace('/foo', 'bar');
        assert.strictEqual('/foo', dispatchCtx.path);
        assert.strictEqual('replace:/foo:bar', (mock.history as MockHistory).logs[0]);
      });
    });

    describe('#go()', () => {
      it('invoke history go', () => {
        const mock = mockOptions();
        const r = new Router(new MockOutlet(), mock);
        r.go(123);
        assert.strictEqual('go:123', (mock.history as MockHistory).logs[0]);
      });
    });

    describe('#pop()', () => {
      it('invoke history go', () => {
        const mock = mockOptions();
        const r = new Router(new MockOutlet(), mock);
        r.pop();
        assert.strictEqual('go:-1', (mock.history as MockHistory).logs[0]);
      });
    });
  });

  describe('template()', () => {
    it('return element if invoked', async () => {
      const tpl: HTMLTemplateElement = await fixture(html`
        <template id="tpl">
          <foo>foo</foo>
          <bar>bar</bar>
        </template>
      `);
      const fn = template(tpl);
      const result = await fn(new Context('/'));
      assert.strictEqual('<foo>foo</foo>', (<unknown>result as HTMLElement).outerHTML);
    });
  });

  describe('component()', () => {
    it('return element if invoked', async () => {
      let loaded = false;
      function load () {
        loaded = true;
        return Promise.resolve();
      }
      const fn = component('x-foo', load);
      const result = await fn(new Context('/'));
      assert.strictEqual('<x-foo></x-foo>', (<unknown>result as HTMLElement).outerHTML);
      assert.strictEqual(true, loaded);
    });
  });
});

const emptyRouteFn = () => Promise.resolve();

class MockWindow {
  logs: string[] = [];

  addEventListener (name: string, listener: EventListener) {
    this.logs.push('add:' + name + ':' + listener.name);
  }

  removeEventListener (name: string, listener: EventListener) {
    this.logs.push('remove:' + name + ':' + listener.name);
  }
}

class MockHistory {
  logs: string[] = [];

  go (delta: number) {
    this.logs.push(`go:${delta}`);
  }

  pushState (state: unknown, _: string, path: string) {
    this.logs.push(`push:${path}:${state}`);
  }

  replaceState (state: unknown, _: string, path: string) {
    this.logs.push(`replace:${path}:${state}`);
  }
}

class MockOutlet {
  result: unknown;

  render (result: unknown) {
    this.result = result;
    return Promise.resolve();
  }
}

function mockOptions (opts?: Partial<RouterOptions>): RouterOptions {
  return {
    mode: 'history',
    basePath: '/',
    startsIn: -1,
    window: new MockWindow(),
    history: new MockHistory(),
    location: {
      pathname: '/',
      search: '',
      hash: '',
    },
    ...opts,
  };
}

function sleep (n = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, n));
}
