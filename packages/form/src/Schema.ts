import { Maybe } from './Maybe.js';
import { SchemaError } from './SchemaError.js';
import { Field } from './Field.js';

type Fields<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in keyof T]: Field<any>;
};

type Keys<T> = (keyof T)[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Schema<TValue extends object> {
  private keys: Keys<TValue>;

  constructor(protected fields: Fields<TValue>) {
    this.keys = Object.keys(fields) as Keys<TValue>;
  }

  cast(value: unknown): Maybe<TValue> {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'object') {
      throw new Error('invalid object');
    }

    const objectValue = value as TValue;
    const result = {} as TValue;

    this.keys.forEach((key) => {
      if (key in objectValue === false) {
        return;
      }
      result[key] = this.fields[key].cast(objectValue[key]);
    });

    return result;
  }

  async runFilters(value: Maybe<TValue>, partial = false): Promise<Maybe<TValue>> {
    if (value === undefined) {
      return Promise.resolve(undefined);
    }

    const result = {} as TValue;
    const foundErr = new SchemaError<TValue>('invalid object violates schema');

    await Promise.all(this.keys.map(async(key) => {
      if (partial && (key in value === false)) {
        return;
      }

      try {
        const resolved = await this.fields[key].runFilters(value[key]);
        if (resolved !== undefined) {
          result[key] = resolved;
        }
      } catch (err) {
        foundErr.put(key, err instanceof Error ? err : new Error(`${err}`));
      }
    }));

    if (foundErr.hasChildren()) {
      throw foundErr;
    }

    return result;
  }

  resolve(state: Partial<TValue>): Promise<Maybe<TValue>> {
    return this.runFilters(this.cast(state));
  }
}
