import { Field, Maybe, Schema } from '../index.js';

type Fields<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in keyof Required<T>]: Field<any>;
};

export class ObjectField<TValue extends object> extends Field<TValue> {
  private schema?: Schema<TValue>;

  constructor(fields?: Fields<TValue>) {
    super();

    if (fields) {
      this.schema = new Schema(fields);

      this.filter(async(value) => {
        value = await this.schema?.runFilters(value);
        return value;
      });
    }
  }

  cast(value: unknown): Maybe<TValue> {
    if (this.schema) {
      return this.schema.cast(value);
    }

    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'object') {
      throw new Error('invalid object');
    }

    return value as TValue;
  }
}
