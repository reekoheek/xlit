import { Context } from './Context.js';
import { toContextedElement } from './ContextedElement.js';
import { HistoryMode } from './HistoryMode.js';
import { Middleware } from './Middleware.js';
import { DefaultOutlet, Outlet, isOutlet } from './Outlet.js';
import { Route, RouteFn } from './Route.js';
import { RouterError } from './RouterError.js';
import { Todo, todo } from './Todo.js';
import { EventTargetInterface, HistoryInterface, LocationInterface, ModeInterface } from './types.js';

type OutletArg<TState extends object> = Outlet<TState> | Element;

interface RouterOptions {
  readonly mode?: ModeInterface;
  readonly basePath?: string;
  readonly eventTarget?: EventTargetInterface;
  readonly history?: HistoryInterface;
  readonly location?: LocationInterface;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Router<TState extends object = any> {
  private outlet: Outlet<TState>;
  private routes: Route<TState>[] = [];
  private middlewares: Middleware<TState>[] = [];
  private mode: ModeInterface;
  private eventTarget: EventTargetInterface;
  private history: HistoryInterface;
  private location: LocationInterface;

  private ctx?: Context<TState>;
  private _dispatching?: Todo<void>;

  private popstateListener: EventListener = async() => {
    const path = this.mode.getContextPath(this.location);
    await this.dispatch(new Context(this, path));
  };

  private clickListener: EventListener = async(evt) => {
    const target = (evt.composedPath()[0] as Element).closest('a');
    if (!target) {
      return;
    }
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const path = this.mode.getContextPath(target);
    const ctx = new Context(this, path);
    this.history.pushState(undefined, '', target.href);
    await this.dispatch(ctx);
  };

  constructor(outlet: OutletArg<TState>, opts?: RouterOptions) {
    this.outlet = isOutlet(outlet) ? outlet : new DefaultOutlet(outlet);
    this.mode = opts?.mode ?? new HistoryMode();
    this.eventTarget = opts?.eventTarget ?? window;
    this.history = opts?.history ?? history;
    this.location = opts?.location ?? location;
  }

  start(): Promise<void> {
    this.eventTarget.addEventListener('popstate', this.popstateListener);
    this.eventTarget.addEventListener('click', this.clickListener);
    const ctx = new Context(this, this.mode.getContextPath(this.location));
    return this.dispatch(ctx);
  }

  stop(): void {
    this.eventTarget.removeEventListener('popstate', this.popstateListener);
    this.eventTarget.removeEventListener('click', this.clickListener);
  }

  use(middleware: Middleware<TState>): this {
    this.middlewares.push(middleware);
    return this;
  }

  route(path: string, fn: RouteFn<TState>): this {
    this.routes.push(new Route(path, fn));
    return this;
  }

  private async dispatch(ctx: Context<TState>): Promise<void> {
    if (this.ctx?.equals(ctx)) {
      return;
    }

    await this._dispatching;
    this._dispatching = todo();

    this.ctx = ctx;

    try {
      await invokeMiddlewareChain(this.middlewares, ctx, async() => {
        const route = this.routes.find(r => r.test(ctx));
        if (!route) {
          return;
        }
        ctx.result = await route.invoke(ctx);
      });

      if (!ctx.result) {
        throw new RouterError('no result route');
      }

      await this.outlet.render(toContextedElement(ctx.result, ctx));
    } finally {
      this._dispatching.resolve();
    }
  }

  push(path: string): Promise<void> {
    const ctx = new Context(this, path);
    this.history.pushState('', '', this.mode.getHistoryUrl(path));
    return this.dispatch(ctx);
  }

  replace(path: string): Promise<void> {
    const ctx = new Context(this, path);
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

function invokeMiddlewareChain<TState extends object>(
  middlewares: Middleware<TState>[],
  ctx: Context<TState>,
  core: Middleware<TState>,
): Promise<void> {
  const dispatch = (i: number): Promise<void> => {
    const fn = i === middlewares.length ? core : middlewares[i];
    return fn(ctx, () => dispatch(i + 1));
  };
  return dispatch(0);
}
