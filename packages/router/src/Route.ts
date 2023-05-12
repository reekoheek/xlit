import { Context } from './Context';
import { ContextedElement, toContextedElement } from './ContextedElement';
import { RouterError } from './RouterError';

export type RouteFn = (ctx: Context) => Promise<Element>;

export class Route {
  private pattern?: RegExp;
  private args: string[] = [];

  constructor(private path: string, private fn: RouteFn) {
    if (!path.match(/[[{]/)) {
      return;
    }

    const chunks = path.split('[');
    if (chunks.length > 2) {
      throw new RouterError('invalid use of optional params');
    }

    const args: string[] = [];
    const re = chunks[0].replace(/{([^}]+)}/g, function(_, token) {
      args.push(token);
      return '([^/]+)';
    }).replace(/\//g, '\\/');

    let optRe = '';
    if (chunks[1]) {
      optRe = '(?:' + chunks[1].slice(0, -1).replace(/{([^}]+)}/g, (_, token) => {
        const [realToken, re = '[^/]+'] = token.split(':');
        args.push(realToken);
        return `(${re})`;
      }).replace(/\//g, '\\/') + ')?';
    }

    this.pattern = new RegExp('^' + re + optRe + '$');
    this.args = args;
  }

  test(ctx: Context): boolean {
    if (this.pattern) {
      return Boolean(ctx.path.match(this.pattern));
    }
    return this.path === '*' || this.path === ctx.path;
  }

  async invoke(ctx: Context): Promise<ContextedElement> {
    if (this.pattern) {
      const matched = ctx.path.match(this.pattern) as RegExpMatchArray;
      this.args.forEach((arg, i) => (ctx.params[arg] = matched[i + 1]));
    }

    const el = await this.fn(ctx);
    return toContextedElement(el, ctx);
  }
}
