import { ElementPart, ReactiveController, ReactiveControllerHost, noChange } from 'lit';
import { Form } from './Form.js';
import { Directive, DirectiveResult, PartInfo, PartType, directive } from 'lit/directive.js';
import { FormError } from './FormError.js';

interface BindElement extends Element {
  value?: unknown;
  error?: string;
}

class BindDirective extends Directive {
  private changeEventListener?: EventListener;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new FormError('bind directive must be used in element');
    }
  }

  update(part: ElementPart, [form, name]: [Form, string]): unknown {
    const el = part.element as BindElement;

    if (!this.changeEventListener) {
      this.changeEventListener = form.handleInput(name);
      el.addEventListener('input', this.changeEventListener);
      el.addEventListener('change', this.changeEventListener);
    }

    el.value = form.state[name];
    el.error = form.errors[name];
    return this.render();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(...props: unknown[]): unknown {
    // never here override update
    return noChange;
  }
}

const bindDirective = directive(BindDirective);

export class FormController<TModel extends object = Record<string, unknown>>
  extends Form<TModel>
  implements ReactiveController {
  constructor(private host: ReactiveControllerHost, fields: ConstructorParameters<typeof Form<TModel>>[0]) {
    super(fields);
    this.addUpdateHandler(() => this.host.requestUpdate());
    this.host.addController(this);
  }

  hostConnected(): void {
    // noop
  }

  bind(name: string): DirectiveResult<typeof BindDirective> {
    return bindDirective(this, name);
  }
}
