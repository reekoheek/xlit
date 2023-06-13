import { assert, fixture, html } from '@open-wc/testing';
import { Context, HashMode, HistoryMode, Router } from './index.js';
import { assertRejects } from 'testutil';

describe('Router', () => {
  describe('@popstate', () => {
    it('dispatch context', () => {
      const router = new Router(new MockOutlet(), mockOptions({
        mode: new HashMode(),
        basePath: '/',
        location: new URL('/#!/foo', 'http://localhost'),
      }));
      const evt = new PopStateEvent('popstate', { state: 'bar' });
      const dispatchedPaths: string[] = [];
      router['dispatch'] = (ctx) => {
        dispatchedPaths.push(ctx.path);
        return Promise.resolve();
      };
      router['popstateListener'](evt);
      assert.strictEqual(dispatchedPaths[0], '/foo');
    });
  });

  describe('@click', () => {
    it('propagate if target is not link', async() => {
      const root: HTMLElement = await fixture(html`
        <root><target><child></child></target></root>
      `);
      let invoked = false;
      root.addEventListener('click', (evt) => {
        assert.strictEqual(false, evt.defaultPrevented);
        evt.preventDefault();
        invoked = true;
      });
      const target = root.querySelector('target');
      if (!target) {
        throw new Error('invalid target');
      }
      const mock = mockOptions({ eventTarget: target });
      const r = new Router(new MockOutlet(), mock);
      r.route('*', createRouteFn('div'));
      try {
        r.start();
        (root.querySelector('child') as HTMLElement).click();
        assert.strictEqual(true, invoked);
      } finally {
        r.stop();
      }
    });

    it('push state and dispatch', async() => {
      const root: HTMLElement = await fixture(html`
        <root><target><a href="/foo?bar=baz"></a></target></root>
      `);
      let invoked = false;
      root.addEventListener('click', (evt) => {
        evt.preventDefault();
        invoked = true;
      });
      const target = root.querySelector('target');
      if (!target) {
        throw new Error('invalid target');
      }
      const mock = mockOptions({ eventTarget: target });
      const r = new Router(new MockOutlet(), mock);
      const dispatchedContexts: Context[] = [];
      r['dispatch'] = (ctx) => {
        dispatchedContexts.push(ctx);
        return Promise.resolve();
      };
      try {
        r.start();
        (root.querySelector('a') as HTMLElement).click();
        assert.strictEqual(invoked, false);
        assert.strictEqual(dispatchedContexts.length, 2);
        assert.strictEqual(dispatchedContexts[1].path, '/foo');
        assert.deepStrictEqual(dispatchedContexts[1].query, { bar: 'baz' });
      } finally {
        r.stop();
      }
    });
  });

  describe('constructor', () => {
    it('set default', () => {
      const router = new Router(document.createElement('foo'));
      assert.strictEqual(router['outlet'].constructor.name, 'DefaultOutlet');
      assert.strictEqual(router['mode'].constructor, HistoryMode);
      assert.strictEqual(router['eventTarget'], window);
      assert.strictEqual(router['history'], history);
      assert.strictEqual(router['location'], location);
    });
  });

  describe('#start()', () => {
    it('add popstate and click listener', () => {
      const mock = mockOptions();
      const r = new Router(new MockOutlet(), mock);
      r.route('*', createRouteFn('foo'));
      r.start();
      assert.deepStrictEqual(
        ['add:popstate:popstateListener', 'add:click:clickListener'],
        (mock?.eventTarget as MockEventTarget).logs,
      );
    });
  });

  describe('#stop()', () => {
    it('remove popstate and click listener', () => {
      const mock = mockOptions();
      const r = new Router(new MockOutlet(), mock);
      r.stop();
      assert.deepStrictEqual(
        ['remove:popstate:popstateListener', 'remove:click:clickListener'],
        (mock?.eventTarget as MockEventTarget).logs,
      );
    });
  });

  describe('#use()', () => {
    it('add middlewares', () => {
      const r = new Router(new MockOutlet(), mockOptions());
      const retval = r.use(() => Promise.resolve());
      assert.strictEqual(r['middlewares'].length, 1);
      assert.strictEqual(r, retval);
    });
  });

  describe('#route()', () => {
    it('add routes', () => {
      const r = new Router(new MockOutlet(), mockOptions());
      const retval = r.route('/foo', createRouteFn('foo'));
      assert.strictEqual(r['routes'].length, 1);
      assert.strictEqual(r, retval);
    });

    it('throw error on invalid optional params', () => {
      const router = new Router(new MockOutlet(), mockOptions());
      assert.throws(() => router.route('/foo[[', createRouteFn('foo')), /invalid use of optional params/);
    });
  });

  describe('#push()', () => {
    it('push state and dispatch', () => {
      const mock = mockOptions();
      const r = new Router(new MockOutlet(), mock);
      const dispatchedPaths: string[] = [];
      r['dispatch'] = (ctx) => {
        dispatchedPaths.push(ctx.path);
        return Promise.resolve();
      };
      r.push('/foo');
      assert.strictEqual('/foo', dispatchedPaths[0]);
      assert.strictEqual('push:/foo', (mock?.history as MockHistory).logs[0]);
    });

    it('not route if same context', async() => {
      const outlet = new MockOutlet();
      const router = new Router(outlet, mockOptions());
      router['ctx'] = new Context(router, '/foo');
      await router.push('/foo');
      assert.strictEqual(outlet.element, undefined);
    });

    it('not route if same query', async() => {
      const outlet = new MockOutlet();
      const router = new Router(outlet, mockOptions());
      router.route('/foo', createRouteFn('foo'));
      router['ctx'] = new Context(router, '/foo?bar=baz');
      await router.push('/foo?bar=baz');
      assert.strictEqual(outlet.element, undefined);

      await router.push('/foo?bar=bar');
      assert.strictEqual(outlet.element?.nodeName, 'FOO');
    });

    it('throw error if route not found', async() => {
      const router = new Router(new MockOutlet(), mockOptions());
      await assertRejects(() => router.push('/not-found'), /route not found/);
    });

    it('route to static route', async() => {
      const outlet = new MockOutlet();
      const router = new Router(outlet, mockOptions());
      router.route('/foo', createRouteFn('foo'));
      router.route('/bar', createRouteFn('bar'));
      await router.push('/foo');
      assert.strictEqual(outlet.element?.nodeName, 'FOO');
    });

    it('route to parametered route', async() => {
      const outlet = new MockOutlet();
      const router = new Router(outlet, mockOptions());
      router.route('/foo/{id}', createRouteFn('foo'));
      await router.push('/foo/1');
      assert.strictEqual(outlet.element?.nodeName, 'FOO');
    });

    it('route to optional parametered route', async() => {
      const outlet = new MockOutlet();
      const router = new Router(outlet, mockOptions());
      router.route('/foo[/{id}]', createRouteFn('foo'));
      await router.push('/foo/1');
      assert.strictEqual(outlet.element?.nodeName, 'FOO');
    });

    it('route to catch all route', async() => {
      const outlet = new MockOutlet();
      const router = new Router(outlet, mockOptions());
      router.route('*', createRouteFn('not-found'));
      await router.push('/foo/1');
      assert.strictEqual(outlet.element?.nodeName, 'NOT-FOUND');
    });

    it('render to default outlet', async() => {
      const outlet = document.createElement('div');
      const router = new Router(outlet, mockOptions());
      router.route('/foo', createRouteFn('foo'));
      router.route('/bar', createRouteFn('bar'));

      await router.push('/foo');
      assert.strictEqual(outlet.innerHTML.includes('<!--marker-->'), true);
      assert.strictEqual(outlet.innerHTML.includes('<foo></foo>'), true);

      await router.push('/bar');
      assert.strictEqual(outlet.innerHTML.includes('<!--marker-->'), true);
      assert.strictEqual(outlet.innerHTML.includes('<bar></bar>'), true);
    });

    it('invoke middlewares', async() => {
      const outlet = new MockOutlet();
      const router = new Router(outlet, mockOptions());
      const hits: string[] = [];
      router.use(async(ctx, next) => {
        hits.push('pre1');
        await next();
        hits.push('post1');
      });
      router.use(async(ctx, next) => {
        hits.push('pre2');
        await next();
        hits.push('post2');
      });
      router.route('*', createRouteFn('foo'));
      await router.push('/foo');
      assert.deepStrictEqual(hits, ['pre1', 'pre2', 'post2', 'post1']);
    });
  });

  describe('#replace()', () => {
    it('replace state and dispatch', () => {
      const mock = mockOptions();
      const r = new Router(new MockOutlet(), mock);
      const dispatchedPaths: string[] = [];
      r['dispatch'] = (ctx) => {
        dispatchedPaths.push(ctx.path);
        return Promise.resolve();
      };
      r.replace('/foo');
      assert.strictEqual('/foo', dispatchedPaths[0]);
      assert.strictEqual('replace:/foo', (mock?.history as MockHistory).logs[0]);
    });
  });

  describe('#go()', () => {
    it('invoke history go', () => {
      const mock = mockOptions();
      const r = new Router(new MockOutlet(), mock);
      r.go(123);
      assert.strictEqual('go:123', (mock?.history as MockHistory).logs[0]);
    });
  });

  describe('#pop()', () => {
    it('invoke history go', () => {
      const mock = mockOptions();
      const r = new Router(new MockOutlet(), mock);
      r.pop();
      assert.strictEqual('go:-1', (mock?.history as MockHistory).logs[0]);
    });
  });
});

function createRouteFn(tagName: string) {
  return () => Promise.resolve(document.createElement(tagName));
}

class MockEventTarget {
  logs: string[] = [];

  addEventListener(name: string, listener: EventListener) {
    this.logs.push('add:' + name + ':' + listener.name);
  }

  removeEventListener(name: string, listener: EventListener) {
    this.logs.push('remove:' + name + ':' + listener.name);
  }
}

class MockHistory {
  logs: string[] = [];

  go(delta: number) {
    this.logs.push(`go:${delta}`);
  }

  pushState(_1: unknown, _2: string, path: string) {
    this.logs.push(`push:${path}`);
  }

  replaceState(_1: unknown, _2: string, path: string) {
    this.logs.push(`replace:${path}`);
  }
}

class MockOutlet {
  element?: Element;

  render(element: Element) {
    this.element = element;
    return Promise.resolve();
  }
}

function mockOptions(opts?: ConstructorParameters<typeof Router>[1]): ConstructorParameters<typeof Router>[1] {
  return {
    eventTarget: new MockEventTarget(),
    history: new MockHistory(),
    location: {
      pathname: '/',
      search: '',
      hash: '',
    },
    ...opts,
  };
}
