import { Provider } from './Container.js';

export function singleton(fn: Provider): Provider {
  let cache: Promise<NonNullable<unknown>> | NonNullable<unknown>;
  return (c) => {
    if (cache === undefined) cache = fn(c);
    return cache;
  };
}
