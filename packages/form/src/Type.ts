import { ValidationError } from './ValidationError';
import { Maybe } from './Maybe';

type Filter<TValue> = (value: Maybe<TValue>) => Promise<Maybe<TValue>>;

export abstract class Type<TValue> {
  private filters: Filter<TValue>[] = [];

  abstract cast(value: unknown): Maybe<TValue>

  async resolve(value: Maybe<TValue>): Promise<Maybe<TValue>> {
    for (const filter of this.filters) {
      value = await filter(value);
    }
    return value;
  }

  filter(filter: Filter<TValue>) {
    this.filters.push(filter);
    return this;
  }

  required(message = 'must be required') {
    return this.filter((value) => {
      if (!value) {
        throw new ValidationError(message);
      }
      return Promise.resolve(value);
    });
  }

  default(defaultValue: TValue) {
    return this.filter((value) => {
      return Promise.resolve(value ?? defaultValue);
    });
  }
}
