import { Container } from './Container.js';

interface LookupOptions {
  key?: string;
  container?: Container;
}

export function lookup<T>({ container = Container.instance(), key }: LookupOptions = {}) {
  return (target: object, propertyKey: string) => {
    const keyToLookup = key ?? propertyKey;

    Object.defineProperty(target, propertyKey, {
      get() {
        return container.lookup<T>(keyToLookup);
      },
    });
  };
}
