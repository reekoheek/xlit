import { BaseType } from './BaseType.js';
import { SchemaError } from './SchemaError.js';

export class BigIntType extends BaseType<bigint | undefined> {
  protected cast(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'bigint' || typeof value === 'string' || typeof value === 'number') {
      return BigInt(value);
    }

    throw new SchemaError('invalid bigint');
  }

  gte(num: bigint, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value >= num) {
        return value;
      }

      throw new SchemaError(message ?? `must be greater than or equal to ${num}`);
    });
  }

  gt(num: bigint, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value > num) {
        return value;
      }

      throw new SchemaError(message ?? `must be greater than ${num}`);
    });
  }

  lte(num: bigint, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value <= num) {
        return value;
      }

      throw new SchemaError(message ?? `must be lower than or equal to ${num}`);
    });
  }

  lt(num: bigint, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value < num) {
        return value;
      }

      throw new SchemaError(message ?? `must be lower than ${num}`);
    });
  }
}
