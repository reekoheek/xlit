import { Provider } from './Container.js';

export function instance(instance: unknown): Provider {
  return () => Promise.resolve(instance);
}
