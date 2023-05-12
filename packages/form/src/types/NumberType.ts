import { Type, ValidationError, Maybe } from '../';

export class NumberType extends Type<number> {
  cast(value: unknown): Maybe<number> {
    if (value === '' || value === null || value === undefined) {
      return;
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

    throw new ValidationError('must be number');
  }

  min(min: number, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return Promise.resolve(value);
      }

      if (value < min) {
        throw new ValidationError(message ?? `minimum value must be ${min}`);
      }

      return Promise.resolve(value);
    });
  }

  max(max: number, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return Promise.resolve(value);
      }

      if (value > max) {
        throw new ValidationError(message ?? `maximum value must be ${max}`);
      }

      return Promise.resolve(value);
    });
  }
}
