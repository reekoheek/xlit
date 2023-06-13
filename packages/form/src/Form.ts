import { Type } from './Type.js';
import { ValidationError } from './ValidationError.js';

interface KeyValue {
  [key: string]: unknown;
}

type Types<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in keyof Required<T>]: Type<any>;
};

type Errors<T> = {
  [key in keyof Partial<T>]: string;
};

type State<T> = Partial<T>;

type SubmitHandler<TModel> = (model: TModel) => unknown;
type UpdateHandler = () => unknown;

export class Form<TModel = KeyValue> {
  private _state: State<TModel> = {} as State<TModel>;
  private _errors: Errors<TModel> = {} as Errors<TModel>;
  private updateHandlers: UpdateHandler[] = [];

  get state() {
    return this._state as Readonly<State<TModel>>;
  }

  get errors() {
    return this._errors as Readonly<Errors<TModel>>;
  }

  get invalid() {
    return Object.keys(this._errors).length !== 0;
  }

  constructor(private types: Types<TModel>, updateHandler?: UpdateHandler) {
    if (updateHandler) {
      this.addUpdateHandler(updateHandler);
    }
  }

  addUpdateHandler(updateHandler: UpdateHandler) {
    this.updateHandlers.push(updateHandler);
    return this;
  }

  removeUpdateHandler(updateHandler: UpdateHandler) {
    const index = this.updateHandlers.indexOf(updateHandler);
    if (index !== -1) {
      this.updateHandlers.splice(index, 1);
    }
  }

  async set(key: keyof Types<TModel>, value: unknown): Promise<void> {
    const state = this._state;
    const type = this.types[key];

    try {
      delete this._errors[key];
      value = type.cast(value);
      value = await type.resolve(value);
    } catch (err) {
      this._errors[key] = (err as Error).message;
    } finally {
      state[key] = value as TModel[typeof key];
      if (value === undefined || value === null) {
        delete state[key];
      }
    }
  }

  handleInput(key: keyof Types<TModel>) {
    return async(evt: Event) => {
      try {
        const value = (evt.target as HTMLInputElement).value;
        await this.set(key, value);
      } finally {
        this.update();
      }
    };
  }

  handleSubmit(fn: SubmitHandler<TModel>) {
    return async(evt: Event) => {
      try {
        evt.preventDefault();
        await this.assert();
        fn(this._state as TModel);
      } catch (err) {
        this.update();
      }
    };
  }

  async assert(): Promise<void> {
    const state = this._state as KeyValue;
    await Promise.all(Object.keys(this.types).map(async(key) => {
      await this.set(key as keyof TModel, state[key]);
    }));

    if (this.invalid) {
      throw new ValidationError('invalid form');
    }
  }

  protected update() {
    this.updateHandlers.forEach((update) => update());
  }
}
