import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Form } from '../Form';
import { StringType } from '../StringType';

interface Model {
  foo?: string;
  bar?: string;
}

@customElement('x-form')
export class XForm extends LitElement {
  form = new Form<Model>({
    foo: new StringType().required(),
    bar: new StringType(),
  }, this);

  @state()
  submits: Model[] = [];

  onSubmit = (model: Model) => {
    this.submits = [...this.submits, model];
  };

  protected render() {
    return html`
      <form @submit="${this.form.handleSubmit(this.onSubmit)}">
        <div>
          <label>Foo</label>
          <input type="text" .value="${this.form.model.foo ?? ''}" @input="${this.form.handleInput('foo')}">
          <div>${this.form.errors.foo}</div>
        </div>
        <div>
          <label>Bar</label>
          <input type="text" .value="${this.form.model.bar ?? ''}" @input="${this.form.handleInput('bar')}">
          <div>${this.form.errors.bar}</div>
        </div>
        <div>
          <input type="submit" value="Submit">
        </div>
      </form>

      <div>
        <h2>State</h2>
        <div>foo = ${this.form.model.foo}</div>
        <div>bar = ${this.form.model.bar}</div>
      </div>

      <div>
        <h2>Submits</h2>
        ${this.submits.map(model => html`
          <div>
            ${JSON.stringify(model)}
          </div>
        `)}
      </div>
    `;
  }
}
