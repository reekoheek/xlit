import { Middleware } from '../Middleware.js';

interface WithTitle {
  title: string;
}

export function title<TState extends object>(appName: string, doc: WithTitle = document): Middleware<TState> {
  return async(ctx, next) => {
    await next();

    requestAnimationFrame(() => {
      const el = ctx.result as HTMLElement;
      if (!el) {
        doc.title = appName;
        return;
      }
      const root = el.shadowRoot ?? el;
      const title = el.title || (root.querySelector('h1, h2, h3, h4')?.textContent ?? '');
      doc.title = title ? `${title} - ${appName}` : appName;
    });
  };
}
