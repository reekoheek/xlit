import { LitElement, html } from 'lit';
import { Form } from '../Form.js';
import { NumberType, StringType } from '@xlit/schema';
import { customElement } from 'lit/decorators.js';

@customElement('x-main')
export class Main extends LitElement {
  form = new Form(this, {
    foo: new StringType().required(),
    bar: new StringType().required(),
    baz: new NumberType().required(),
  }, (model) => {
    if (model.foo === 'err') {
      throw new Error('some error happend');
    }
    console.info('model:', model);
    alert(JSON.stringify(model, undefined, 2));
  });

  protected render(): unknown {
    console.error('render', this.form.state);
    return html`
      <form @submit="${this.form.bindSubmit()}">
        <div class="error">${this.form.globalError}</div>
        <div>
          <label>foo</label>
          <input type="text" ${this.form.bindField('foo')}>
          <div class="error">${this.form.error('foo')}</div>
        </div>
        <div>
          <label>bar</label>
          <input type="text" ${this.form.bindField('bar')}>
          <div class="error">${this.form.error('bar')}</div>
        </div>
        <div>
          <label>baz</label>
          <input type="text" ${this.form.bindField('baz')}>
          <div class="error">${this.form.error('baz')}</div>
        </div>
        <div>
          <input type="submit">
        </div>
      </form>
    `;
  }

  protected createRenderRoot() {
    return this;
  }
}
