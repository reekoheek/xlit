import { RouteFn } from './Route';
import { RouterError } from './RouterError';

export function template(tpl: HTMLTemplateElement): RouteFn {
  return () => {
    const content = document.importNode(tpl.content, true);
    if (!content.firstElementChild) {
      throw new RouterError('invalid template to render');
    }
    return Promise.resolve(content.firstElementChild);
  };
}
