import { ModeInterface } from './types.js';

export class HashMode implements ModeInterface {
  getContextPath({ hash }: { hash: string }): string {
    const matches = /#!(.*)/.exec(hash);
    if (matches) {
      return '/' + matches[1].replace(/\/+$/, '').replace(/^\/+/, '');
    }
    return '/';
  }

  getHistoryUrl(path: string): string {
    return '#!' + path;
  }
}
