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
import { FormController } from '@xlit/form';
import { StringField } from '@xlit/form/StringField.js';

interface Model {
  foo: string;
  bar: string;
}

@customElement('page-foo')
class PageFoo extends LitElement {
  form = new FormController<Model>(this, {
    foo: new StringField().required(),
    bar: new StringField().required(),
  });

  render (): unknown {
    <form @submit="${this.form.submit(this.onSubmit)}">
      <div>
        <label>Foo</label>
        <input type="text" ${this.form.field('foo')}>
        <span class="form-text">${this.form.errors.foo}</span>
      </div>

      <div>
        <label>Bar</label>
        <input type="text" ${this.form.field('bar')}>
        <span class="form-text">${this.form.errors.bar}</span>
      </div>
    </form>
  }

  onSubmit (model: Model) {
    // do something with the model here
  }
}
```
