import { ObjectShape, ObjectType, SchemaError } from '@xlit/schema';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DirectiveResult } from 'lit/directive.js';
import { BindFieldDirective, FieldChangeEventName, bindFieldDirective } from './bindFieldDirective.js';
import { isFormError } from './FormError.js';

type Key<T extends ObjectShape> = keyof T;
type Schema<T extends ObjectShape> = ObjectType<T>;
type Model<T extends ObjectShape> = NonNullable<Schema<T>['_outputType']>;
type State<T extends ObjectShape> = { [k in Key<T>]?: NonNullable<unknown>; };
type Promised<T> = Promise<T> | T;
type OnSubmitFn<T extends ObjectShape> = (model: Model<T>) => Promised<unknown>;

export class Form<TShape extends ObjectShape = ObjectShape> implements ReactiveController {
  private schema: Schema<TShape>;
  private keys: Set<Key<TShape>>;
  private touches = new Set<Key<TShape>>();
  private _state = new Map<Key<TShape>, NonNullable<unknown>>();
  private _errors = new Map<Key<TShape>, string>();
  private _model: Partial<Model<TShape>> = {};
  private _globalError = '';

  get globalError(): string {
    return this._globalError;
  }

  get ok(): boolean {
    if (this.touches.size !== this.keys.size) {
      return false;
    }

    if (this._errors.size !== 0) {
      return false;
    }

    return true;
  }

  get model(): Model<TShape> | undefined {
    return this.ok ? this._model as Model<TShape> : undefined;
  }

  constructor(private host: ReactiveControllerHost, shape: TShape, private onSubmit: OnSubmitFn<TShape>) {
    this.host.addController(this);
    this.schema = new ObjectType(shape);
    this.keys = new Set(Object.keys(shape));
  }

  hostConnected(): void {
    // noop
  }

  state(key: Key<TShape>) {
    return this._state.get(key) ?? null;
  }

  error(key: Key<TShape>): string {
    return this._errors.get(key) ?? '';
  }

  async setStateProperty(key: Key<TShape>, value: unknown): Promise<void> {
    const updating = await this._set(key, value);
    if (updating) {
      this.host.requestUpdate();
    }
  }

  async setState(state: State<TShape>): Promise<void> {
    const updating = await Promise.all([...this.keys].map((key) => this._set(key, state[key])));
    if (updating.includes(true)) {
      this.host.requestUpdate();
    }
  }

  setError(err: unknown) {
    if (!err) {
      throw new Error('cannot set error to nullable');
    }

    this.host.requestUpdate();

    if (!isFormError(err)) {
      this._globalError = err instanceof Error ? err.message : `${err}`;
      console.error('global error raised', this._globalError, err);
      return;
    }

    const children = err.children;
    const reporterErrMap: Record<string, string> = {};
    Object.keys(err.children).forEach((key) => {
      if (this.keys.has(key)) {
        const error = children[key];
        reporterErrMap[key] = error;
        this._errors.set(key, error);
      }
    });
    console.error('form error raised', reporterErrMap, err);
  }

  bindInput(key: Key<TShape>): EventListener {
    return (evt: Event) => {
      const value = (evt.target as HTMLInputElement).value;
      this.setStateProperty(key, value);
    };
  }

  bindSubmit(): EventListener {
    return async(evt) => {
      evt.preventDefault();

      await this.setState(Object.fromEntries(this._state) as State<TShape>);

      const model = this.model;
      if (!model) {
        return;
      }

      try {
        await this.onSubmit(model);
        this._globalError = '';
        this.host.requestUpdate();
      } catch (err) {
        this.setError(err);
      }
    };
  }

  bindField(key: Key<TShape>, eventNames?: FieldChangeEventName[]): DirectiveResult<typeof BindFieldDirective> {
    return bindFieldDirective(this, key, eventNames);
  }

  private async _set(key: Key<TShape>, value: unknown): Promise<boolean> {
    if (!this.keys.has(key)) {
      return false;
    }

    if (value === '' || value === null || value === undefined) {
      value = undefined;
    }

    if (this.touches.has(key) && this._state.get(key) === value) {
      return false;
    }

    this.touches.add(key);
    if (value) {
      this._state.set(key, value);
    } else {
      this._state.delete(key);
    }

    try {
      this._errors.delete(key);
      const schema = this.schema.pick([key]).required();
      const result = await schema.resolve({ [key]: value });
      if (result[key] === undefined) {
        delete this._model[key];
      } else {
        this._model[key] = result[key];
      }
    } catch (err) {
      if (err instanceof SchemaError) {
        const childErr = err.children[key];
        if (childErr) {
          this._errors.set(key, childErr.message);
        }
      } else {
        console.error('unknown error', err);
        this._globalError = err instanceof Error ? err.message : `${err}`;
      }
    }
    return true;
  }
}
