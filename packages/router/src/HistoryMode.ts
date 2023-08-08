import { RouterError } from './RouterError.js';
import { LocationInterface, ModeInterface } from './types.js';

export class HistoryMode implements ModeInterface {
  constructor(private basePath = '/') {
  }

  getContextPath({ pathname, search }: LocationInterface): string {
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
