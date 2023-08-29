import { isContextedElement } from '../ContextedElement.js';

type Kind = 'params' | 'state' | 'query'

export function context(kind: Kind, key?: string) {
  return (el: Element, propName: string) => {
    const aKey = key ?? propName;
    Object.defineProperty(el, propName, {
      get() {
        if (!isContextedElement(this)) {
          throw new Error('element is not contexted element');
        }

        return this.ctx[kind][aKey];
      },
    });
  };
}
