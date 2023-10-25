import { BaseType } from './BaseType.js';

export class BooleanType extends BaseType<boolean | undefined> {
  protected cast(value: unknown) {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return Boolean(value);
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
