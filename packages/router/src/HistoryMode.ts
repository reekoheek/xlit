import { ModeInterface } from './types.js';
import { RouterError } from './RouterError.js';

export class HistoryMode implements ModeInterface {
  constructor(private basePath = '/') {
  }

  getContextPath({ pathname, search }: { pathname: string, search: string }): string {
    const path = decodeURI(pathname + search);
    if (!path.startsWith(this.basePath)) {
      throw new RouterError('invalid location');
    }
    return '/' + path.substring(this.basePath.length).replace(/\/+$/, '').replace(/^\/+/, '');
  }

  getHistoryUrl(path: string): string {
    const prefix = this.basePath === '/' ? '/' : this.basePath + '/';
    return prefix + path.replace(/\/+$/, '').replace(/^\/+/, '');
  }
}
