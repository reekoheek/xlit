import { assert } from '@open-wc/testing';
import { HistoryMode } from './HistoryMode.js';
import { LocationInterface } from './types.js';

describe('HistoryMode', () => {
  describe('#getContextPath()', () => {
    it('return context path from location', () => {
      const mode = new HistoryMode();
      assert.strictEqual(mode.getContextPath(new MockLocation()), '/');
      assert.strictEqual(mode.getContextPath(new MockLocation('/foo')), '/foo');
    });

    it('throw error if base path not match', () => {
      const mode = new HistoryMode('/foo');
      assert.throws(() => mode.getContextPath(new MockLocation('/bar')), /invalid location/);
    });
  });

  describe('#getHistoryUrl()', () => {
    it('return history url from path', () => {
      const mode = new HistoryMode();
      assert.strictEqual(mode.getHistoryUrl('/foo'), '/foo');
      assert.strictEqual(mode.getHistoryUrl('/bar'), '/bar');
    });

    it('prefix with base path', () => {
      const mode = new HistoryMode('/foo');
      assert.strictEqual(mode.getHistoryUrl('/foo'), '/foo/foo');
      assert.strictEqual(mode.getHistoryUrl('/bar'), '/foo/bar');
    });
  });
});

class MockLocation implements LocationInterface {
  constructor(readonly pathname: string = '/', readonly search: string = '', readonly hash: string = '') {

  }
}
