import { BaseType } from './BaseType.js';
import { SchemaError } from './SchemaError.js';
import { Type } from './Type.js';

type requiredKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];

type fixOptionalType<T extends object, R extends keyof T = requiredKeys<T>> = Pick<Required<T>, R> & Partial<T>;
type identity<T> = T;
type flatten<T> = identity<{ [k in keyof T]: T[k] }>;

export type ObjectShape = {
  [key in string]: Type<unknown>;
};

export class ObjectType<TShape extends ObjectShape> extends BaseType<flatten<fixOptionalType<{
    [key in keyof TShape]: TShape[key]['_outputType'];
  }>> | undefined> {
  constructor(private shape: TShape) {
    super();
  }

  protected async cast(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'object') {
      throw new Error('invalid object');
    }

    const input = value as Record<string, unknown>;
    const output = {} as Record<string, unknown>;
    const resultErr = new SchemaError<TShape>('invalid object');

    await Promise.all(Object.keys(this.shape).map(async(key) => {
      try {
        const schema = this.shape[key as keyof TShape];
        const result = await schema.resolve(input[key]);
        if (typeof result !== 'undefined') {
          output[key] = result;
        }
      } catch (err) {
        resultErr.putChild(key as keyof TShape, err instanceof Error ? err : new Error(`${err}`));
      }
    }));

    if (resultErr.hasChildren()) {
      throw resultErr;
    }

    return output as this['_outputType'];
  }

  pick<K extends keyof TShape>(keys: K[]): ObjectType<Pick<TShape, K>> {
    const pickedShape = keys.reduce((acum, key: K) => {
      const schema = this.shape[key];
      if (schema) {
        acum[key] = schema;
      }
      return acum;
    }, {} as Pick<TShape, K>);
    return new ObjectType(pickedShape);
  }
}
