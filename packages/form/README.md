# @xlit/form

Lit reactive component for form model, binding and validation

## Installation

```sh
npm i @xlit/form
```

## Getting started

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Form } from '@xlit/form';
import { trim, required } from '@xlit/form/validators.js';

@customElement('page-foo')
class PageFoo extends LitElement {
  form = new Form(this, {
    foo: { trim, required },
    bar: { trim, required },
  });

  render (): unknown {
    <form @submit="${this.onSubmit}">
      <div>
        <label>Foo</label>
        <input type="text" .value="${this.form.value('foo', '') as string}" @input="${this.form.input('foo')}">
        <span class="form-text">${this.form.error('foo')}</span>
      </div>

      <div>
        <label>Bar</label>
        <input type="text" .value="${this.form.value('bar', '') as string}" @input="${this.form.input('bar')}">
        <span class="form-text">${this.form.error('bar')}</span>
      </div>
    </form>
  }

  onSubmit (evt: Event) {
    evt.stopImmediatePropagation();
    try {
      this.form.assert();
      console.info('Model:', this.form.model);
    } catch (err) {
      console.error(err);
    }
  }
}
```
