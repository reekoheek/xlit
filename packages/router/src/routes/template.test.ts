import { assert, fixture, html } from '@open-wc/testing';
import { template } from './template.js';
import { assertRejects } from 'testutil';

describe('template()', () => {
  it('return element if invoked', async() => {
    const tpl: HTMLTemplateElement = await fixture(html`
      <template id="tpl">
        <foo>foo</foo>
        <bar>bar</bar>
      </template>
    `);
    const fn = template(tpl);
    const param = {} as Parameters<typeof fn>[0];
    const result = await fn(param);
    assert.strictEqual('<foo>foo</foo>', result.outerHTML);
  });

  it('throw error on invalid template', async() => {
    const emptyTemplate = document.createElement('template');
    const fn = template(emptyTemplate);
    const param = {} as Parameters<typeof fn>[0];
    await assertRejects(() => fn(param), /invalid template to render/);
  });
});
