import { BaseType } from './BaseType.js';
import { SchemaError } from './SchemaError.js';

export class NumberType extends BaseType<number | undefined> {
  protected cast(value: unknown): number | undefined {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return numValue;
      }
    }

    throw new SchemaError('invalid number');
  }

  gte(num: number, message?: string) {
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

  gt(num: number, message?: string) {
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

  lte(num: number, message?: string) {
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

  lt(num: number, message?: string) {
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
