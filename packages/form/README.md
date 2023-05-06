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

interface Model {
  foo?: string;
  bar?: string;
}

@customElement('page-foo')
class PageFoo extends LitElement {
  form = new Form<Model>({
    foo: new StringType().required(),
    bar: new StringType().required(),
  }, this);

  render (): unknown {
    <form @submit="${this.form.submit(this.onSubmit)}">
      <div>
        <label>Foo</label>
        <input type="text" value="${this.form.model.foo ?? ''}" @input="${this.form.input('foo')}">
        <span class="form-text">${this.form.errors.foo}</span>
      </div>

      <div>
        <label>Bar</label>
        <input type="text" value="${this.form.model.bar ?? ''}" @input="${this.form.input('bar')}">
        <span class="form-text">${this.form.errors.bar}</span>
      </div>
    </form>
  }

  onSubmit (model: Model) {
    // do something with the model here
  }
}
```
