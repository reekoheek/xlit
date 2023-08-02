import { Provider } from './Container.js';

export function instance<T>(instance: T): Provider<T> {
  return () => instance;
}
