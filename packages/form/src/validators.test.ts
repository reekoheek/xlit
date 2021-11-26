import { required, trim } from './validators';
import { assert } from '@open-wc/testing';

describe('validators', () => {
  describe('trim()', () => {
    it('trim value', () => {
      assert.strictEqual('', trim(''));
      assert.strictEqual(null, trim(null));
      assert.strictEqual(undefined, trim(undefined));
      assert.strictEqual('foo', trim('  foo '));
      assert.strictEqual('100', trim(100));
    });
  });

  describe('required()', () => {
    it('throw error if empty', () => {
      assert.throw(() => required(''), 'required');
      assert.throw(() => required(null), 'required');
      assert.throw(() => required(undefined), 'required');
      assert.strictEqual('foo', required('foo'));
    });
  });
});
