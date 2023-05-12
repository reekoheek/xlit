import { Type, ValidationError, Maybe } from '../index.js';

type Validate = (value: unknown) => boolean;
type ObjectLike = Record<string, unknown>;

export class ObjectType<TValue = ObjectLike> extends Type<TValue> {
  constructor(private validate: Validate = (value) => (typeof value === 'object')) {
    super();
  }

  cast(value: unknown): Maybe<TValue> {
    if (value === '' || value === null || value === undefined) {
      return;
    }

    if (this.validate(value)) {
      return value as TValue;
    }

    throw new ValidationError('invalid object');
  }
}
