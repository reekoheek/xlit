export interface Resolvable<T> extends Promise<T> {
  resolve(value: T): void;
}

export function resolvable<T>(): Resolvable<T> {
  let resolveFn: (value: T) => void;
  const todo: Resolvable<T> = new Promise<T>((resolve) => (resolveFn = resolve)) as Resolvable<T>;
  todo.resolve = (v: T) => resolveFn(v);
  return todo;
}
