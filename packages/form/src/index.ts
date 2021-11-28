import type { ReactiveController, ReactiveControllerHost } from '@lit/reactive-element';

type Model = Record<string, unknown>;

interface Rule {
  (value: unknown, name?: string, model?: Model): Promise<unknown> | unknown;
}

export type Rules = Record<string, Rule>;

interface ValidationError extends Error {
  message: string;
  field: string;
  kind: string;
}

export type Errors = Record<string, ValidationError>;

interface WithValue {
  value?: unknown;
}

export class Form implements ReactiveController {
  private host!: ReactiveControllerHost;
  private rules!: Record<string, Rules>;
  model: Model = {};
  errors: Record<string, Errors> = {};

  constructor (host: ReactiveControllerHost, rules: Record<string, Rules>) {
    this.host = host;
    this.rules = rules;

    host.addController(this);
  }

  hostConnected (): void {
    // noop
  }

  hostDisconnected (): void {
    // noop
  }

  value<TValue> (name: string, defaultValue?: TValue): TValue | undefined {
    return (this.model[name] as TValue) || defaultValue;
  }

  input (name: string): EventListener {
    return (evt) => {
      const target = evt.target as WithValue;
      this.set({ [name]: target.value });
    };
  }

  error (name: string): ValidationError[] {
    return Object.values(this.errors[name] || {});
  }

  reset (model?: Model): void {
    this.model = { ...model };
    this.errors = {};
    this.host.requestUpdate();
  }

  async set (model: Model): Promise<void> {
    const names = Object.keys(model);

    if (!names.length) {
      return;
    }

    await this.validate(names, model);
  }

  async validate (names?: string[], model: Model = this.model): Promise<void> {
    if (!names || names.length === 0) {
      names = Object.keys(this.rules);
    }
    await Promise.all(names.map(async name => {
      const rules = this.rules[name];
      try {
        this.model[name] = await validate(rules, model, name);
        this.errors[name] = {};
      } catch (err) {
        const e = err as ValidationError;
        this.errors[name] = {
          [e.kind]: e,
        };
      }
    }));

    this.host.requestUpdate();
  }

  assert (): void {
    for (const k in this.errors) {
      const errs = this.error(k);
      if (errs.length > 0) {
        throw new FormError('invalid form', this);
      }
    }
  }

  get<TModel> (): TModel {
    this.assert();
    return this.model as TModel;
  }
}

class FormError extends Error {
  constructor (message: string, public form: Form) {
    super(message);
  }
}

export async function validate (rules: Rules, model: Model, name: string): Promise<unknown> {
  let v = model[name];
  for (const k in rules) {
    try {
      const fn = rules[k];
      const result = fn(v, name, model);
      v = (result instanceof Promise) ? await result : result;
    } catch (err) {
      const e = err as ValidationError;
      e.field = name;
      e.kind = k;
      throw e;
    }
  }
  return v;
}
