import type { Middleware } from '../index.js';

export function title(appName: string): Middleware {
  return async(ctx, next) => {
    await next();

    requestAnimationFrame(() => {
      const el = ctx.result as HTMLElement;
      if (!el) {
        document.title = appName;
        return;
      }
      const root = el.shadowRoot ?? el;
      const title = el.title || (root.querySelector('h1, h2, h3, h4')?.textContent ?? '');
      document.title = title ? `${title} - ${appName}` : appName;
    });
  };
}
