import { SchemaError } from './SchemaError.js';
import { Maybe } from './Maybe.js';
import { FormError } from './FormError.js';

type Filter<TValue> = (value: Maybe<TValue>) => Promise<Maybe<TValue>>;

export abstract class Field<TValue> {
  private filters: Filter<TValue>[] = [];
  private attributes: Record<string, NonNullable<unknown>> = {};

  abstract cast(value: unknown): Maybe<TValue>;

  async runFilters(value: Maybe<TValue>): Promise<Maybe<TValue>> {
    for (const filter of this.filters) {
      value = await filter(value);
    }
    return value;
  }

  filter(filter: Filter<TValue>): this {
    this.filters.push(filter);
    return this;
  }

  required(message = 'must be required') {
    return this.filter((value) => {
      if (!value) {
        throw new SchemaError(message);
      }
      return Promise.resolve(value);
    });
  }

  default(defaultValue: TValue) {
    return this.filter((value) => {
      return Promise.resolve(value ?? defaultValue);
    });
  }

  set(key: string, value: NonNullable<unknown>): this {
    this.attributes[key] = value;
    return this;
  }

  unset(key: string): this {
    delete this.attributes[key];
    return this;
  }

  get<T>(key: string): T {
    if (this.attributes[key] === undefined) {
      throw new FormError('attribute not found');
    }
    return this.attributes[key] as T;
  }
}
