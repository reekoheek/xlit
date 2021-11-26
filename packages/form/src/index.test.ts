import { Form, Rules, validate } from './index';
import { assert, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';
import { query } from 'lit/decorators.js';

describe('form', () => {
  describe('validate()', () => {
    it('validate model attribute with name by specified rules', async () => {
      const rules: Rules = {
        one: (v) => v + '1',
        two: (v) => v + '2',
      };
      const value = await validate(rules, { foo: 'foo' }, 'foo');
      assert.strictEqual('foo12', value);
    });
  });

  describe('Form', () => {
    describe('#value()', () => {
      it('return value from model prop', async () => {
        const el: TForm = await fixture(html`<t-form></t-form>`);
        assert.strictEqual(undefined, el.form.value('foo'));
        assert.strictEqual('default', el.form.value('foo', 'default'));
        el.form.set({ foo: 'foo' });
        await el.updateComplete;
        assert.strictEqual('foo', el.form.value('foo'));
      });
    });

    describe('#set()', () => {
      it('set multiple value to model', async () => {
        const el: TForm = await fixture(html`<t-form></t-form>`);
        el.form.set({ foo: 'foo', bar: 'bar' });
        await el.updateComplete;
        assert.deepStrictEqual({ foo: 'foo', bar: 'bar' }, el.form.model);
        el.form.set({ foo: 'foo1' });
        await el.updateComplete;
        assert.deepStrictEqual({ foo: 'foo1', bar: 'bar' }, el.form.model);
        el.form.set({});
        await el.updateComplete;
        assert.deepStrictEqual({ foo: 'foo1', bar: 'bar' }, el.form.model);
      });
    });

    describe('#reset()', () => {
      it('reset errors to empty and model to specified', async () => {
        const el: TForm = await fixture(html`<t-form></t-form>`);
        el.form.set({ foo: 'err', bar: 'bar' });
        await el.updateComplete;
        el.form.reset({ foo: 'err', bar: 'zzz' });
        await el.updateComplete;
        assert.deepStrictEqual({ foo: 'err', bar: 'zzz' }, el.form.model);
        assert.deepStrictEqual({}, el.form.errors);
      });
    });

    describe('#input()', () => {
      it('return event listener', async () => {
        const el: TForm = await fixture(html`<t-form></t-form>`);
        el.fooInput.value = 'foo';
        el.fooInput.dispatchEvent(new Event('input'));
        await el.updateComplete;
        assert.strictEqual('foo', el.form.model.foo);
      });
    });

    describe('#error()', () => {
      it('return error for field', async () => {
        const el: TForm = await fixture(html`<t-form></t-form>`);
        assert.deepStrictEqual([], el.form.error('foo'));
        el.form.set({ foo: 'foo' });
        await el.updateComplete;
        assert.deepStrictEqual([], el.form.error('foo'));
        el.form.set({ foo: 'err' });
        await el.updateComplete;
        assert.deepStrictEqual(['ouch'], el.form.error('foo').map(e => e.message));
      });
    });

    describe('#get()', () => {
      it('get model', async () => {
        const el: TForm = await fixture(html`<t-form></t-form>`);
        assert.deepStrictEqual({}, el.form.model);
      });

      it('throw error if form invalid', async () => {
        const el: TForm = await fixture(html`<t-form></t-form>`);
        el.form.set({ foo: 'err' });
        await el.updateComplete;
        assert.throw(() => el.form.get(), 'invalid form');
      });
    });
  });
});

function mockErr (v: unknown) {
  if (v === 'err') {
    throw new Error('ouch');
  }
  return v;
}

class TForm extends LitElement {
  form = new Form(this, {
    foo: { mockErr },
    bar: { mockErr },
  });

  @query('#fooInput')
  fooInput: HTMLInputElement;

  @query('#barInput')
  barInput: HTMLInputElement;

  render () {
    return html`
      <form>
        <input id="fooInput" type="text" .value="${this.form.value('foo', '')}" @input="${this.form.input('foo')}">
        <input id="barInput" type="text" .value="${this.form.value('bar', '')}" @input="${this.form.input('bar')}">
      </form>

      <div id="foo">${this.form.value('foo', '')}</div>
      <div id="bar">${this.form.value('bar', '')}</div>
    `;
  }
}
customElements.define('t-form', TForm);
