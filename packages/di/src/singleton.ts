import { Provider } from './Container.js';

export function singleton<T>(fn: Provider<T>): Provider<T> {
  let cache: T;
  return () => {
    if (cache === undefined) cache = fn();
    return cache;
  };
}
