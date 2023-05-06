// TODO: comply to decorator spec when it's ready

class DIError extends Error {
}

// eslint-disable-next-line no-use-before-define
type ProviderFn = (c: Container) => Promise<unknown> | unknown;

interface LookupEntry {
  readonly from: string;
  readonly to: string;
}

interface ProvideEntry {
  readonly from: string;
  readonly to: string;
}

interface Metadata {
  readonly lookupEntries: LookupEntry[];
  readonly provideEntries: ProvideEntry[];
}

interface WithMetadata {
  __diMetadata?: Metadata
}

function getMetadata(obj: WithMetadata) {
  if (!obj.__diMetadata) {
    obj.__diMetadata = {
      lookupEntries: [],
      provideEntries: [],
    };
  }

  return obj.__diMetadata;
}

interface Injectable extends WithMetadata {
  [key: string]: unknown;
  __diInjected: Promise<unknown>;
}

function isInjectable(o: unknown): o is Injectable {
  return (o as Injectable).__diInjected !== undefined;
}

export function injected(obj: unknown): Promise<unknown> {
  if (!isInjectable(obj)) {
    throw new DIError('object is not injectable');
  }

  return obj.__diInjected;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

type ContainerArg = Record<string, ProviderFn>

export class Container {
  private fns: Record<string, ProviderFn> = {};

  constructor(arg: ContainerArg = {}) {
    for (const name in arg) {
      this.provide(name, arg[name]);
    }
  }

  provide(name: string, fn: ProviderFn): void {
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
        this.provide(entry.to, instance(obj[entry.from]));
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

export function instance(instance: unknown): ProviderFn {
  return () => Promise.resolve(instance);
}

export function singleton(fn: ProviderFn): ProviderFn {
  let cache: Promise<unknown> | unknown;
  return (c) => {
    if (cache === undefined) cache = fn(c);
    return cache;
  };
}
