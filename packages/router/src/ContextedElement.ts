import { Context } from './Context';

export interface ContextedElement extends Element {
  ctx: Context;
}

export function toContextedElement(el: Element, ctx: Context): ContextedElement {
  const contextedEl = el as ContextedElement;
  contextedEl.ctx = ctx;
  return contextedEl;
}