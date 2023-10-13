import { Intl } from './Intl.js';
import { IntlError } from './IntlError.js';

interface Context {
  state: {
    intl?: Intl;
  },
}

type Next = () => Promise<void>;

export interface IntlState {
  intl: Intl;
}

export class IntlMiddleware {
  constructor(private intl: Intl) {

  }

  set(intl: Intl) {
    this.intl = intl;
  }

  middleware() {
    const htmlEl = document.querySelector('html') as HTMLElement;
    htmlEl.lang = this.intl.locale;

    return async(ctx: Context, next: Next) => {
      if (ctx.state.intl) {
        throw new IntlError('intl already initialized');
      }

      ctx.state.intl = this.intl;
      await next();
    };
  }
}
