import { Container } from './Container.js';
import { singleton } from './singleton.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

type Scope = 'singleton' | 'transient';

interface ProvideOptions {
  key?: string;
  scope?: Scope;
  container?: Container;
}

export function provide<T>({ container = Container.instance(), scope = 'singleton', key }: ProvideOptions = {}) {
  return (TargetObject: Constructor<T>) => {
    key = key ?? toKey(TargetObject.name);

    const fn = () => new TargetObject();
    container.provide(key, scope === 'singleton' ? singleton(fn) : fn);
  };
}

function toKey(s: string) {
  return s[0].toLowerCase() + s.slice(1);
}
