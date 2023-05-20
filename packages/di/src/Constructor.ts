// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = new (...args: any[]) => T;

export function isConstructor(obj: unknown): obj is Constructor {
  return typeof obj === 'function';
}
