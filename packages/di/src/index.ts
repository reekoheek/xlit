interface Lookuper {
  lookup<T> (name: string): T | undefined;
}

interface FactoryFn {
  (c: Lookuper): unknown;
}

interface Provider {
  provide (name: string, fn?: FactoryFn): void;
}

type ContainerOptions = Record<string, FactoryFn>

export class Container implements Lookuper, Provider {
  fns: Record<string, FactoryFn> = {};

  constructor (opts?: ContainerOptions) {
    if (!opts) return;
    for (const name in opts) {
      this.provide(name, opts[name]);
    }
  }

  provide (name: string, fn?: FactoryFn): void {
    if (!fn) {
      delete this.fns[name];
    } else {
      this.fns[name] = fn;
    }
  }

  lookup<T> (name: string): T | undefined {
    if (name in this.fns) {
      const fn = this.fns[name];
      return fn(this) as T;
    }
  }
}

export function instance (instance: unknown): FactoryFn {
  return () => instance;
}

export function singleton (fn: FactoryFn): FactoryFn {
  let cache: unknown;
  return (c) => {
    if (cache === undefined) cache = fn(c);
    return cache;
  };
}

interface LookupEventDetail {
  readonly name: string;
  instance?: unknown;
}

interface ProvideEventDetail {
  readonly name: string;
  readonly fn?: FactoryFn;
}

type Constructor<T> = {
  new (...args: any[]): T; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface CustomElement extends HTMLElement {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}

interface Lookup {
  readonly from: string;
  readonly to: string;
}

interface Provide {
  readonly from: string;
  readonly to: string;
}

type AccessorElement = CustomElement & Lookuper & Provider & {
  injectLookup(lookup: Lookup): void;
  injectProvide(provide: Provide): void;
}

function isAccessored (Base: Constructor<CustomElement>): boolean {
  return 'injectLookup' in Base.prototype;
}

export function accessor () {
  return function <TBase extends Constructor<CustomElement>> (Base: TBase): TBase & Constructor<AccessorElement> {
    if (isAccessored(Base)) {
      return (Base as unknown) as (TBase & Constructor<AccessorElement>);
    }
    return class extends Base {
      __diLookups!: Lookup[];
      __diProvides!: Provide[];

      lookup<T> (name: string): T | undefined {
        const evt = new CustomEvent<LookupEventDetail>('di-lookup', {
          detail: { name },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(evt);
        return evt.detail.instance as T;
      }

      provide (name: string, fn?: FactoryFn): void {
        const evt = new CustomEvent<ProvideEventDetail>('di-provide', {
          detail: { name, fn },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(evt);
      }

      injectLookup (lookup: Lookup): void {
        this.__diLookups = this.__diLookups ?? [];
        this.__diLookups.push(lookup);
      }

      injectProvide (provide: Provide): void {
        this.__diProvides = this.__diProvides ?? [];
        this.__diProvides.push(provide);
      }

      connectedCallback () {
        if (super.connectedCallback) super.connectedCallback();
        (this.__diProvides ?? []).forEach(({ from, to }) => {
          const o = (this as unknown) as Record<string, FactoryFn>;
          this.provide(to, typeof o[from] === 'function' ? o[from] : () => o[from]);
        });

        (this.__diLookups ?? []).forEach(({ to, from }) => {
          (this as Record<string, unknown>)[to] = this.lookup(from);
        });
      }

      disconnectedCallback () {
        if (super.disconnectedCallback) super.disconnectedCallback();
        (this.__diProvides ?? []).forEach(({ to }) => {
          this.provide(to, undefined);
        });
      }
    };
  };
}

function isContainerized (Base: Constructor<CustomElement>): boolean {
  return 'getContainer' in Base.prototype;
}

export function container (opts?: ContainerOptions | Container) {
  return function <TBase extends Constructor<CustomElement>> (Base: TBase): TBase & Constructor<AccessorElement> {
    if (isContainerized(Base)) {
      return Base as (TBase & Constructor<AccessorElement>);
    }
    return class extends accessor()(Base) {
      __diContainer = opts instanceof Container ? opts : new Container(opts);

      __diLookupListener: EventListener = (evt) => {
        const detail = (evt as CustomEvent<LookupEventDetail>).detail;
        const instance = this.__diContainer.lookup(detail.name);
        if (instance === undefined) {
          return;
        }
        evt.stopImmediatePropagation();
        detail.instance = instance;
      };

      __diProvideListener: EventListener = (evt) => {
        const { name, fn } = (evt as CustomEvent<ProvideEventDetail>).detail;
        evt.stopImmediatePropagation();
        this.__diContainer.provide(name, fn);
      };

      constructor () {
        super();
        this.addEventListener('di-lookup', this.__diLookupListener);
        this.addEventListener('di-provide', this.__diProvideListener);
      }

      getContainer (): Container {
        return this.__diContainer;
      }
    };
  };
}

function isAccessorElement (object: unknown): object is AccessorElement {
  return 'injectLookup' in (object as Record<string, unknown>);
}

export function lookup (name?: string) {
  return function (target: HTMLElement, propName: string): void {
    if (!isAccessorElement(target)) {
      throw new Error('lookup must be run on accessor element');
    }
    target.injectLookup({ from: name || propName, to: propName });
  };
}

export function provide (name?: string) {
  return function (target: HTMLElement, propName: string): void {
    if (!isAccessorElement(target)) {
      throw new Error('provide must be run on accessor element');
    }
    target.injectProvide({ from: propName, to: name || propName });
  };
}
