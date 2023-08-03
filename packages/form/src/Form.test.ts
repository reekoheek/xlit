import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Form } from './Form.js';
import { StringType } from '@xlit/schema';
import { assert, fixture } from '@open-wc/testing';

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
    assert.strictEqual(input.value, '');

    input.value = 'foo-value';
    input.dispatchEvent(new CustomEvent('input'));
    await new Promise(resolve => setTimeout(resolve));

    submitBtn.click();
    await new Promise(resolve => setTimeout(resolve));
    assert.deepStrictEqual(mock.model, { foo: 'foo-value' });
  });

  describe('#setState()', () => {
    it('set errors if failed', async() => {
      const host = new MockHost();
      const form = new Form(host, {
        foo: new StringType().required(),
      }, () => undefined);

      assert.deepStrictEqual(form.errors, {});
      assert.deepStrictEqual(form.state, {});

      await form.setState({ foo: '' });
      assert.deepStrictEqual(form.errors, { foo: 'must be required' });
      assert.deepStrictEqual(form.state, { foo: '' });

      await form.setState({ foo: 'foo' });
      assert.deepStrictEqual(form.errors, {});
      assert.deepStrictEqual(form.state, { foo: 'foo' });
    });
  });

  describe('#model', () => {
    it('return undefined if not touched all', async() => {
      const form = new Form(new MockHost(), {
        foo: new StringType().required(),
      }, () => undefined);
      assert.strictEqual(form.model, undefined);
      await form.setState({ foo: '' });
      assert.strictEqual(form.model, undefined);
      await form.setState({ foo: 'foo' });
      assert.deepStrictEqual(form.model, { foo: 'foo' });
    });
  });

  describe('#hasErrors', () => {
    it('return true if has errors', async() => {
      const form = new Form(new MockHost(), {
        foo: new StringType().required(),
      }, () => undefined);

      assert.strictEqual(form.hasErrors, false);
      await form.setState({ foo: '' });
      assert.strictEqual(form.hasErrors, true);
      await form.setState({ foo: 'foo' });
      assert.strictEqual(form.hasErrors, false);
    });
  });

  describe('#allTouched', () => {
    it('return true if all touched', async() => {
      const form = new Form(new MockHost(), {
        foo: new StringType(),
        bar: new StringType(),
      }, () => undefined);

      assert.strictEqual(form.allTouched, false);
      await form.setState({ foo: '' });
      assert.strictEqual(form.allTouched, false);
      await form.setState({ bar: '' });
      assert.strictEqual(form.allTouched, true);
    });
  });

  describe('#ok', () => {
    it('return true if all touched and no errors', async() => {
      const form = new Form(new MockHost(), {
        foo: new StringType().required(),
      }, () => undefined);

      assert.strictEqual(form.ok, false);
      await form.setState({ foo: '' });
      assert.strictEqual(form.ok, false);
      await form.setState({ foo: 'foo' });
      assert.strictEqual(form.ok, true);
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
