import { Field, Maybe } from '../index.js';

export class BooleanField extends Field<boolean> {
  cast(value: unknown): Maybe<boolean> {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    throw new Error('invalid boolean');
  }
}
