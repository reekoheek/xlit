import { NestedSchemaError, ObjectShape, ObjectType } from '@xlit/schema';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DirectiveResult } from 'lit/directive.js';
import { BindFieldDirective, FieldChangeEventName, bindFieldDirective } from './bindFieldDirective.js';

type identity<T> = T;
type Key<T extends ObjectShape> = keyof T;
type Schema<T extends ObjectShape> = ObjectType<T>;
type Model<T extends ObjectShape> = NonNullable<Schema<T>['_outputType']>;
type State<T extends ObjectShape> = Partial<Model<T>>;
type Errors<T extends ObjectShape> = identity<{ [key in Key<T>]?: string; }>;
type OnSubmitFn<T extends ObjectShape> = (model: Model<T>) => unknown;

export class Form<TShape extends ObjectShape = ObjectShape> implements ReactiveController {
  private readonly schema: Schema<TShape>;
  private readonly allKeys: Key<TShape>[];
  private readonly touchedKeys = new Set<Key<TShape>>();
  private readonly _state: State<TShape> = {};
  private readonly _errors: Errors<TShape> = {};

  get state(): Readonly<State<TShape>> { return this._state; }
  get errors(): Readonly<Errors<TShape>> { return this._errors; }
  get hasErrors(): boolean { return Object.keys(this.errors).length !== 0; }
  get allTouched(): boolean { return this.touchedKeys.size === this.allKeys.length; }
  get ok(): boolean { return this.allTouched && !this.hasErrors; }
  get model(): Model<TShape> | undefined { return this.ok ? this.state as Model<TShape> : undefined; }

  constructor(private host: ReactiveControllerHost, shape: TShape, private onSubmit: OnSubmitFn<TShape>) {
    this.host.addController(this);
    this.schema = new ObjectType(shape);
    this.allKeys = Object.keys(shape);
  }

  hostConnected(): void {
    // noop
  }

  protected allowedKeys(o: Record<string, unknown>): Key<TShape>[] {
    const oKeys: Key<TShape>[] = Object.keys(o);
    return oKeys.filter((key) => this.allKeys.includes(key));
  }

  async setState(state: State<TShape>): Promise<void> {
    const keys: Key<TShape>[] = this.allowedKeys(state);

    keys.forEach((key) => {
      delete this._errors[key];
      this._state[key] = state[key];
      this.touchedKeys.add(key);
    });

    try {
      const schema = this.schema.pick(keys).required();
      const newState = await schema.resolve(state);
      keys.forEach((key) => {
        delete this._state[key];
        if (newState[key] !== undefined) {
          this._state[key] = newState[key];
        }
      });
    } catch (err) {
      if (!(err instanceof NestedSchemaError)) {
        throw err;
      }

      const childErrs = err.children;
      keys.forEach((key) => {
        const childErr = childErrs[key];
        if (childErr) {
          this._errors[key] = childErr.message;
        }
      });
    }

    this.host.requestUpdate();
  }

  setErrors(errors: Errors<TShape>): void {
    const keys: Key<TShape>[] = this.allowedKeys(errors);

    keys.forEach((key) => {
      this._errors[key] = errors[key];
    });

    this.host.requestUpdate();
  }

  bindInput(key: Key<TShape>): EventListener {
    return async(evt: Event) => {
      const value = (evt.target as HTMLInputElement).value;
      await this.setState({ [key]: value } as State<TShape>);
    };
  }

  bindSubmit(): EventListener {
    return async(evt) => {
      evt.preventDefault();

      const state: typeof this._state = { ...this.state };
      this.allKeys.forEach((key) => {
        if (state[key] === undefined) state[key] = undefined;
      });
      await this.setState(this.state);

      const model = this.model;
      if (model) {
        const result = this.onSubmit(model);
        if (result instanceof Promise) {
          await result;
        }
      }
    };
  }

  bindField(key: Key<TShape>, eventNames?: FieldChangeEventName[]): DirectiveResult<typeof BindFieldDirective> {
    return bindFieldDirective(this, key, eventNames);
  }
}
