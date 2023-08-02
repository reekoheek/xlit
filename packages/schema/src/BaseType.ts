import { SchemaError } from './SchemaError.js';
import { Type } from './Type.js';

type Filter<T> = (value: T) => Promise<T> | T;

export abstract class BaseType<T> implements Type<T> {
  _outputType!: T;

  private filters: Filter<T>[] = [];

  protected abstract cast(value: unknown): Promise<T> | T;

  protected async runFilters(value: T): Promise<T> {
    for (const filter of this.filters) {
      value = await filter(value);
    }
    return value;
  }

  async resolve(value: unknown): Promise<T> {
    const casted = await this.cast(value);
    const result = await this.runFilters(casted);
    return result;
  }

  filter(filter: Filter<T>): this {
    this.filters.push(filter);
    return this;
  }

  required(message = 'must be required'): RequiredType<this> {
    return new RequiredType(this, message);
  }

  default(defaultValue: T) {
    return this.filter((value) => {
      return value ?? defaultValue;
    });
  }
}

class RequiredType<TBase extends Type<unknown>> extends BaseType<NonNullable<TBase['_outputType']>> {
  constructor(private baseType: TBase, private message = 'must be required') {
    super();
  }

  protected async cast(value: unknown): Promise<NonNullable<TBase['_outputType']>> {
    const result = await this.baseType.resolve(value);
    if (!result) {
      throw new SchemaError(this.message);
    }
    return result;
  }
}
