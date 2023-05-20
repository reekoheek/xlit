import { ElementPart, ReactiveController, ReactiveControllerHost, noChange } from 'lit';
import { Form } from './Form.js';
import { Directive, DirectiveResult, PartInfo, PartType, directive } from 'lit/directive.js';
import { FormError } from './FormError.js';

interface FieldElement extends Element {
  value?: unknown;
  error?: string;
}

class FieldDirective extends Directive {
  private changeEventListener?: EventListener;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new FormError('field directive must be used in element');
    }
  }

  update(part: ElementPart, [form, name]: [Form, string]): unknown {
    const el = part.element as FieldElement;

    if (!this.changeEventListener) {
      this.changeEventListener = form.handleInput(name);
      el.addEventListener('input', this.changeEventListener);
      el.addEventListener('change', this.changeEventListener);
    }

    el.value = form.state[name];
    el.error = form.errors[name];
    return noChange;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(...props: unknown[]): unknown {
    // never here override update
    return noChange;
  }
}

const fieldDirective = directive(FieldDirective);

export class FormController<TModel> extends Form<TModel> implements ReactiveController {
  constructor(private host: ReactiveControllerHost, types: ConstructorParameters<typeof Form<TModel>>[0]) {
    super(types, () => this.host.requestUpdate());
    this.host.addController(this);
  }

  hostConnected(): void {
    // noop
  }

  field(name: string): DirectiveResult<typeof FieldDirective> {
    return fieldDirective(this, name);
  }
}
