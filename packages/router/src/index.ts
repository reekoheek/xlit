class RouterError extends Error {
}

export class Context {
  readonly path: string;
  readonly query: Record<string, string> = {};
  readonly params: Record<string, string> = {};

  constructor(path: string) {
    const url = new URL(path, 'http://localhost');
    url.searchParams.forEach((v, k) => (this.query[k] = v));

    this.path = url.pathname;
  }

  equals(ctx: Context): boolean {
    if (this.path !== ctx.path) {
      return false;
    }
    const keySet = new Set([...Object.keys(this.query), ...Object.keys(ctx.query)]);
    for (const key of keySet) {
      if (this.query[key] !== ctx.query[key]) {
        return false;
      }
    }
    return true;
  }
}

interface ContextedElement extends Element {
  ctx: Context;
}

interface Outlet {
  render(el: ContextedElement): Promise<void>;
}

function isOutlet(o: object): o is Outlet {
  return 'render' in o;
}

type OutletOption = Outlet | Element;

class DefaultOutlet {
  constructor(private el: Element, private marker = document.createComment('marker')) {
    el.appendChild(this.marker);
  }

  async render(el: ContextedElement): Promise<void> {
    const promises = [];
    while (this.marker.nextSibling) {
      promises.push(this.el.removeChild(this.marker.nextSibling));
    }
    promises.push(this.el.appendChild(el));
    await Promise.all(promises);
  }
}

type Next = () => Promise<void>
type Middleware =(ctx: Context, next: Next) => Promise<void>;

function invokeMiddlewareChain(middlewares: Middleware[], ctx: Context, core: Middleware): Promise<void> {
  const dispatch = (i: number): Promise<void> => {
    const fn = i === middlewares.length ? core : middlewares[i];
    return fn(ctx, () => dispatch(i + 1));
  };
  return dispatch(0);
}

type RouteFn = (ctx: Context) => Promise<Element>;

class Route {
  private pattern?: RegExp;
  private args: string[] = [];

  constructor(private path: string, private fn: RouteFn) {
    if (!path.match(/[[{]/)) {
      return;
    }

    const chunks = path.split('[');
    if (chunks.length > 2) {
      throw new RouterError('invalid use of optional params');
    }

    const args: string[] = [];
    const re = chunks[0].replace(/{([^}]+)}/g, function(_, token) {
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

  test(ctx: Context): boolean {
    if (this.pattern) {
      return Boolean(ctx.path.match(this.pattern));
    }
    return this.path === '*' || this.path === ctx.path;
  }

  async invoke(ctx: Context): Promise<ContextedElement> {
    if (this.pattern) {
      const matched = ctx.path.match(this.pattern) as RegExpMatchArray;
      this.args.forEach((arg, i) => (ctx.params[arg] = matched[i + 1]));
    }

    const el = await this.fn(ctx);
    return toContextedElement(el, ctx);
  }
}

function toContextedElement(el: Element, ctx: Context): ContextedElement {
  const contextedEl = el as ContextedElement;
  contextedEl.ctx = ctx;
  return contextedEl;
}

interface Location {
  readonly pathname: string,
  readonly search: string,
  readonly hash: string,
}

interface Mode {
  getContextPath(location: Location): string;
  getHistoryUrl(path: string): string;
}

export class HistoryMode implements Mode {
  constructor(private basePath = '/') {
  }

  getContextPath({ pathname, search }: { pathname: string, search: string }): string {
    const path = decodeURI(pathname + search);
    if (!path.startsWith(this.basePath)) {
      throw new RouterError('invalid location');
    }
    return '/' + path.substring(this.basePath.length).replace(/\/+$/, '').replace(/^\/+/, '');
  }

  getHistoryUrl(path: string): string {
    const prefix = this.basePath === '/' ? '/' : this.basePath + '/';
    return prefix + path.replace(/\/+$/, '').replace(/^\/+/, '');
  }
}

export class HashMode implements Mode {
  getContextPath({ hash }: { hash: string }): string {
    const match = hash.match(/#!(.*)/);
    if (match && match[1]) {
      return '/' + match[1].replace(/\/+$/, '').replace(/^\/+/, '');
    }
    return '/';
  }

  getHistoryUrl(path: string): string {
    return '#!' + path;
  }
}

interface EventTarget {
  addEventListener(name: string, listener: EventListener): void;
  removeEventListener(name: string, listener: EventListener): void;
}

interface History {
  go(delta: number): void;
  pushState(data: unknown, unused: string, url: string): void;
  replaceState(data: unknown, unused: string, url: string): void;
}

interface RouterOptions {
  readonly mode?: Mode;
  readonly basePath?: string;
  readonly eventTarget?: EventTarget;
  readonly history?: History;
  readonly location?: Location;
}

export class Router {
  private outlet: Outlet;
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];
  private mode: Mode;
  private eventTarget: EventTarget;
  private history: History;
  private location: Location;

  private ctx?: Context;

  private popstateListener: EventListener = () => {
    const path = this.mode.getContextPath(this.location);
    this.dispatch(new Context(path));
  };

  private clickListener: EventListener = (evt) => {
    const target = (evt.target as Element).closest('a');
    if (!target) {
      return;
    }
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const path = this.mode.getContextPath(target);
    const ctx = new Context(path);
    this.history.pushState(undefined, '', target.href);
    this.dispatch(ctx);
  };

  constructor(outlet: OutletOption, opts?: RouterOptions) {
    this.outlet = isOutlet(outlet) ? outlet : new DefaultOutlet(outlet);
    this.mode = opts?.mode ?? new HistoryMode();
    this.eventTarget = opts?.eventTarget ?? window;
    this.history = opts?.history ?? history;
    this.location = opts?.location ?? location;
  }

  start(): Promise<void> {
    this.eventTarget.addEventListener('popstate', this.popstateListener);
    this.eventTarget.addEventListener('click', this.clickListener);
    const ctx = new Context(this.mode.getContextPath(this.location));
    return this.dispatch(ctx);
  }

  stop(): void {
    this.eventTarget.removeEventListener('popstate', this.popstateListener);
    this.eventTarget.removeEventListener('click', this.clickListener);
  }

  use(middleware: Middleware): Router {
    this.middlewares.push(middleware);
    return this;
  }

  route(path: string, fn: RouteFn): Router {
    this.routes.push(new Route(path, fn));
    return this;
  }

  private async dispatch(ctx: Context): Promise<void> {
    if (this.ctx && this.ctx.equals(ctx)) {
      return;
    }

    await invokeMiddlewareChain(this.middlewares, ctx, async() => {
      const route = this.routes.find(r => r.test(ctx));
      if (!route) {
        throw new RouterError('route not found');
      }

      this.ctx = ctx;

      const result = await route.invoke(ctx);
      if (result) {
        await this.outlet.render(result);
      }
    });
  }

  push(path: string): Promise<void> {
    const ctx = new Context(path);
    this.history.pushState('', '', this.mode.getHistoryUrl(path));
    return this.dispatch(ctx);
  }

  replace(path: string): Promise<void> {
    const ctx = new Context(path);
    this.history.replaceState('', '', this.mode.getHistoryUrl(path));
    return this.dispatch(ctx);
  }

  go(delta: number): void {
    this.history.go(delta);
  }

  pop(): void {
    this.go(-1);
  }
}

export function template(tpl: HTMLTemplateElement): RouteFn {
  return () => {
    const content = document.importNode(tpl.content, true);
    if (!content.firstElementChild) {
      throw new RouterError('invalid template to render');
    }
    return Promise.resolve(content.firstElementChild);
  };
}

type ComponentLoadFn = (ctx: Context) => Promise<unknown>;

export function component(name: string, load?: ComponentLoadFn): RouteFn {
  return async(ctx) => {
    if (load) {
      await load(ctx);
    }
    return document.createElement(name);
  };
}
