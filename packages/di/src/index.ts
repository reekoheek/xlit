interface Lookuper {
  lookup<T> (name: string): T | undefined;
}

interface FactoryFn {
  (c: Lookuper): unknown;
}

const NILFN: FactoryFn = () => undefined;

type ContainerOptions = Record<string, FactoryFn>

export class Container implements Lookuper {
  fns: Record<string, FactoryFn> = {};

  constructor (opts?: ContainerOptions) {
    if (!opts) return;
    for (const name in opts) {
      this.provide(name, opts[name]);
    }
  }

  provide (name: string, fn: FactoryFn): void {
    if (fn === NILFN) {
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
  readonly fn: FactoryFn;
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

export interface WithInjected {
  injected: Promise<void>;
}

interface InjectedElement extends CustomElement {
  __diLookups: Lookup[];
  __diProvides: Provide[];
  __diResolveInject(): void;
  injected: Promise<void>;
}

export function container (opts?: ContainerOptions | Container) {
  return function <TBase extends Constructor<CustomElement>> (Base: TBase): TBase & Constructor<WithInjected> {
    return class extends Base {
      __diContainer = opts instanceof Container ? opts : new Container(opts);
      injected!: Promise<void>;

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

      connectedCallback () {
        if (super.connectedCallback) super.connectedCallback();
        this.addEventListener('di-lookup', this.__diLookupListener);
        this.addEventListener('di-provide', this.__diProvideListener);
      }

      disconnectedCallback () {
        if (super.disconnectedCallback) super.disconnectedCallback();
        this.removeEventListener('di-lookup', this.__diLookupListener);
        this.removeEventListener('di-provide', this.__diProvideListener);
      }
    };
  };
}

function isInjectedElement (object: unknown): object is InjectedElement {
  return '__diLookups' in (object as Record<string, unknown>);
}

function resolveFn (o: unknown, k: string): FactoryFn {
  const bag = o as Record<string, FactoryFn>;
  return typeof bag[k] === 'function' ? bag[k] : () => bag[k];
}

function setProp (o: unknown, k: string, v: unknown): void {
  const bag = o as Record<string, unknown>;
  bag[k] = v;
}

function toInjectedElement (object: unknown): InjectedElement {
  if (isInjectedElement(object)) {
    return object;
  }

  const el = object as InjectedElement;

  el.__diLookups = [];
  el.__diProvides = [];
  el.injected = new Promise(resolve => (el.__diResolveInject = resolve));

  const origConnectedCb = el.connectedCallback;
  el.connectedCallback = function () {
    if (origConnectedCb) origConnectedCb.call(this);

    this.__diProvides.forEach(({ from, to }) => {
      const evt = new CustomEvent<ProvideEventDetail>('di-provide', {
        detail: { name: to, fn: resolveFn(this, from) },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(evt);
    });

    this.__diLookups.forEach(({ to, from }) => {
      const evt = new CustomEvent<LookupEventDetail>('di-lookup', {
        detail: { name: from },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(evt);
      setProp(this, to, evt.detail.instance);
    });
    this.__diResolveInject();
  };

  const origDisconnectedCb = el.disconnectedCallback;
  el.disconnectedCallback = function () {
    if (origDisconnectedCb) origDisconnectedCb.call(this);

    this.__diProvides.forEach(({ to }) => {
      const evt = new CustomEvent<ProvideEventDetail>('di-provide', {
        detail: { name: to, fn: NILFN },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(evt);
    });

    el.injected = new Promise(resolve => (el.__diResolveInject = resolve));
  };

  return el;
}

export function lookup (name?: string) {
  return function (target: HTMLElement, propName: string): void {
    const el = toInjectedElement(target);
    el.__diLookups.push({
      from: name || propName,
      to: propName,
    });
  };
}

export function provide (name?: string) {
  return function (target: HTMLElement, propName: string): void {
    const el = toInjectedElement(target);
    el.__diProvides.push({
      from: propName,
      to: name || propName,
    });
  };
}
