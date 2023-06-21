import { Field } from './Field.js';
import { Schema } from './Schema.js';
import { SchemaError } from './SchemaError.js';

const UPDATE_DEBOUNCE_TIMEOUT = 300;

type Fields<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in keyof T]: Field<any>;
};

type Errors<T> = {
  [key in keyof T]?: string;
};

type State<T> = Partial<T>;

type Keys<T> = (keyof T)[];

type SubmitHandler<TModel> = (model: TModel) => unknown;
type UpdateHandler = () => unknown;

export class Form<TModel extends object = Record<string, unknown>> {
  private _state: State<TModel> = {} as State<TModel>;
  private _errors: Errors<TModel> = {} as Errors<TModel>;
  private updateHandlers: UpdateHandler[] = [];
  private schema: Schema<TModel>;
  private _updateDebounceT?: number;

  get state(): Readonly<State<TModel>> {
    return this._state;
  }

  get errors(): Readonly<Errors<TModel>> {
    return this._errors;
  }

  get valid(): boolean {
    return Object.keys(this._errors).length === 0;
  }

  constructor(fields: Fields<TModel>) {
    this.schema = new Schema(fields);
  }

  addUpdateHandler(updateHandler: UpdateHandler): this {
    this.updateHandlers.push(updateHandler);
    return this;
  }

  removeUpdateHandler(updateHandler: UpdateHandler): this {
    const index = this.updateHandlers.indexOf(updateHandler);
    if (index !== -1) {
      this.updateHandlers.splice(index, 1);
    }
    return this;
  }

  async setState(state: State<TModel>): Promise<void> {
    let resultState: State<TModel> = {};

    const keys = Object.keys(state) as Keys<TModel>;

    let resultErr: SchemaError<TModel> | undefined;

    try {
      resultState = this.schema.cast(state) ?? {};
      resultState = await this.schema.runFilters(resultState as TModel, true) ?? {};
    } catch (err) {
      if (!(err instanceof SchemaError)) {
        throw err;
      }
      resultErr = err;
    }

    for (const key of keys) {
      if (resultErr?.children[key] === undefined) delete this._errors[key];
      else this._errors[key] = resultErr.children[key].message;
      if (resultState[key] === undefined) delete this._state[key];
      else this._state[key] = resultState[key];
    }
    this.update();
  }

  handleInput(key: keyof Fields<TModel>) {
    return async(evt: Event) => {
      const value = (evt.target as HTMLInputElement).value;
      await this.setState({ [key]: value } as State<TModel>);
    };
  }

  handleSubmit(fn: SubmitHandler<TModel>) {
    return async(evt: Event) => {
      try {
        evt.preventDefault();
        await this.validate();
        fn(this._state as TModel);
      } catch (err) {
        this.update();
      }
    };
  }

  async validate(): Promise<void> {
    await this.schema.resolve(this._state);
  }

  protected update() {
    clearTimeout(this._updateDebounceT);
    this._updateDebounceT = setTimeout(() => {
      this.updateHandlers.forEach((update) => update());
    }, UPDATE_DEBOUNCE_TIMEOUT);
  }
}
