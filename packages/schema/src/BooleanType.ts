import { BaseType } from './BaseType.js';
import { SchemaError } from './SchemaError.js';

export class BooleanType extends BaseType<boolean | undefined> {
  protected cast(value: unknown) {
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

    throw new SchemaError('invalid boolean');
  }
}