import { describe, it, expect } from 'vitest';
import { HashMode } from './HashMode.js';
import { LocationInterface } from './types.js';

describe('HashMode', () => {
  describe('#getContextPath()', () => {
    it('return context path from location', () => {
      const mode = new HashMode();
      expect(mode.getContextPath(new MockLocation())).toStrictEqual('/');
      expect(mode.getContextPath(new MockLocation('/', '', '#!foo'))).toStrictEqual('/foo');
    });
  });

  describe('#getHistoryUrl()', () => {
    it('return history url from path', () => {
      const mode = new HashMode();
      expect(mode.getHistoryUrl('/foo')).toStrictEqual('#!/foo');
      expect(mode.getHistoryUrl('/bar')).toStrictEqual('#!/bar');
    });
  });
});

class MockLocation implements LocationInterface {
  constructor(readonly pathname: string = '/', readonly search: string = '', readonly hash: string = '') {

  }
}
