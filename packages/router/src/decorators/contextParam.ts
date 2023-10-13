import { isContextedElement } from '../ContextedElement.js';

export function contextParam(key?: string) {
  return (el: Element, propName: string) => {
    const aKey = key ?? propName;
    Object.defineProperty(el, propName, {
      get() {
        if (!isContextedElement(this)) {
          throw new Error('element is not contexted element');
        }

        return this.ctx.params[aKey];
      },
    });
  };
}
