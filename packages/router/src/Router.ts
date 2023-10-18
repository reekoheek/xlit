import { Context } from './Context.js';
import { Dispatcher } from './Dispatcher.js';
import { Middleware } from './Middleware.js';
import { Route, RouteFn } from './Route.js';
import { RouterError } from './RouterError.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Router<TState extends object = any> implements Dispatcher<TState> {
  private routes: Route[] = [];
  private middlewares: Middleware<TState>[] = [];

  use(middleware: Middleware<TState>): this {
    this.middlewares.push(middleware);
    return this;
  }

  route(path: string, fn: RouteFn<TState>): this {
    this.routes.push(new Route(path, fn));
    return this;
  }

  async dispatch(ctx: Context<TState>): Promise<void> {
    await this.invokeMiddlewareChain(ctx, async() => {
      const route = this.routes.find(route => route.test(ctx));
      if (route) {
        ctx.result = await route.invoke(ctx);
      }
    });
  }

  private invokeMiddlewareChain(ctx: Context<TState>, core: Middleware<TState>): Promise<void> {
    const middlewares = this.middlewares;
    const dispatch = (i: number): Promise<void> => {
      if (ctx.halted) {
        console.error('race condition or might be invalid next invocation after context halted');
        return Promise.resolve();
      }
      const fn = i === middlewares.length ? core : middlewares[i];
      return fn(ctx, () => dispatch(i + 1));
    };
    return dispatch(0);
  }
}
