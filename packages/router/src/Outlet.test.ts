import { describe, it, expect } from 'vitest';
import { ElementOutlet } from './Outlet.js';
import { toContextedElement } from './ContextedElement.js';
import { Context } from './Context.js';

describe('ElementOutlet', () => {
  describe('#render()', () => {
    it('render element', () => {
      const el = document.createElement('div');
      const outlet = new ElementOutlet(el);
      outlet.render(toContextedElement(document.createElement('result'), {} as Context<object>));
      expect(el.innerHTML.includes('<result>')).toStrictEqual(true);
      outlet.render(toContextedElement(document.createElement('other'), {} as Context<object>));
      expect(el.innerHTML.includes('<result>')).toStrictEqual(false);
      expect(el.innerHTML.includes('<other>')).toStrictEqual(true);
    });
  });
});
