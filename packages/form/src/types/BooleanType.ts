import { Type, ValidationError, Maybe } from '../index.js';

export class BooleanType extends Type<boolean> {
  cast(value: unknown): Maybe<boolean> {
    if (value === '' || value === null || value === undefined) {
      return;
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

    throw new ValidationError('must be boolean');
  }
}
