import { FormError } from './FormError.js';

type Children<T> = {
  [key in keyof Partial<T>]: Error;
};

export class SchemaError<T> extends FormError {
  readonly children: Children<T> = {} as Children<T>;

  put(key: keyof T, err: Error) {
    this.children[key] = err;
  }

  hasChildren() {
    return Object.keys(this.children).length !== 0;
  }
}
