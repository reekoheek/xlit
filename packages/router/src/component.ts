import { Context } from './Context.js';
import { RouteFn } from './Route.js';

type ComponentLoadFn = (ctx: Context) => Promise<unknown>;

export function component(name: string, load?: ComponentLoadFn): RouteFn {
  return async(ctx) => {
    if (load) {
      await load(ctx);
    }
    return document.createElement(name);
  };
}
