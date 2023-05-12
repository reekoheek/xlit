import { Type, ValidationError, Maybe } from '../';

export class StringType extends Type<string> {
  cast(value: unknown): Maybe<string> {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value !== 'string') {
      throw new ValidationError('must be string');
    }

    const casted = value.trim();
    if (casted !== '') {
      return casted;
    }
  }

  minLength(minLen: number, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return Promise.resolve(value);
      }

      if (value.length < minLen) {
        throw new ValidationError(message ?? `minimum length must be ${minLen}`);
      }

      return Promise.resolve(value);
    });
  }

  maxLength(maxLen: number, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return Promise.resolve(value);
      }

      if (value.length > maxLen) {
        throw new ValidationError(message ?? `maximum length must be ${maxLen}`);
      }

      return Promise.resolve(value);
    });
  }
}
