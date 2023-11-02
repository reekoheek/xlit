import { describe, it, expect } from 'vitest';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Form } from './Form.js';
import { StringType } from '@xlit/schema';
import { fixture } from '@open-wc/testing';
import { FormError } from './FormError.js';

describe('Form', () => {
  it('run', async() => {
    interface Model {
      foo?: string;
    }

    @customElement('mock-1')
    class Mock1 extends LitElement {
      model?: Model;

      private form = new Form(this, {
        foo: new StringType(),
      }, (model) => {
        this.model = model;
      });

      protected render() {
        return html`
          <form @submit="${this.form.bindSubmit()}">
            <input type="text" ${this.form.bindField('foo')}>
            <input type="submit" value="Submit">
          </form>
        `;
      }
    }

    const mock: Mock1 = await fixture(html`<mock-1></mock-1>`);
    const input = mock.shadowRoot?.querySelector('input[type=text]') as HTMLInputElement;
    const submitBtn = mock.shadowRoot?.querySelector('input[type=submit]') as HTMLInputElement;

    input.value = '';
    input.dispatchEvent(new CustomEvent('input'));
    await new Promise(resolve => setTimeout(resolve));
    expect(input.value).toStrictEqual('');

    input.value = 'foo-value';
    input.dispatchEvent(new CustomEvent('input'));
    await new Promise(resolve => setTimeout(resolve));

    submitBtn.click();
    await new Promise(resolve => setTimeout(resolve));
    expect(mock.model).toMatchObject({ foo: 'foo-value' });
  });

  describe('#setState()', () => {
    it('set errors if failed', async() => {
      const host = new MockHost();
      const form = new Form(host, {
        foo: new StringType().required(),
      }, () => undefined);

      expect(form.error('foo')).toStrictEqual('');
      expect(form.ok).toStrictEqual(false);
      expect(form.model).toStrictEqual(undefined);

      await form.setState({ foo: '' });
      expect(form.error('foo')).toStrictEqual('must be required');
      expect(form.ok).toStrictEqual(false);
      expect(form.model).toStrictEqual(undefined);

      await form.setState({ foo: 'foo' });
      expect(form.error('foo')).toStrictEqual('');
      expect(form.ok).toStrictEqual(true);
      expect(form.model).toMatchObject({ foo: 'foo' });
    });
  });

  describe('#model', () => {
    it('return undefined if not touched all', async() => {
      const form = new Form(new MockHost(), {
        foo: new StringType().required(),
      }, () => undefined);
      expect(form.model).toStrictEqual(undefined);
      await form.setState({ foo: '' });
      expect(form.model).toStrictEqual(undefined);
      await form.setState({ foo: 'foo' });
      expect(form.model).toMatchObject({ foo: 'foo' });
    });
  });

  describe('#ok', () => {
    it('return true if all touched and no errors', async() => {
      const form = new Form(new MockHost(), {
        foo: new StringType().required(),
      }, () => undefined);

      expect(form.ok).toStrictEqual(false);
      await form.setState({ foo: '' });
      expect(form.ok).toStrictEqual(false);
      await form.setState({ foo: 'foo' });
      expect(form.ok).toStrictEqual(true);
    });
  });

  describe('#setError()', () => {
    it('set global error if err is not form error', () => {
      const form = new Form(new MockHost(), {
        foo: new StringType().required(),
      }, () => undefined);
      form.setError(new Error('ouch'));
      expect(form.globalError).toStrictEqual('ouch');
      expect(form.error('foo')).toStrictEqual('');
    });

    it('set field error if err is form error', () => {
      const form = new Form(new MockHost(), {
        foo: new StringType().required(),
      }, () => undefined);
      const err = new FormError('ouch', {
        foo: 'ouch foo',
      });
      form.setError(err);
      expect(form.globalError).toStrictEqual('');
      expect(form.error('foo')).toStrictEqual('ouch foo');
    });
  });
});

class MockHost {
  hits: string[] = [];
  updateComplete: Promise<boolean> = Promise.resolve(true);

  addController() {
    this.hits.push('addController');
  }

  removeController() {
    this.hits.push('removeController');
  }

  requestUpdate() {
    this.hits.push('requestUpdate');
  }
}
