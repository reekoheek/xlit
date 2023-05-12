import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Type } from './Type.js';
import { ValidationError } from './ValidationError.js';

interface Types {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: Type<any>;
}

interface KV {
  [key: string]: unknown;
}

type Errors = Record<string, string>;

type SubmitHandler<TModel> = (model: TModel) => unknown;

export class Form<TModel = KV> implements ReactiveController {
  model: TModel = {} as TModel;
  errors: Errors = {};

  get invalid() {
    return Object.keys(this.errors).length !== 0;
  }

  constructor(private types: Types, private host?: ReactiveControllerHost) {
    this.host?.addController(this);
  }

  hostConnected(): void {
    // noop
  }

  hostDisconnected(): void {
    // noop
  }

  async set(key: string, value: unknown): Promise<void> {
    const model = this.model as KV;
    const type = this.types[key];
    try {
      delete this.errors[key];
      value = type.cast(value);
      value = await type.resolve(value);
    } catch (err) {
      this.errors[key] = (err as Error).message;
    } finally {
      if (value === undefined) {
        delete model[key];
      } else {
        model[key] = value;
      }
    }
  }

  handleInput(key: string): EventListener {
    return async(evt) => {
      try {
        const value = (evt.target as HTMLInputElement).value;
        await this.set(key, value);
      } finally {
        this.host?.requestUpdate();
      }
    };
  }

  handleSubmit(fn: SubmitHandler<TModel>): EventListener {
    return async(evt) => {
      try {
        evt.preventDefault();
        await this.assert();
        fn(this.model);
      } catch (err) {
        this.host?.requestUpdate();
      }
    };
  }

  async assert(): Promise<void> {
    const model = this.model as KV;
    await Promise.all(Object.keys(this.types).map(async(key) => {
      await this.set(key, model[key]);
    }));

    if (this.invalid) {
      throw new ValidationError('invalid form');
    }
  }
}
