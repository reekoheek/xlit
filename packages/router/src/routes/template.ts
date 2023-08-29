import { RouteFn } from '../Route.js';
import { RouterError } from '../RouterError.js';

export function template<TState extends object>(tpl: HTMLTemplateElement): RouteFn<TState> {
  return () => {
    const content = document.importNode(tpl.content, true);
    if (!content.firstElementChild) {
      throw new RouterError('invalid template to render');
    }
    return Promise.resolve(content.firstElementChild);
  };
}
