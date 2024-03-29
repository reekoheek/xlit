import { isContextedElement } from '../ContextedElement.js';

export function context() {
  return (el: Element, propName: string) => {
    Object.defineProperty(el, propName, {
      get() {
        if (!isContextedElement(this)) {
          throw new Error('element is not contexted element');
        }

        return this.ctx;
      },
    });
  };
}
