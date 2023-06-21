import { LitElement, html } from 'lit';
import { FormController } from './FormController.js';
import { StringField } from './fields/StringField.js';
import { assert, fixture } from '@open-wc/testing';
import { assertRejects } from 'testutil';

class Model {
  foo?: string;
}

describe('FormController', () => {
  it('run', async() => {
    const submits: Model[] = [];

    class TForm extends LitElement {
      form = new FormController<Model>(this, {
        foo: new StringField().required(),
      });

      protected createRenderRoot() {
        return this;
      }

      onSubmit(model: Model) {
        submits.push(model);
      }

      protected render() {
        return html`
          <form @submit="${this.form.handleSubmit(this.onSubmit)}">
            <input id="fooInput" type="text" ${this.form.bind('foo')}>
            <input id="submitBtn" type="submit">
          </form>
        `;
      }
    }
    customElements.define('t-form', TForm);

    const root: TForm = await fixture(html`<t-form></t-form>`);
    const fooInput = root.querySelector('#fooInput') as HTMLInputElement;
    const submitBtn = root.querySelector('#submitBtn') as HTMLInputElement;

    submitBtn.click();
    await new Promise(resolve => setTimeout(resolve));
    assert.deepStrictEqual(root.form.state, {});

    fooInput.value = 'foo';
    fooInput.dispatchEvent(new CustomEvent('input'));
    await new Promise(resolve => setTimeout(resolve));
    assert.deepStrictEqual(root.form.state, { foo: 'foo' });

    submitBtn.click();
    await new Promise(resolve => setTimeout(resolve));
    assert.deepStrictEqual(submits[0], { foo: 'foo' });
  });

  it('throw err if bind to other than element', async() => {
    class TFormBindErr extends LitElement {
      form = new FormController<Model>(this, {
        foo: new StringField().required(),
      });

      protected createRenderRoot() {
        return this;
      }

      protected render() {
        return html`
          <form>
            ${this.form.bind('foo')}
          </form>
        `;
      }
    }
    customElements.define('t-formbinderr', TFormBindErr);

    await assertRejects(
      async() => await fixture(html`<t-formbinderr></t-formbinderr>`),
      /bind directive must be used in element/,
    );
  });
});
