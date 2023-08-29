import { Context } from './Context.js';

export interface ContextedElement<TState extends object> extends Element {
  ctx: Context<TState>;
}

export function toContextedElement<TState extends object>(el: Element, ctx: Context<TState>): ContextedElement<TState> {
  const contextedEl = el as ContextedElement<TState>;
  contextedEl.ctx = ctx;
  return contextedEl;
}

export function isContextedElement(el: Element): el is ContextedElement<Record<string, unknown>> {
  return 'ctx' in el;
}
