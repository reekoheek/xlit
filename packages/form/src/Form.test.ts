import { Form } from './Form';
import { StringType } from './types/StringType';
import { assert, fixture } from '@open-wc/testing';
import { assertRejects } from 'testutil';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

describe('Form', () => {
  describe('constructor', () => {
    it('create new form', () => {
      const form = new Form({
        foo: new StringType().required(),
      });

      assert.deepStrictEqual(Object.keys(form['types']), ['foo']);
    });
  });

  describe('#set()', () => {
    it('set field', async() => {
      const form = new Form({
        foo: new StringType().required(),
      });

      await form.set('foo', 'foo');
      assert.deepStrictEqual(form.errors, {});
      assert.deepStrictEqual(form.model, { foo: 'foo' });

      await form.set('foo', '');
      assert.deepStrictEqual(form.errors, { foo: 'must be required' });
      assert.deepStrictEqual(form.model, {});
    });
  });

  describe('#assert()', () => {
    it('assert model', async() => {
      const form = new Form({
        foo: new StringType().required(),
        bar: new StringType(),
      });

      form.model = {
        foo: 'foo',
        bar: 'bar',
      };

      await form.assert();
      assert.deepStrictEqual(form.model, { foo: 'foo', bar: 'bar' });

      form.model = {
        bar: 'bar',
      };

      await assertRejects(() => form.assert());
      assert.deepStrictEqual(form.model, { bar: 'bar' });
    });
  });

  it('run in lit', async() => {
    class Model {
      foo?: string;
    }

    const submits: Model[] = [];

    @customElement('t-form')
    class TForm extends LitElement {
      form = new Form<Model>({
        foo: new StringType().required(),
      }, this);

      protected createRenderRoot() {
        return this;
      }

      onSubmit(model: Model) {
        submits.push(model);
      }

      protected render() {
        return html`
          <form @submit="${this.form.handleSubmit(this.onSubmit)}">
            <input id="fooInput" type="text"
              .value="${this.form.model.foo ?? ''}"
              @input="${this.form.handleInput('foo')}">
            <input id="submitBtn" type="submit">
          </form>
        `;
      }
    }

    const root: TForm = await fixture(html`<t-form></t-form>`);
    const fooInput = root.querySelector('#fooInput') as HTMLInputElement;
    const submitBtn = root.querySelector('#submitBtn') as HTMLInputElement;

    submitBtn.click();
    await new Promise(resolve => setTimeout(resolve));
    assert.deepStrictEqual(root.form.model, {});

    fooInput.value = 'foo';
    fooInput.dispatchEvent(new CustomEvent('input'));
    await new Promise(resolve => setTimeout(resolve));
    assert.deepStrictEqual(root.form.model, { foo: 'foo' });

    submitBtn.click();
    await new Promise(resolve => setTimeout(resolve));
    assert.deepStrictEqual(submits[0], { foo: 'foo' });
  });
});
