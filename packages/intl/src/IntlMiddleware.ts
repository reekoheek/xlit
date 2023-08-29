import { Intl } from './Intl.js';
import { IntlError } from './IntlError.js';

interface Ctx<T> {
  state: T;
}
type Next = () => Promise<void>;
type Middleware<T> = (ctx: Ctx<T>, next: Next) => Promise<void>

export interface IntlState {
  intl: Intl;
}

export class IntlMiddleware {
  constructor(private intl: Intl) {

  }

  set(intl: Intl) {
    this.intl = intl;
  }

  middleware(): Middleware<IntlState> {
    const htmlEl = document.querySelector('html') as HTMLElement;
    htmlEl.lang = this.intl.locale;

    return async(ctx, next) => {
      if (ctx.state.intl) {
        throw new IntlError('intl already initialized');
      }

      ctx.state.intl = this.intl;
      await next();
    };
  }
}
