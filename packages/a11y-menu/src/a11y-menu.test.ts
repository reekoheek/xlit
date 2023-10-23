import { html } from 'lit';
import { assert, fixture } from '@open-wc/testing';
import './a11y-menu.js';

describe('a11y-menu', () => {
  it('render', async() => {
    const el = await fixture(html`
      <div>
        <xlit-a11y-menu></xlit-a11y-menu>
        <main></main>
      </div>
    `);
    assert.strictEqual(el.innerHTML.includes('Skip to main content'), true);
  });
});
