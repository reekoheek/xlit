// eslint-disable-next-line no-use-before-define
export type Provider<T> = () => T;

export class Container {
  static instance() {
    if (!instance) {
      instance = new Container();
    }
    return instance;
  }

  static reset() {
    instance = undefined;
  }

  private fns: Record<string, Provider<unknown>> = {};

  provide<T>(key: string, fn: Provider<T>): this {
    if (this.provided(key)) {
      throw new Error(`already provided key "${key}"`);
    }
    this.fns[key] = fn;
    return this;
  }

  provided(key: string): boolean {
    return Boolean(this.fns[key]);
  }

  lookup<T>(key: string): T {
    const fn = this.fns[key];
    if (!fn) {
      throw new Error(`provider not found to lookup "${key}"`);
    }
    return fn() as T;
  }
}

let instance: Container | undefined;
