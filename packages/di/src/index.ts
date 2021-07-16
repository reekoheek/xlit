interface FactoryFn {
  (): unknown;
}

interface ContainerOptions {
  readonly instances: Record<string, unknown>;
  readonly singletons: Record<string, FactoryFn>;
  readonly factories: Record<string, FactoryFn>;
}

export class Container {
  fns: Record<string, FactoryFn> = {};

  constructor (opts: Partial<ContainerOptions> = {}) {
    this.configure(opts);
  }

  configure (opts: Partial<ContainerOptions>): void {
    for (const name in opts.instances) {
      this.instance(name, opts.instances[name]);
    }
    for (const name in opts.singletons) {
      this.singleton(name, opts.singletons[name]);
    }
    for (const name in opts.factories) {
      this.factory(name, opts.factories[name]);
    }
  }

  factory (name: string, fn: FactoryFn): void {
    this.fns[name] = fn;
  }

  instance (name: string, instance: unknown): void {
    this.factory(name, () => instance);
  }

  singleton (name: string, fn: FactoryFn): void {
    let cache: unknown;
    this.factory(name, () => {
      if (!cache) {
        cache = fn();
      }
      return cache;
    });
  }

  lookup<T> (name: string): T | undefined {
    if (name in this.fns) {
      const fn = this.fns[name];
      return fn() as T;
    }
  }
}

interface LookupDetail {
  name: string;
  instance?: unknown;
}

interface ContainerizedElement {
  diContainer?: Container;
  diLookupListener?(evt: CustomEvent<LookupDetail>): void;
  addEventListener(name: string, listener: { (evt: CustomEvent): void }): void;
  removeEventListener(name: string, listener: { (evt: CustomEvent): void }): void;
}

export function reset (): void {
  uninit(window);
}

export function configure (opts: Partial<ContainerOptions> = {}): Container {
  const el = window as ContainerizedElement;
  if (!el.diContainer) {
    return init(el, opts);
  }
  const container = el.diContainer;
  container.configure(opts);
  return container;
}

export function lookup<T> (target: EventTarget = window, name: string): T {
  const evt = new CustomEvent<LookupDetail>('di-lookup', {
    detail: { name },
    bubbles: true,
    composed: true,
  });
  target.dispatchEvent(evt);
  if (evt.detail.instance) {
    return evt.detail.instance as T;
  }
  throw new Error('lookup no result');
}

function init (el: ContainerizedElement, opts?: Partial<ContainerOptions>): Container {
  if (!el.diContainer) {
    const container = el.diContainer = new Container(opts);
    el.diLookupListener = (evt) => {
      const instance = container.lookup(evt.detail.name);
      if (!instance) {
        return;
      }
      evt.stopImmediatePropagation();
      evt.detail.instance = instance;
    };
    el.addEventListener('di-lookup', el.diLookupListener);
  }
  return el.diContainer;
}

function uninit (el: ContainerizedElement): void {
  if (el.diLookupListener) {
    el.removeEventListener('di-lookup', el.diLookupListener);
  }
  el.diContainer = undefined;
  el.diLookupListener = undefined;
}

type Constructor<T> = {
  new (...args: any[]): T; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface CustomElement extends HTMLElement {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}

interface Provider extends HTMLElement {
  diContainer?: Container;
}

export function provider (opts?: Partial<ContainerOptions>) {
  return function <TBase extends Constructor<CustomElement>> (Base: TBase): TBase & Constructor<Provider> {
    return class extends Base {
      connectedCallback () {
        if (super.connectedCallback) {
          super.connectedCallback();
        }
        init(this, opts);
      }

      disconnectedCallback () {
        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
        uninit(this);
      }
    };
  };
}

interface Injectable {
  readonly from: string;
  readonly to: string;
}

interface InjectableElement {
  injectables?: Injectable[];
  connectedCallback?(): void;
}

export function inject (optName?: string) {
  return function (target: unknown, propName: string): void {
    const fromName = optName || propName;
    const el = target as InjectableElement;
    if (!el.injectables) {
      const injectables = el.injectables = [];
      const defaultCallback = el.connectedCallback;
      el.connectedCallback = function () {
        injectables.forEach(({ from, to }) => {
          this[to] = lookup(this as EventTarget, from);
        });
        if (defaultCallback) {
          defaultCallback.call(this);
        }
      };
    }
    el.injectables.push({
      from: fromName,
      to: propName,
    });
  };
}
