import { DIError } from './DIError.js';

// eslint-disable-next-line no-use-before-define
export type Provider = (c: Container) => Promise<unknown> | unknown;

type ContainerArg = Record<string, Provider>

export class Container {
  private fns: Record<string, Provider> = {};

  constructor(arg: ContainerArg = {}) {
    for (const name in arg) {
      this.provide(name, arg[name]);
    }
  }

  provide(name: string, fn: Provider) {
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
