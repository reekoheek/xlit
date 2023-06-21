import { Field, Maybe } from '../index.js';

export class StringField extends Field<string> {
  cast(value: unknown): Maybe<string> {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new Error('invalid string');
    }

    if (value === '') {
      return undefined;
    }

    return value;
  }

  trim() {
    return this.filter((value) => {
      value = value?.trim();
      if (value === '') {
        value = undefined;
      }
      return Promise.resolve(value);
    });
  }

  minLength(minLen: number, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return Promise.resolve(value);
      }

      if (value.length < minLen) {
        throw new Error(message ?? `minimum length must be ${minLen}`);
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
        throw new Error(message ?? `maximum length must be ${maxLen}`);
      }

      return Promise.resolve(value);
    });
  }

  match(re: RegExp, message = 'invalid string') {
    return this.filter((value) => {
      if (value === undefined) {
        return Promise.resolve(undefined);
      }

      if (!value.match(re)) {
        throw new Error(message);
      }

      return Promise.resolve(value);
    });
  }
}
