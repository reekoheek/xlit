import { assert, fixture, html } from '@open-wc/testing';
import { title } from './title.js';
import { Context } from './Context.js';

describe('title()', () => {
  it('set title', async() => {
    const doc = {
      title: '',
    };
    const middleware = title('foo', doc);
    assert.strictEqual(doc.title, '');

    const tpl = await fixture(html`
      <div>
        <foo>
          <h1>Foo</h1>
        </foo>
        <bar>
        </bar>
      </div>
    `);

    const ctx = new Context('/');

    ctx.result = tpl.querySelector('foo') as HTMLElement;
    await middleware(ctx, () => Promise.resolve());
    await new Promise((resolve) => requestAnimationFrame(resolve));
    assert.strictEqual(doc.title, 'Foo - foo');

    ctx.result = tpl.querySelector('bar') as HTMLElement;
    await middleware(ctx, () => Promise.resolve());
    await new Promise((resolve) => requestAnimationFrame(resolve));
    assert.strictEqual(doc.title, 'foo');

    ctx.result = tpl.querySelector('baz') as HTMLElement;
    await middleware(ctx, () => Promise.resolve());
    await new Promise((resolve) => requestAnimationFrame(resolve));
    assert.strictEqual(doc.title, 'foo');
  });
});
