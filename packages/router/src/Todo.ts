export interface Todo<T> extends Promise<T> {
  resolve(value: T): void;
}

export function todo<T>(): Todo<T> {
  let resolveFn: (value: T) => void;
  const promise = new Promise<T>((resolve) => (resolveFn = resolve));
  const todo = promise as Todo<T>;
  todo.resolve = (v: T) => resolveFn(v);
  return todo;
}
