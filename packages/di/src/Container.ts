import { DIError } from './DIError.js';
import { Injectable, getMetadata } from './Injectable.js';
import { injected } from './injected.js';
import { singleton } from './singleton.js';

export const excludeName = '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

// eslint-disable-next-line no-use-before-define
export type Provider = (c: Container) => Promise<unknown> | unknown;

type ContainerArg = Record<string, Provider>

type Scope = 'singleton' | 'transient';

export class Container {
  private fns: Record<string, Provider> = {};

  constructor(arg: ContainerArg = {}) {
    for (const name in arg) {
      this.addProvider(name, arg[name]);
    }
  }

  addProvider(name: string, fn: Provider) {
    this.fns[name] = fn;
    return this;
  }

  get<T>(name: string): Promise<T> {
    const fn = this.fns[name];
    if (!fn) {
      throw new DIError(`provider not found to get "${name}"`);
    }
    return fn(this) as Promise<T>;
  }

  inject(name?: string, scope: Scope = 'singleton') {
    const inject = (obj: Injectable) => {
      const metadata = getMetadata(obj);

      for (const entry of metadata.provideEntries) {
        this.addProvider(entry.to, () => obj[entry.from]);
      }

      obj.__diInjected = Promise.all(metadata.lookupEntries.map(async(entry) => {
        obj[entry.to] = await this.get(entry.from);
      }));
    };

    return <Class extends Constructor>(Target: Class, ctx?: unknown) => {
      if (ctx) throw new Error('new decorator spec unimplemented');

      const InjectableTarget = class extends Target implements Injectable {
        [key: string]: unknown;
        __diInjected!: Promise<unknown>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
          super(...args);
          inject(this);
        }
      };

      name = name ?? getInjectableName(Target.name);

      if (name !== excludeName) {
        const fn = async() => {
          const obj = new InjectableTarget();
          await injected(obj);
          return obj;
        };

        this.addProvider(name, scope === 'singleton' ? singleton(fn) : fn);
      }

      return InjectableTarget;
    };
  }

  lookup(name?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, ctx: unknown) => {
      if (typeof ctx !== 'string') throw new Error('new decorator spec unimplemented');

      name = name ?? ctx;
      if (name === excludeName) {
        throw new Error('lookup must not exclude name');
      }

      getMetadata(target).lookupEntries.push({ from: name, to: ctx });
    };
  }

  provide(name?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: any, ctx: unknown) => {
      if (typeof ctx !== 'string') throw new Error('new decorator spec unimplemented');

      name = name ?? ctx;
      if (name === excludeName) {
        throw new Error('provide must not exclude name');
      }

      getMetadata(target).provideEntries.push({ from: name ?? ctx, to: ctx });
    };
  }
}

function getInjectableName(className: string) {
  return className[0].toLowerCase() + className.slice(1);
}
