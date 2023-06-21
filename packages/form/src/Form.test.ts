import { Form } from './Form.js';
import { StringField } from './fields/StringField.js';
import { assert, fixture, html } from '@open-wc/testing';

describe('Form', () => {
  describe('constructor', () => {
    it('add update handler if specified', () => {
      function handler() {
        // noop
      }
      const form = new Form({
        foo: new StringField(),
      }).addUpdateHandler(handler);
      assert.strictEqual(form['updateHandlers'][0], handler);
    });
  });

  describe('#addUpdateHandler()', () => {
    it('add update handler', () => {
      function handler() {
        // noop
      }
      const form = new Form({});
      form.addUpdateHandler(handler);
      assert.strictEqual(form['updateHandlers'][0], handler);
    });
  });

  describe('#removeUpdateHandler()', () => {
    it('remove update handler', () => {
      function handler() {
        // noop
      }
      const form = new Form({});
      form['updateHandlers'][0] = handler;
      form.removeUpdateHandler(handler);
      assert.strictEqual(form['updateHandlers'].length, 0);
    });
  });

  describe('#setState()', () => {
    interface Model {
      foo: string;
    }

    it('set state', async() => {
      const form = new Form<Model>({
        foo: new StringField().required(),
      });

      await form.setState({ foo: 'foo' });
      assert.deepStrictEqual(form.errors, {});
      assert.deepStrictEqual(form.state, { foo: 'foo' });

      await form.setState({ foo: '' });
      assert.deepStrictEqual(form.errors, { foo: 'must be required' });
      assert.deepStrictEqual(form.state, {});
    });

    it('notify update', async() => {
      const form = new Form<Model>({
        foo: new StringField().required(),
      });

      const hits: string[] = [];
      form.addUpdateHandler(() => hits.push('hit'));

      await form.setState({ foo: 'foo' });
      await new Promise((resolve) => setTimeout(resolve, 301));
      assert.deepStrictEqual(hits, ['hit']);
    });
  });

  describe('#handleInput()', () => {
    it('return event listener', async() => {
      const hits: string[] = [];
      function handler() {
        hits.push('');
      }
      const form = new Form({
        foo: new StringField().required(),
      }).addUpdateHandler(handler);
      const listener = form.handleInput('foo');
      assert.strictEqual(typeof listener, 'function');
      assert.strictEqual(hits.length, 0);

      const root: HTMLInputElement = await fixture(html`
        <input type="text" value="bar" @input="${listener}">
      `);
      root.dispatchEvent(new CustomEvent('input'));
      await new Promise(resolve => setTimeout(resolve, 301));
      assert.strictEqual(hits.length, 1);
    });
  });

  describe('#handleSubmit()', () => {
    it('return event listener', async() => {
      const updates: string[] = [];
      function handler() {
        updates.push('');
      }
      const form = new Form({
        foo: new StringField().required(),
      }).addUpdateHandler(handler);
      const submits: unknown[] = [];
      const submitListener = form.handleSubmit((model) => {
        submits.push(model);
      });
      assert.strictEqual(typeof submitListener, 'function');

      const evt = new CustomEvent('submit');
      submitListener(evt);
      await new Promise(resolve => setTimeout(resolve, 301));
      assert.strictEqual(submits.length, 0);
      assert.strictEqual(updates.length, 1);

      form['_state'] = { foo: 'bar' };
      form['_errors'] = {};
      submitListener(evt);
      await new Promise(resolve => setTimeout(resolve, 1));
      assert.strictEqual(submits.length, 1);
      assert.strictEqual(updates.length, 1);
    });
  });

  describe('#valid', () => {
    it('true if no error', () => {
      const form = new Form({
        foo: new StringField(),
      });
      assert.strictEqual(form.valid, true);
      form['_errors'] = {
        foo: 'ouch',
      };
      assert.strictEqual(form.valid, false);
    });
  });
});
