import { BaseType } from './BaseType.js';
import { SchemaError } from './SchemaError.js';
import { Type } from './Type.js';

export class ArrayType<T> extends BaseType<T[] | undefined> {
  constructor(private itemType: Type<unknown>) {
    super();
  }

  protected async cast(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (!(value instanceof Array)) {
      throw new Error('invalid array');
    }

    const resultErr = new SchemaError('invalid array');

    const result = await Promise.all(value.map(async(item, index) => {
      try {
        const resolved = await this.itemType.resolve(item);
        return resolved;
      } catch (err) {
        resultErr.putChild(index + '', err instanceof Error ? err : new Error(`${err}`));
      }
    }));

    if (resultErr.hasChildren()) {
      throw resultErr;
    }

    return result as T[];
  }
}
