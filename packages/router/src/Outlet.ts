import { ContextedElement } from './ContextedElement.js';

export interface Outlet {
  render(el: ContextedElement): Promise<void>;
}

export function isOutlet(o: object): o is Outlet {
  return 'render' in o;
}

export class DefaultOutlet {
  constructor(private el: Element, private marker = document.createComment('marker')) {
    el.appendChild(this.marker);
  }

  async render(el: ContextedElement): Promise<void> {
    const promises = [];
    while (this.marker.nextSibling) {
      promises.push(this.el.removeChild(this.marker.nextSibling));
    }
    promises.push(this.el.appendChild(el));
    await Promise.all(promises);
  }
}
