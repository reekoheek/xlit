import { Context } from './Context';
import { assert } from '@open-wc/testing';

describe('Context', () => {
  describe('#set()', () => {
    it('set state', () => {
      const ctx = new Context('/');
      ctx.set('foo', 'foo');
      assert.strictEqual(ctx['state'].foo, 'foo');
    });

    it('throw error if state set to empty', () => {
      assert.throws(() => {
        const ctx = new Context('/');
        ctx.set('foo', undefined);
      }, /cannot set state to empty/);

      assert.throws(() => {
        const ctx = new Context('/');
        ctx.set('foo', null);
      }, /cannot set state to empty/);
    });
  });

  describe('#get()', () => {
    it('get state', () => {
      const ctx = new Context('/');
      ctx['state'].foo = 'foo';
      assert.strictEqual(ctx.get('foo'), 'foo');
    });
  });

  describe('#remove()', () => {
    it('remove state', () => {
      const ctx = new Context('/');
      ctx['state'].foo = 'foo';
      ctx.remove('foo');
      assert.strictEqual(ctx['state'].foo, undefined);
    });
  });
});
