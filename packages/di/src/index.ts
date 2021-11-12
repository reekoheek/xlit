export interface ILookupContainer {
  lookup<T> (name: string): T | undefined;
}

interface FactoryFn {
  (c: ILookupContainer): unknown;
}

interface ContainerOptions {
  readonly instances: Record<string, unknown>;
  readonly singletons: Record<string, FactoryFn>;
  readonly factories: Record<string, FactoryFn>;
}

export class Container implements ILookupContainer {
  fns: Record<string, FactoryFn> = {};

  constructor (opts: Partial<ContainerOptions> = {}) {
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
      if (cache === undefined) cache = fn(this);
      return cache;
    });
  }

  lookup<T> (name: string): T | undefined {
    if (name in this.fns) {
      const fn = this.fns[name];
      return fn(this) as T;
    }
  }
}

interface LookupEventDetail {
  readonly name: string;
  instance?: unknown;
}

export function lookup<T> (target: EventTarget, name: string): T | undefined {
  const evt = new CustomEvent<LookupEventDetail>('di-lookup', {
    detail: { name },
    bubbles: true,
    composed: true,
  });
  target.dispatchEvent(evt);
  if (evt.detail.instance) {
    return evt.detail.instance as T;
  }
}

type ProvideType = 'singleton' | 'instance' | 'factory';

interface ProvideEventDetail {
  readonly name: string;
  readonly type: ProvideType;
  readonly value: unknown;
}

export function provide (target: EventTarget, detail: ProvideEventDetail): void {
  const evt = new CustomEvent<ProvideEventDetail>('di-provide', {
    detail,
    bubbles: true,
    composed: true,
  });
  target.dispatchEvent(evt);
}

interface ContainerElement {
  addEventListener(name: string, listener: { (evt: CustomEvent): void }): void;
  removeEventListener(name: string, listener: { (evt: CustomEvent): void }): void;
  __diContainer?: Container;
  __diLookupListener?(evt: CustomEvent<LookupEventDetail>): void;
  __diProvideListener?(evt: CustomEvent<ProvideEventDetail>): void;
}

export function attach (el: ContainerElement, opts?: Partial<ContainerOptions>): void {
  if ('__diContainer' in el) {
    return;
  }

  const container = new Container(opts);

  el.__diLookupListener = (evt) => {
    const instance = container.lookup(evt.detail.name);
    if (instance === undefined) {
      return;
    }
    evt.stopImmediatePropagation();
    evt.detail.instance = instance;
  };
  el.addEventListener('di-lookup', el.__diLookupListener);

  el.__diProvideListener = (evt) => {
    evt.stopImmediatePropagation();
    container[evt.detail.type](evt.detail.name, evt.detail.value as FactoryFn);
  };
  el.addEventListener('di-provide', el.__diProvideListener);

  el.__diContainer = container;
}

export function detach (el: ContainerElement): void {
  if (el.__diLookupListener) el.removeEventListener('di-lookup', el.__diLookupListener);
  if (el.__diProvideListener) el.removeEventListener('di-provide', el.__diProvideListener);
  delete el.__diContainer;
  delete el.__diLookupListener;
  delete el.__diProvideListener;
}

type Constructor<T> = {
  new (...args: any[]): T; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface CustomElement extends HTMLElement {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}

export function container (opts?: Partial<ContainerOptions>) {
  return function <TBase extends Constructor<CustomElement>> (Base: TBase): TBase & Constructor<CustomElement> {
    return class extends Base {
      connectedCallback () {
        if (super.connectedCallback) super.connectedCallback();
        attach(this, opts);
      }

      // disconnectedCallback () {
      //   if (super.disconnectedCallback) super.disconnectedCallback();
      //   detach(this);
      // }
    };
  };
}

interface Inject {
  readonly from: string;
  readonly to: string;
}

interface Injectable {
  readonly type: ProvideType;
  readonly from: string;
  readonly to: string;
}

interface ConsumerElement extends CustomElement {
  __diInjects: Inject[];
  __diInjectables: Injectable[];
}

type Receiver = Record<string, unknown>;

function attachConsumer (el: Partial<ConsumerElement>): ConsumerElement {
  if ('__diInjects' in el) {
    return el as ConsumerElement;
  }

  el.__diInjects = [];
  el.__diInjectables = [];

  const consumer = el as ConsumerElement;

  const defaultCallback = consumer.connectedCallback;
  consumer.connectedCallback = function () {
    if (defaultCallback) defaultCallback.call(this);

    this.__diInjectables.forEach(({ type, to, from }) => {
      const receiver = (<unknown> this) as Receiver;
      provide(this, { type, name: to, value: receiver[from] });
    });

    this.__diInjects.forEach(({ to, from }) => {
      const receiver = (<unknown> this) as Receiver;
      receiver[to] = lookup(this, from);
    });
  };

  return consumer;
}

export function inject (name?: string) {
  return function (target: Partial<ConsumerElement>, propName: string): void {
    const el = attachConsumer(target);
    el.__diInjects.push({
      from: name || propName,
      to: propName,
    });
  };
}

interface InjectableOptions {
  readonly type: ProvideType;
  readonly name: string;
}

export function injectable (opts?: Partial<InjectableOptions>) {
  return function (target: Partial<ConsumerElement>, propName: string): void {
    const el = attachConsumer(target);
    el.__diInjectables.push({
      type: opts?.type ?? 'instance',
      from: propName,
      to: opts?.name || propName,
    });
  };
}
