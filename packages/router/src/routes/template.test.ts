import { describe, it, expect } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { template } from './template.js';

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
    expect('<foo>foo</foo>').toStrictEqual(result.outerHTML);
  });

  it('throw error on invalid template', async() => {
    const emptyTemplate = document.createElement('template');
    const fn = template(emptyTemplate);
    const param = {} as Parameters<typeof fn>[0];
    await expect(async() => await fn(param)).rejects.toThrowError(/invalid template to render/);
  });
});
