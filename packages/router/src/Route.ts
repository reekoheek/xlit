import { Context } from './Context.js';
import { RouterError } from './RouterError.js';

export type RouteFn<TState extends object> = (ctx: Context<TState>) => Promise<Element>;

export class Route {
  private pattern?: RegExp;
  private args: string[] = [];

  constructor(private path: string, private fn: RouteFn<object>) {
    if (!/[[{]/.exec(path)) {
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

  test(ctx: Context<object>): boolean {
    if (this.pattern) {
      return Boolean(this.pattern.exec(ctx.path));
    }
    return this.path === '*' || this.path === ctx.path;
  }

  async invoke(ctx: Context<object>): Promise<Element> {
    if (this.pattern) {
      const matched = this.pattern.exec(ctx.path) as RegExpMatchArray;
      this.args.forEach((arg, i) => {
        const result = matched[i + 1];
        if (result !== undefined) {
          ctx.params[arg] = result;
        }
      });
    }

    return await this.fn(ctx);
  }
}
