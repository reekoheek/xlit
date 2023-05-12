import { Context } from './Context';
import { RouteFn } from './Route';

type ComponentLoadFn = (ctx: Context) => Promise<unknown>;

export function component(name: string, load?: ComponentLoadFn): RouteFn {
  return async(ctx) => {
    if (load) {
      await load(ctx);
    }
    return document.createElement(name);
  };
}
