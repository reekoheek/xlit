import { DIError } from './DIError.js';

// eslint-disable-next-line no-use-before-define
export type Provider = (c: Container) => Promise<NonNullable<unknown>> | NonNullable<unknown>;

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

  private fns: Record<string, Provider> = {};

  provide(name: string, fn: Provider): this {
    this.fns[name] = fn;
    return this;
  }

  lookup<T>(name: string): Promise<T> {
    const fn = this.fns[name];
    if (!fn) {
      throw new DIError(`provider not found to lookup "${name}"`);
    }
    return fn(this) as Promise<T>;
  }
}

let instance: Container | undefined;
