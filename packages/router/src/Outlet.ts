import { ContextedElement } from './ContextedElement.js';

export interface Outlet<TState extends object> {
  render(el: ContextedElement<TState>): Promise<void>;
}

function isOutlet<TState extends object>(o?: object): o is Outlet<TState> {
  return !!o && ('render' in o);
}

export function toOutlet<TState extends object>(arg: Outlet<TState> | Element): Outlet<TState> {
  return isOutlet(arg) ? arg : new ElementOutlet(arg);
}

export class ElementOutlet<TState extends object> {
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
