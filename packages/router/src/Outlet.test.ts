import { assert } from '@open-wc/testing';
import { ElementOutlet } from './Outlet.js';
import { toContextedElement } from './ContextedElement.js';
import { Context } from './Context.js';

describe('ElementOutlet', () => {
  describe('#render()', () => {
    it('render element', () => {
      const el = document.createElement('div');
      const outlet = new ElementOutlet(el);
      outlet.render(toContextedElement(document.createElement('result'), {} as Context<object>));
      assert.strictEqual(el.innerHTML.includes('<result>'), true);
      outlet.render(toContextedElement(document.createElement('other'), {} as Context<object>));
      assert.strictEqual(el.innerHTML.includes('<result>'), false);
      assert.strictEqual(el.innerHTML.includes('<other>'), true);
    });
  });
});
