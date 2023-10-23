import { LitElement, html } from 'lit';
import { Lite } from './Lite.js';
import { assert, fixture } from '@open-wc/testing';
import { customElement } from 'lit/decorators.js';

describe('Lite', () => {
  it('mixin lite', async() => {
    @customElement('x-foo')
    class Foo extends Lite(LitElement) {

    }

    const el: Foo = await fixture(html`<x-foo></x-foo>`);
    assert.strictEqual(el.renderRoot, el);
  });
});
