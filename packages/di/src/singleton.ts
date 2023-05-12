import { Provider } from './Container';

export function singleton(fn: Provider): Provider {
  let cache: Promise<unknown> | unknown;
  return (c) => {
    if (cache === undefined) cache = fn(c);
    return cache;
  };
}
