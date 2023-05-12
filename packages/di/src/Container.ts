import { DIError } from './DIError';
import { Injectable, getMetadata } from './Injectable';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

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

  provide(name: string, fn: Provider): void {
    this.fns[name] = fn;
  }

  unprovide(name: string) {
    delete this.fns[name];
  }

  lookup<T>(name: string): Promise<T> {
    const fn = this.fns[name];
    if (!fn) {
      throw new DIError(`provider not found to lookup "${name}"`);
    }
    return fn(this) as Promise<T>;
  }

  injectable() {
    const inject = (obj: Injectable) => {
      const metadata = getMetadata(obj);

      for (const entry of metadata.provideEntries) {
        this.provide(entry.to, () => obj[entry.from]);
      }

      obj.__diInjected = Promise.all(metadata.lookupEntries.map(async(entry) => {
        obj[entry.to] = await this.lookup(entry.from);
      }));
    };

    return <Class extends Constructor>(Target: Class, ctx?: unknown) => {
      if (ctx) {
        throw new Error('new decorator spec unimplemented');
      }

      return class extends Target {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
          super(...args);
          inject(this as unknown as Injectable);
        }
      };
    };
  }

  injectLookup(name?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, ctx: unknown) => {
      if (typeof ctx !== 'string') {
        throw new Error('new decorator spec unimplemented');
      }

      getMetadata(target).lookupEntries.push({
        from: name ?? ctx,
        to: ctx,
      });
    };
  }

  injectProvide(name?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, ctx: unknown) => {
      if (typeof ctx !== 'string') {
        throw new Error('new decorator spec unimplemented');
      }

      getMetadata(target).provideEntries.push({
        from: name ?? ctx,
        to: ctx,
      });
    };
  }
}
