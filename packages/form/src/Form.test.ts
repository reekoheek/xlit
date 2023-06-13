import { Form } from './Form.js';
import { StringType } from './types/StringType.js';
import { assert, fixture, html } from '@open-wc/testing';
import { assertRejects } from 'testutil';

describe('Form', () => {
  describe('constructor', () => {
    it('create new form', () => {
      const form = new Form({
        foo: new StringType().required(),
      });

      assert.deepStrictEqual(Object.keys(form['types']), ['foo']);
    });

    it('create form with custom model', () => {
      interface Model {
        foo?: string;
        bar: string;
      }

      const form = new Form<Model>({
        foo: new StringType().required(),
        bar: new StringType(),
      });

      assert.deepStrictEqual(Object.keys(form['types']), ['foo', 'bar']);
    });

    it('add update handler if specified', () => {
      function handler() {
        // noop
      }
      const form = new Form({
        foo: new StringType(),
      }, handler);
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

  describe('#set()', () => {
    it('set field', async() => {
      interface Model {
        foo: string;
      }

      const form = new Form<Model>({
        foo: new StringType().required(),
      });

      await form.set('foo', 'foo');
      assert.deepStrictEqual(form.errors, {});
      assert.deepStrictEqual(form.state, { foo: 'foo' });

      await form.set('foo', '');
      assert.deepStrictEqual(form.errors, { foo: 'must be required' });
      assert.deepStrictEqual(form.state, {});
    });
  });

  describe('#assert()', () => {
    it('assert model', async() => {
      const form = new Form({
        foo: new StringType().required(),
        bar: new StringType(),
      });

      form['_state'] = {
        bar: 'bar',
      };

      await assertRejects(() => form.assert());
      assert.deepStrictEqual(form.state, { bar: 'bar' });

      form['_state'] = {
        foo: 'foo',
        bar: 'bar',
      };

      await form.assert();
      assert.deepStrictEqual(form.state, { foo: 'foo', bar: 'bar' });
    });
  });

  describe('#handleInput()', () => {
    it('return event listener', async() => {
      const hits: string[] = [];
      function handler() {
        hits.push('');
      }
      const form = new Form({
        foo: new StringType().required(),
      }, handler);
      const listener = form.handleInput('foo');
      assert.strictEqual(typeof listener, 'function');
      assert.strictEqual(hits.length, 0);

      const root: HTMLInputElement = await fixture(html`
        <input type="text" value="bar" @input="${listener}">
      `);
      root.dispatchEvent(new CustomEvent('input'));
      await new Promise(resolve => setTimeout(resolve, 1));
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
        foo: new StringType().required(),
      }, handler);
      const submits: unknown[] = [];
      const listener = form.handleSubmit((model) => {
        submits.push(model);
      });
      assert.strictEqual(typeof listener, 'function');

      const evt = new CustomEvent('submit');
      listener(evt);
      await new Promise(resolve => setTimeout(resolve, 1));
      assert.strictEqual(submits.length, 0);
      assert.strictEqual(updates.length, 1);

      form['_state'] = { foo: 'bar' };
      form['_errors'] = {};
      listener(evt);
      await new Promise(resolve => setTimeout(resolve, 1));
      assert.strictEqual(submits.length, 1);
      assert.strictEqual(updates.length, 1);
    });
  });
});
