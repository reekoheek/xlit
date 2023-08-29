import { Middleware } from '../Middleware.js';
import { RouteFn } from '../Route.js';

export function notFound(fn: RouteFn<object>): Middleware<object> {
  return async(ctx, next) => {
    await next();

    if (!ctx.result) {
      console.error('path not found:', ctx.path);
      ctx.result = await fn(ctx);
    }
  };
}
