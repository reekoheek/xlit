import { required, trim, minLength, maxLength, min, max, between } from './validators';
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

  describe('minLength()', () => {
    it('throw error if length below specified', () => {
      assert.throw(() => minLength(5)('foo'), 'length must greater or equal than 5');
      assert.throw(() => minLength(4)('foo'), 'length must greater or equal than 4');
      assert.throw(() => minLength(3)({}));
      assert.strictEqual('foo', minLength(3)('foo'));
      assert.strictEqual(undefined, minLength(3)(undefined));
      assert.strictEqual(null, minLength(3)(null));
    });
  });

  describe('maxLength()', () => {
    it('throw error if length above specified', () => {
      assert.throw(() => maxLength(5)('123456'), 'length must lower or equal than 5');
      assert.throw(() => maxLength(4)('123456'), 'length must lower or equal than 4');
      assert.throw(() => maxLength(3)({}));
      assert.strictEqual('foo', maxLength(3)('foo'));
      assert.strictEqual(undefined, maxLength(3)(undefined));
      assert.strictEqual(null, maxLength(3)(null));
    });
  });

  describe('min()', () => {
    it('throw error if value lower than specified', () => {
      assert.throw(() => min(3)(1), 'must greater or equal than 3');
      assert.throw(() => min(3)(2), 'must greater or equal than 3');
      assert.strictEqual(3, min(3)(3));
      assert.strictEqual(4, min(3)(4));
      assert.strictEqual(undefined, min(3)(undefined));
      assert.strictEqual(null, min(3)(null));
    });
  });

  describe('max()', () => {
    it('throw error if value greater than specified', () => {
      assert.throw(() => max(3)(4), 'must lower or equal than 3');
      assert.throw(() => max(3)(5), 'must lower or equal than 3');
      assert.strictEqual(3, max(3)(3));
      assert.strictEqual(2, max(3)(2));
      assert.strictEqual(undefined, max(3)(undefined));
      assert.strictEqual(null, max(3)(null));
    });
  });

  describe('between()', () => {
    it('throw error if value out of range', () => {
      assert.throw(() => between(3, 5)(1), 'must between 3 and 5');
      assert.throw(() => between(3, 5)(2), 'must between 3 and 5');
      assert.throw(() => between(3, 5)(6), 'must between 3 and 5');
      assert.throw(() => between(3, 5)(7), 'must between 3 and 5');
      assert.strictEqual(3, between(3, 5)(3));
      assert.strictEqual(4, between(3, 5)(4));
      assert.strictEqual(5, between(3, 5)(5));
      assert.strictEqual(undefined, between(3, 5)(undefined));
      assert.strictEqual(null, between(3, 5)(null));
    });
  });
});
