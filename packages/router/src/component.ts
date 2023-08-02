import { Context } from './Context.js';
import { RouteFn } from './Route.js';

type ComponentLoadFn<TState extends object> = (ctx: Context<TState>) => Promise<unknown>;

export function component<TState extends object>(name: string, load?: ComponentLoadFn<TState>): RouteFn<TState> {
  return async(ctx) => {
    if (load) {
      await load(ctx);
    }
    return document.createElement(name);
  };
}
