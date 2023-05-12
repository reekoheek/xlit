import { Provider } from './Container';

export function instance(instance: unknown): Provider {
  return () => Promise.resolve(instance);
}
