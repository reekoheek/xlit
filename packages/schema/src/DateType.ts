import { BaseType } from './BaseType.js';

export class DateType extends BaseType<Date | undefined> {
  protected cast(value: unknown) {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string') {
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return dateValue;
      }
      throw new Error('invalid date');
    }

    if (typeof value === 'number') {
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return dateValue;
      }
      throw new Error('invalid date');
    }

    if (value instanceof Date) {
      return value;
    }

    throw new Error('invalid date');
  }

  gte(dt: Date, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value >= dt) {
        return value;
      }

      throw new Error(message ?? 'must be greater than or equal specified date');
    });
  }

  gt(dt: Date, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value > dt) {
        return value;
      }

      throw new Error(message ?? 'must be greater than specified date');
    });
  }

  lte(dt: Date, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value <= dt) {
        return value;
      }

      throw new Error(message ?? 'must be lower than or equal specified date');
    });
  }

  lt(dt: Date, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value < dt) {
        return value;
      }

      throw new Error(message ?? 'must be lower than specified date');
    });
  }
}
