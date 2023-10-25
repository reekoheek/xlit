import { Directive, ElementPart, PartInfo, PartType, directive } from 'lit/directive.js';
import { Form } from './Form.js';
import { noChange } from 'lit';
import { ObjectShape } from '@xlit/schema';

interface FieldElement extends Element {
  value?: unknown;
  error?: string;
}

export type FieldChangeEventName = 'change' | 'input' | 'blur';

export class BindFieldDirective extends Directive {
  private changeEventListener?: EventListener;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('bind directive must be used in element');
    }
  }

  update(part: ElementPart, [form, name, eventNames]: [Form<ObjectShape>, string, FieldChangeEventName[]]): unknown {
    eventNames = eventNames ?? ['input', 'change', 'blur'];

    const el = part.element as FieldElement;

    if (!this.changeEventListener) {
      const changeEventListener = this.changeEventListener = form.bindInput(name);
      for (const eventName of eventNames) {
        el.addEventListener(eventName, changeEventListener);
      }
    }

    el.value = form.state[name] ?? null;
    el.error = form.errors[name];
    return this.render();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(...props: unknown[]): unknown {
    // never here override update
    return noChange;
  }
}

export const bindFieldDirective = directive(BindFieldDirective);
