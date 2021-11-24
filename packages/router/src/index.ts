export class Context {
  readonly path: string;
  readonly query: Record<string, string> = {};
  readonly params: Record<string, string> = {};
  readonly state?: unknown;

  constructor (path: string, state?: unknown) {
    const url = new URL(path, 'http://localhost');
    url.searchParams.forEach((v, k) => (this.query[k] = v));

    this.path = url.pathname;
    this.state = state;
  }

  equals (ctx?: Context): boolean {
    if (!ctx) {
      return false;
    }
    if (this.path !== ctx.path) {
      return false;
    }
    const q1 = this.query;
    const q2 = ctx.query;
    const s = new Set([...Object.keys(q1), ...Object.keys(q2)]);
    for (const k of s) {
      if (q1[k] !== q2[k]) {
        return false;
      }
    }
    return true;
  }
}

interface Result {
  ctx: Context;
}

interface Outlet {
  render(result: unknown): Promise<void>;
}

type OutletOption = Outlet | Element;

export class DefaultOutlet {
  readonly el: Element;
  readonly marker: Comment;

  constructor (el: Element) {
    this.el = el;
    this.marker = document.createComment('marker');
    el.appendChild(this.marker);
  }

  async render (result: unknown): Promise<void> {
    if (result instanceof Element === false) {
      throw new Error('fail to render non element');
    }
    const el = result as Element;
    const promises = [];
    while (this.marker.nextSibling) {
      promises.push(this.el.removeChild(this.marker.nextSibling));
    }
    promises.push(this.el.appendChild(el));
    await Promise.all(promises);
  }
}

interface Next {
  (ctx?: Context): Promise<void>;
}

interface Middleware {
  (ctx: Context, next: Next): Promise<void>;
}

export function invokeMiddlewareChain (middlewares: Middleware[], ctx: Context, next: Next): Promise<void> {
  // let index = -1;
  const dispatch = (i: number): Promise<void> => {
    // if (i <= index) throw new Error('next() called multiple times');
    // index = i;
    const fn = i === middlewares.length ? next : middlewares[i];
    return fn(ctx, () => dispatch(i + 1));
  };
  return dispatch(0);
}

interface RouteFn {
  (ctx: Context): Promise<unknown | void>;
}

export class Route {
  readonly path: string;
  readonly fn: RouteFn;
  readonly pattern?: RegExp;
  readonly args?: string[];

  constructor (path: string, fn: RouteFn) {
    this.path = path;
    this.fn = fn;

    if (!path.match(/[[{]/)) {
      return;
    }

    const chunks = path.split('[');
    if (chunks.length > 2) {
      throw new Error('invalid use of optional params');
    }

    const args: string[] = [];
    const re = chunks[0].replace(/{([^}]+)}/g, function (_, token) {
      args.push(token);
      return '([^/]+)';
    }).replace(/\//g, '\\/');

    let optRe = '';
    if (chunks[1]) {
      optRe = '(?:' + chunks[1].slice(0, -1).replace(/{([^}]+)}/g, (_, token) => {
        const [realToken, re = '[^/]+'] = token.split(':');
        args.push(realToken);
        return `(${re})`;
      }).replace(/\//g, '\\/') + ')?';
    }

    this.pattern = new RegExp('^' + re + optRe + '$');
    this.args = args;
  }

  test (ctx: Context): boolean {
    if (this.pattern) {
      return Boolean(ctx.path.match(this.pattern));
    }
    return this.path === '*' || this.path === ctx.path;
  }

  async invoke (ctx: Context): Promise<Result | void> {
    if (this.pattern) {
      const matched = ctx.path.match(this.pattern);
      if (!matched) {
        throw new Error('invalid route pattern');
      }
      this.args?.forEach((arg, i) => (ctx.params[arg] = matched[i + 1]));
    }

    const el = await this.fn(ctx);
    if (el) {
      const result = <unknown>el as Result;
      result.ctx = ctx;
      return result;
    }
  }
}

type Mode = 'history' | 'hash'

interface Location {
  readonly pathname: string,
  readonly search: string,
  readonly hash: string,
}

interface Window {
  addEventListener(name: string, listener: EventListener): void;
  removeEventListener(name: string, listener: EventListener): void;
}

interface History {
  go(delta?: number): void;
  pushState(data: unknown, unused: string, url: string): void;
  replaceState(data: unknown, unused: string, url: string): void;
}

export interface RouterOptions {
  readonly mode: Mode;
  readonly basePath: string;
  readonly window: Window;
  readonly history: History;
  readonly location: Location;
  readonly startsIn: number;
}

export function getContextPath ({ pathname, search, hash }: Location, mode: Mode, basePath: string): string {
  if (mode === 'history') {
    const path = decodeURI(pathname + search);
    if (!path.startsWith(basePath)) {
      throw new Error('invalid location');
    }
    return '/' + path.substr(basePath.length).replace(/\/+$/, '').replace(/^\/+/, '');
  }
  const match = hash.match(/#!(.*)/);
  if (match && match[1]) {
    return '/' + match[1].replace(/\/+$/, '').replace(/^\/+/, '');
  }
  return '/';
}

export function getHistoryURL (path: string, mode: Mode, basePath: string): string {
  if (mode === 'hash') {
    return '#!' + path;
  }

  const prefix = basePath === '/' ? '/' : basePath + '/';
  return prefix + path.replace(/\/+$/, '').replace(/^\/+/, '');
}

export class Router {
  readonly outlet: Outlet;
  readonly routes: Route[] = [];
  readonly middlewares: Middleware[] = [];
  readonly mode: Mode;
  readonly basePath: string;
  readonly window: Window;
  readonly history: History;
  readonly location: Location;
  ctx?: Context;

  popstateListener: EventListener = (evt) => {
    const path = getContextPath(this.location, this.mode, this.basePath);
    this.dispatch(new Context(path, (evt as PopStateEvent).state));
  }

  clickListener: EventListener = (evt) => {
    const target = (evt.target as Element).closest('a');
    if (!target) {
      return;
    }
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const path = getContextPath(target, this.mode, this.basePath);
    const ctx = new Context(path);
    this.history.pushState(undefined, '', target.href);
    this.dispatch(ctx);
  }

  constructor (outlet: OutletOption, opts: Partial<RouterOptions> = {}) {
    this.outlet = this.createOutlet(outlet);
    this.mode = opts.mode ?? 'history';
    this.basePath = opts.basePath ?? '/';
    this.window = opts.window ?? window;
    this.history = opts.history ?? history;
    this.location = opts.location ?? location;

    const startsIn = opts.startsIn ?? 0;
    if (startsIn >= 0) {
      setTimeout(() => this.start(), startsIn);
    }
  }

  createOutlet (outlet: OutletOption): Outlet {
    if ('render' in outlet) {
      return outlet;
    }
    return new DefaultOutlet(outlet);
  }

  start (): void {
    this.window.addEventListener('popstate', this.popstateListener);
    this.window.addEventListener('click', this.clickListener);
    const ctx = new Context(getContextPath(this.location, this.mode, this.basePath));
    this.dispatch(ctx);
  }

  stop (): void {
    this.window.removeEventListener('popstate', this.popstateListener);
    this.window.removeEventListener('click', this.clickListener);
  }

  use (middleware: Middleware): Router {
    this.middlewares.push(middleware);
    return this;
  }

  route (path: string, fn: RouteFn): Router {
    this.routes.push(new Route(path, fn));
    return this;
  }

  async dispatch (ctx: Context): Promise<void> {
    if (this.ctx?.equals(ctx)) {
      return;
    }

    await invokeMiddlewareChain(this.middlewares, ctx, async () => {
      const route = this.routes.find(r => r.test(ctx));
      if (!route) {
        throw new Error('route not found');
      }

      this.ctx = ctx;

      const result = await route.invoke(ctx);
      if (result) {
        await this.outlet.render(result);
      }
    });
  }

  push (path: string, state?: unknown): void {
    const ctx = new Context(path, state);
    this.history.pushState(state, '', getHistoryURL(path, this.mode, this.basePath));
    this.dispatch(ctx);
  }

  replace (path: string, state?: unknown): void {
    const ctx = new Context(path, state);
    this.history.replaceState(state, '', getHistoryURL(path, this.mode, this.basePath));
    this.dispatch(ctx);
  }

  go (delta: number): void {
    this.history.go(delta);
  }

  pop (): void {
    this.go(-1);
  }
}

export function template (tpl: HTMLTemplateElement): RouteFn {
  return () => {
    const content = document.importNode(tpl.content, true);
    return Promise.resolve(content.firstElementChild);
  };
}

interface ComponentLoadFn {
  (ctx: Context): Promise<void>;
}

export function component (name: string, load?: ComponentLoadFn): RouteFn {
  return async (ctx) => {
    if (load) {
      await load(ctx);
    }
    return document.createElement(name);
  };
}
