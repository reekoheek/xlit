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

export class Form<TShape extends ObjectShape> implements ReactiveController {
  private schema: Schema<TShape>;
  private _state: State<TShape> = {};
  private _errors: Errors<TShape> = {};
  private touches = new Set<Key<TShape>>();

  get state(): Readonly<State<TShape>> {
    return this._state;
  }

  get errors(): Readonly<Errors<TShape>> {
    return this._errors;
  }

  get hasErrors(): boolean {
    return Object.keys(this.errors).length !== 0;
  }

  get allTouched(): boolean {
    return this.touches.size === Object.keys(this.shape).length;
  }

  get ok(): boolean {
    return this.allTouched && !this.hasErrors;
  }

  get model(): Model<TShape> | undefined {
    if (!this.ok) {
      return undefined;
    }

    return this.state as Model<TShape>;
  }

  constructor(private host: ReactiveControllerHost, private shape: TShape, private onSubmit: OnSubmitFn<TShape>) {
    this.host.addController(this);
    this.schema = new ObjectType(shape);
  }

  hostConnected(): void {
    // noop
  }

  async setState(state: State<TShape>): Promise<void> {
    const partialKeys: Key<TShape>[] = Object.keys(state);

    partialKeys.forEach((key) => {
      delete this._errors[key];
      this.touches.add(key);
    });

    try {
      const schema = this.schema.pick(partialKeys).required();
      const newState = await schema.resolve(state);
      partialKeys.forEach((key) => {
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
      partialKeys.forEach((key) => {
        const childErr = childErrs[key];
        if (childErr) {
          this._errors[key] = childErr.message;
        }
      });
    }

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

      await this.setState(this.state);

      const model = this.model;
      if (model) {
        await this.onSubmit(model);
      }
    };
  }

  bindField(key: Key<TShape>, eventNames?: FieldChangeEventName[]): DirectiveResult<typeof BindFieldDirective> {
    return bindFieldDirective(this, key, eventNames);
  }
}
