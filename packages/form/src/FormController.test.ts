import { LitElement, html } from 'lit';
import { FormController } from './FormController.js';
import { StringType } from './types/StringType.js';
import { assert, fixture } from '@open-wc/testing';

describe('FormController', () => {
  it('run', async() => {
    class Model {
      foo?: string;
    }

    const submits: Model[] = [];

    class TForm extends LitElement {
      form = new FormController<Model>(this, {
        foo: new StringType().required(),
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
            <input id="fooInput" type="text" ${this.form.field('foo')}>
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
});
