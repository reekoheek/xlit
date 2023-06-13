import { assert } from '@open-wc/testing';
import { HashMode } from './HashMode.js';

describe('HashMode', () => {
  describe('#getContextPath()', () => {
    it('return context path from location', () => {
      const mode = new HashMode();
      assert.strictEqual(mode.getContextPath({ hash: '' }), '/');
      assert.strictEqual(mode.getContextPath({ hash: '#!foo' }), '/foo');
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
