import { BaseType } from './BaseType.js';

type Factory<T> = (value: unknown) => Promise<T> | T;

export class UnknownType<T = unknown> extends BaseType<T | undefined> {
  constructor(private factory?: Factory<T>) {
    super();
  }

  protected cast(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (!this.factory) {
      return value as T;
    }

    return this.factory(value);
  }
}
