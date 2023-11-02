import { describe, it, expect } from 'vitest';
import { HistoryMode } from './HistoryMode.js';
import { LocationInterface } from './types.js';

describe('HistoryMode', () => {
  describe('#getContextPath()', () => {
    it('return context path from location', () => {
      const mode = new HistoryMode();
      expect(mode.getContextPath(new MockLocation())).toStrictEqual('/');
      expect(mode.getContextPath(new MockLocation('/foo'))).toStrictEqual('/foo');
    });

    it('throw error if base path not match', () => {
      const mode = new HistoryMode('/foo');
      expect(() => mode.getContextPath(new MockLocation('/bar'))).toThrowError(/invalid location/);
    });
  });

  describe('#getHistoryUrl()', () => {
    it('return history url from path', () => {
      const mode = new HistoryMode();
      expect(mode.getHistoryUrl('/foo')).toStrictEqual('/foo');
      expect(mode.getHistoryUrl('/bar')).toStrictEqual('/bar');
    });

    it('prefix with base path', () => {
      const mode = new HistoryMode('/foo');
      expect(mode.getHistoryUrl('/foo')).toStrictEqual('/foo/foo');
      expect(mode.getHistoryUrl('/bar')).toStrictEqual('/foo/bar');
    });
  });
});

class MockLocation implements LocationInterface {
  constructor(readonly pathname: string = '/', readonly search: string = '', readonly hash: string = '') {

  }
}
