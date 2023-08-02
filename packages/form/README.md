# @xlit/form

Lit reactive component for form binding and validation

## Installation

```sh
npm i @xlit/form
```

## Getting started

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Form } from '@xlit/form';
import { StringType } from '@xlit/schema';

@customElement('page-foo')
class PageFoo extends LitElement {
  private form = new Form(this, {
    foo: new StringType().required(),
    bar: new StringType().required(),
  }, (model) => {
    // do something with model here
  });

  render (): unknown {
    return html`
      <form @submit="${this.form.bindSubmit()}">
        <div>
          <label>Foo</label>
          <input type="text" ${this.form.bindField('foo')}>
          <span class="form-text">${this.form.errors.foo}</span>
        </div>

        <div>
          <label>Bar</label>
          <input type="text" ${this.form.bindField('bar')}>
          <span class="form-text">${this.form.errors.bar}</span>
        </div>

        <div>
          <input type="submit" value="Submit" .disabled="${!this.form.ok}">
        </div>
      </form>
    `;
  }
}
```
