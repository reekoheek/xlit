import { BaseType } from './BaseType.js';

export class StringType extends BaseType<string | undefined> {
  protected cast(value: unknown) {
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
      return value;
    });
  }

  minLength(minLen: number, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value.length < minLen) {
        throw new Error(message ?? `minimum length must be ${minLen}`);
      }

      return value;
    });
  }

  maxLength(maxLen: number, message?: string) {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value.length > maxLen) {
        throw new Error(message ?? `maximum length must be ${maxLen}`);
      }

      return value;
    });
  }

  match(re: RegExp, message = 'invalid string') {
    return this.filter((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (!value.match(re)) {
        throw new Error(message);
      }

      return value;
    });
  }
}
