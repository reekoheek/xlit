import { Context } from './Context';
import { HistoryMode } from './HistoryMode';
import { DefaultOutlet, Outlet, isOutlet } from './Outlet';
import { Route, RouteFn } from './Route';
import { RouterError } from './RouterError';
import { EventTargetInterface, HistoryInterface, LocationInterface, ModeInterface } from './types';

type Next = () => Promise<void>

type Middleware =(ctx: Context, next: Next) => Promise<void>;

type OutletArg = Outlet | Element;

interface RouterOptions {
  readonly mode?: ModeInterface;
  readonly basePath?: string;
  readonly eventTarget?: EventTargetInterface;
  readonly history?: HistoryInterface;
  readonly location?: LocationInterface;
}

export class Router {
  private outlet: Outlet;
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];
  private mode: ModeInterface;
  private eventTarget: EventTargetInterface;
  private history: HistoryInterface;
  private location: LocationInterface;

  private ctx?: Context;

  private popstateListener: EventListener = () => {
    const path = this.mode.getContextPath(this.location);
    this.dispatch(new Context(path));
  };

  private clickListener: EventListener = (evt) => {
    const target = (evt.composedPath()[0] as Element).closest('a');
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

  constructor(outlet: OutletArg, opts?: RouterOptions) {
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

function invokeMiddlewareChain(middlewares: Middleware[], ctx: Context, core: Middleware): Promise<void> {
  const dispatch = (i: number): Promise<void> => {
    const fn = i === middlewares.length ? core : middlewares[i];
    return fn(ctx, () => dispatch(i + 1));
  };
  return dispatch(0);
}
