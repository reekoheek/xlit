import { ContextedElement } from './ContextedElement.js';

export interface Outlet<TState extends object> {
  render(el: ContextedElement<TState>): Promise<void>;
}

export function isOutlet<TState extends object>(o: object): o is Outlet<TState> {
  return 'render' in o;
}

export class DefaultOutlet<TState extends object> {
  constructor(private el: Element, private marker = document.createComment('marker')) {
    el.appendChild(this.marker);
  }

  async render(el: ContextedElement<TState>): Promise<void> {
    const promises = [];
    while (this.marker.nextSibling) {
      promises.push(this.el.removeChild(this.marker.nextSibling));
    }
    promises.push(this.el.appendChild(el));
    await Promise.all(promises);
  }
}
