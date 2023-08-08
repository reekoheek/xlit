import { assert } from '@open-wc/testing';
import { HashMode } from './HashMode.js';
import { LocationInterface } from './types.js';

describe('HashMode', () => {
  describe('#getContextPath()', () => {
    it('return context path from location', () => {
      const mode = new HashMode();
      assert.strictEqual(mode.getContextPath(new MockLocation()), '/');
      assert.strictEqual(mode.getContextPath(new MockLocation('/', '', '#!foo')), '/foo');
    });
  });

  describe('#getHistoryUrl()', () => {
    it('return history url from path', () => {
      const mode = new HashMode();
      assert.strictEqual(mode.getHistoryUrl('/foo'), '#!/foo');
      assert.strictEqual(mode.getHistoryUrl('/bar'), '#!/bar');
    });
  });
});

class MockLocation implements LocationInterface {
  constructor(readonly pathname: string = '/', readonly search: string = '', readonly hash: string = '') {

  }
}
