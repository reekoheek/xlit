import { Middleware } from '../Middleware.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLayout(o: any): string {
  return o?.layout ?? '';
}

export function layout(root: HTMLElement = document.body): Middleware<object> {
  return async(ctx, next) => {
    await next();

    const layout = getLayout(ctx.result);

    if (layout) {
      root.setAttribute('layout', layout);
    } else {
      root.removeAttribute('layout');
    }
  };
}
