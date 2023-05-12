import { ModeInterface } from './types.js';

export class HashMode implements ModeInterface {
  getContextPath({ hash }: { hash: string }): string {
    const match = hash.match(/#!(.*)/);
    if (match && match[1]) {
      return '/' + match[1].replace(/\/+$/, '').replace(/^\/+/, '');
    }
    return '/';
  }

  getHistoryUrl(path: string): string {
    return '#!' + path;
  }
}
