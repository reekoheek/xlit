import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { Navigator } from './Navigator.js';
import { ElementOutlet, Outlet } from './Outlet.js';
import { HistoryMode } from './HistoryMode.js';
import { Dispatcher } from './Dispatcher.js';
import { Context } from './Context.js';

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
      expect(() => Navigator['_']()).toThrowError(/navigator is not running/);
      await Navigator.run(dispatcher);
      expect(Navigator['_']().constructor).toStrictEqual(Navigator);
      await expect(async() => await Navigator.run(dispatcher)).rejects.toThrowError(/navigator already run/);
    });

    it('set default value', async() => {
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher);
      const navigator = Navigator['_']();
      expect(navigator['dispatcher']).toStrictEqual(dispatcher);
      expect(navigator['outlet'].constructor).toStrictEqual(ElementOutlet);
      expect(navigator['mode'].constructor).toStrictEqual(HistoryMode);
      expect(navigator['eventTarget']).toStrictEqual(window);
      expect(navigator['history']).toStrictEqual(history);
      expect(navigator['location']).toStrictEqual(location);
    });
  });

  describe('.push()', () => {
    it('push state and dispatch', async() => {
      const dispatcher = new MockDispatcher();
      const history = new MockHistory();
      await Navigator.run(dispatcher, mockOptions({ history }));
      await Navigator.push('/foo');
      expect(dispatcher.hits[1].path).toStrictEqual('/foo');
      expect(history.hits.length).toStrictEqual(1);
      expect(history.hits[0]).toStrictEqual('push:/foo');
    });
  });

  describe('.replace()', () => {
    it('replace state and dispatch', async() => {
      const dispatcher = new MockDispatcher();
      const history = new MockHistory();
      await Navigator.run(dispatcher, mockOptions({ history }));
      await Navigator.replace('/foo');
      expect(dispatcher.hits[1].path).toStrictEqual('/foo');
      expect(history.hits.length).toStrictEqual(1);
      expect(history.hits[0]).toStrictEqual('replace:/foo');
    });
  });

  describe('.go()', () => {
    it('invoke history go', async() => {
      const history = new MockHistory();
      await Navigator.run(new MockDispatcher(), mockOptions({ history }));
      await Navigator.go(123);
      expect(history.hits[0]).toStrictEqual('go:123');
    });
  });

  describe('#pop()', () => {
    it('invoke history go', async() => {
      const history = new MockHistory();
      await Navigator.run(new MockDispatcher(), mockOptions({ history }));
      await Navigator.pop();
      expect(history.hits[0]).toStrictEqual('go:-1');
    });
  });

  describe('on popstate', () => {
    it('dispatch', async() => {
      const location = new MockLocation('/foo');
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher, mockOptions({ location }));
      Navigator['_']()['popstateListener'](new CustomEvent('popstate'));
      await new Promise((resolve) => setTimeout(resolve));
      expect(dispatcher.hits.length).toStrictEqual(1);
      expect(dispatcher.hits[0].path).toStrictEqual('/foo');
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
        expect(false).toStrictEqual(evt.defaultPrevented);
        evt.preventDefault();
        invoked = true;
      });
      const target = root.querySelector('target') as HTMLElement;
      const child = root.querySelector('child') as HTMLElement;
      const history = new MockHistory();
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher, mockOptions({ eventTarget: target, history }));
      child.click();
      expect(history.hits.length).toStrictEqual(0);
      expect(dispatcher.hits.length).toStrictEqual(1);
      expect(invoked).toStrictEqual(true);
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
      expect(invoked).toStrictEqual(false);
      expect(history.hits.length).toStrictEqual(1);
      expect(dispatcher.hits.length).toStrictEqual(2);
      expect(dispatcher.hits[1].path).toStrictEqual('/foo');
    });
  });

  describe('#dispatch()', () => {
    it('immediate return if same context', async() => {
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher);
      expect(dispatcher.hits.length).toStrictEqual(1);
      const navigator = Navigator['_']();
      navigator['currentCtx'] = new Context('/foo');
      await navigator['dispatch'](new Context('/foo'));
      expect(dispatcher.hits.length).toStrictEqual(1);
    });

    it('throw error if no context result', async() => {
      const dispatcher = new MockDispatcher();
      await Navigator.run(dispatcher);
      expect(dispatcher.hits.length).toStrictEqual(1);
      const navigator = Navigator['_']();

      dispatcher['result'] = undefined;
      await expect(async() => {
        await navigator['dispatch'](new Context('/foo'));
      }).rejects.toThrowError(/no result route/);
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
