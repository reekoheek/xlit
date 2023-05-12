export class Context {
  readonly path: string;
  readonly query: Record<string, string> = {};
  readonly params: Record<string, string> = {};

  constructor(path: string) {
    const url = new URL(path, 'http://localhost');
    url.searchParams.forEach((v, k) => (this.query[k] = v));

    this.path = url.pathname;
  }

  equals(ctx: Context): boolean {
    if (this.path !== ctx.path) {
      return false;
    }
    const keySet = new Set([...Object.keys(this.query), ...Object.keys(ctx.query)]);
    for (const key of keySet) {
      if (this.query[key] !== ctx.query[key]) {
        return false;
      }
    }
    return true;
  }
}
