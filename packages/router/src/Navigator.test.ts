import { assert, fixture, html } from '@open-wc/testing';
import { Navigator } from './Navigator.js';
import { ElementOutlet, Outlet } from './Outlet.js';
import { HistoryMode } from './HistoryMode.js';
import { Dispatcher } from './Dispatcher.js';
import { Context } from './Context.js';
import { assertRejects } from './test/assertRejects.js';

describe('Navigator', () => {
  beforeEach(async() => {
    await Navigator.reset();
  });

  afterEach(async() => {
    await Navigator.reset();
  });

  describe('.run()', () => {
    it('run navigator', async() => {
      const dispatcher = new MockDispatcher();
      assert.throws(() => Navigator['_'](), /navigator is not running/);
      await Navigator.run(dispatcher);
      assert.strictEqual(Navigator['_']().constructor, Navigator);
      await assertRejects(async() => await Navigator.run(dispatcher), /navigator already run/);
    });

    it('set default value', async() => {
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher);
      const navigator = Navigator['_']();
      assert.strictEqual(navigator['dispatcher'], dispatcher);
      assert.strictEqual(navigator['outlet'].constructor, ElementOutlet);
      assert.strictEqual(navigator['mode'].constructor, HistoryMode);
      assert.strictEqual(navigator['eventTarget'], window);
      assert.strictEqual(navigator['history'], history);
      assert.strictEqual(navigator['location'], location);
    });
  });

  describe('.push()', () => {
    it('push state and dispatch', async() => {
      const dispatcher = new MockDispatcher();
      const history = new MockHistory();
      await Navigator.run(dispatcher, mockOptions({ history }));
      await Navigator.push('/foo');
      assert.strictEqual(dispatcher.hits[1].path, '/foo');
      assert.strictEqual(history.hits.length, 1);
      assert.strictEqual(history.hits[0], 'push:/foo');
    });
  });

  describe('.replace()', () => {
    it('replace state and dispatch', async() => {
      const dispatcher = new MockDispatcher();
      const history = new MockHistory();
      await Navigator.run(dispatcher, mockOptions({ history }));
      await Navigator.replace('/foo');
      assert.strictEqual(dispatcher.hits[1].path, '/foo');
      assert.strictEqual(history.hits.length, 1);
      assert.strictEqual(history.hits[0], 'replace:/foo');
    });
  });

  describe('.go()', () => {
    it('invoke history go', async() => {
      const history = new MockHistory();
      await Navigator.run(new MockDispatcher(), mockOptions({ history }));
      await Navigator.go(123);
      assert.strictEqual(history.hits[0], 'go:123');
    });
  });

  describe('#pop()', () => {
    it('invoke history go', async() => {
      const history = new MockHistory();
      await Navigator.run(new MockDispatcher(), mockOptions({ history }));
      await Navigator.pop();
      assert.strictEqual(history.hits[0], 'go:-1');
    });
  });

  describe('on popstate', () => {
    it('dispatch', async() => {
      const location = new MockLocation('/foo');
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher, mockOptions({ location }));
      Navigator['_']()['popstateListener'](new CustomEvent('popstate'));
      await new Promise((resolve) => setTimeout(resolve));
      assert.strictEqual(dispatcher.hits.length, 1);
      assert.strictEqual(dispatcher.hits[0].path, '/foo');
    });
  });

  describe('on click', () => {
    it('propagate if target is not link', async() => {
      const root: HTMLElement = await fixture(html`
        <root>
          <target>
            <child></child>
          </target>
        </root>
      `);
      let invoked = false;
      root.addEventListener('click', (evt) => {
        assert.strictEqual(false, evt.defaultPrevented);
        evt.preventDefault();
        invoked = true;
      });
      const target = root.querySelector('target') as HTMLElement;
      const child = root.querySelector('child') as HTMLElement;
      const history = new MockHistory();
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher, mockOptions({ eventTarget: target, history }));
      child.click();
      assert.strictEqual(history.hits.length, 0);
      assert.strictEqual(dispatcher.hits.length, 1);
      assert.strictEqual(invoked, true);
    });

    it('push state and dispatch', async() => {
      const root: HTMLElement = await fixture(html`
        <root>
          <target>
            <a href="/foo?bar=baz"></a>
          </target>
        </root>
      `);
      let invoked = false;
      root.addEventListener('click', (evt) => {
        evt.preventDefault();
        invoked = true;
      });
      const target = root.querySelector('target') as HTMLElement;
      const clickable = root.querySelector('a') as HTMLElement;
      const dispatcher = new MockDispatcher();
      const history = new MockHistory();
      await Navigator.run(dispatcher, mockOptions({ eventTarget: target, history }));
      clickable.click();
      await new Promise((resolve) => setTimeout(resolve));
      assert.strictEqual(invoked, false);
      assert.strictEqual(history.hits.length, 1);
      assert.strictEqual(dispatcher.hits.length, 2);
      assert.strictEqual(dispatcher.hits[1].path, '/foo');
    });
  });

  describe('#dispatch()', () => {
    it('immediate return if same context', async() => {
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher);
      assert.strictEqual(dispatcher.hits.length, 1);
      const navigator = Navigator['_']();
      navigator['currentCtx'] = new Context('/foo');
      await navigator['dispatch'](new Context('/foo'));
      assert.strictEqual(dispatcher.hits.length, 1);
    });

    it('throw error if no context result', async() => {
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher);
      assert.strictEqual(dispatcher.hits.length, 1);
      const navigator = Navigator['_']();

      dispatcher['result'] = undefined;
      await assertRejects(async() => {
        await navigator['dispatch'](new Context('/foo'));
      }, /no result route/);
    });
  });
});

class MockEventTarget {
  hits: string[] = [];

  addEventListener(name: string, listener: EventListener) {
    this.hits.push('add:' + name + ':' + listener.name);
  }

  removeEventListener(name: string, listener: EventListener) {
    this.hits.push('remove:' + name + ':' + listener.name);
  }
}

class MockHistory {
  hits: string[] = [];

  go(delta: number) {
    this.hits.push(`go:${delta}`);
  }

  pushState(_1: unknown, _2: string, path: string) {
    this.hits.push(`push:${path}`);
  }

  replaceState(_1: unknown, _2: string, path: string) {
    this.hits.push(`replace:${path}`);
  }
}

class MockOutlet implements Outlet<object> {
  element?: Element;

  render(element: Element) {
    this.element = element;
    return Promise.resolve();
  }
}

class MockDispatcher implements Dispatcher<object> {
  hits: Context<object>[] = [];

  constructor(private result: Element | undefined = document.createElement('result')) {

  }

  dispatch(ctx: Context<object>): Promise<void> {
    this.hits.push(ctx);

    ctx.result = this.result;

    return Promise.resolve();
  }
}

class MockLocation {
  constructor(public pathname = '/', public search = '', public hash = '') {

  }
}

type NavigatorOpts = Parameters<typeof Navigator.run>[1];

function mockOptions(opts?: Partial<NavigatorOpts>): NavigatorOpts {
  return {
    outlet: new MockOutlet(),
    eventTarget: new MockEventTarget(),
    history: new MockHistory(),
    location: new MockLocation(),
    ...opts,
  };
}
