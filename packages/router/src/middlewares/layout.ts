import { Middleware } from '../Middleware.js';

function getLayout(o: unknown): string {
  if (!o) {
    return '';
  }
  return (o as { layout: string }).layout ?? '';
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
