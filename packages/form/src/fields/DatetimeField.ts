import { Field, Maybe } from '../index.js';

export class DatetimeField extends Field<Date> {
  cast(value: unknown): Maybe<Date> {
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

  min(min: Date, message = 'minimum value exceeded') {
    return this.filter((value) => {
      if (value === undefined) {
        return Promise.resolve(value);
      }

      if (value < min) {
        throw new Error(message);
      }

      return Promise.resolve(value);
    });
  }

  max(max: Date, message = 'maximum value exceeded') {
    return this.filter((value) => {
      if (value === undefined) {
        return Promise.resolve(value);
      }

      if (value > max) {
        throw new Error(message);
      }

      return Promise.resolve(value);
    });
  }
}
