export interface Todo<T> extends Promise<T> {
  resolve(value: T): void;
}

export function todo<T>(): Todo<T> {
  let resolveFn: (value: T) => void;
  const todo: Todo<T> = new Promise<T>((resolve) => (resolveFn = resolve)) as Todo<T>;
  todo.resolve = (v: T) => resolveFn(v);
  return todo;
}
