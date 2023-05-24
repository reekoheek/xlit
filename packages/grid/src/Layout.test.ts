import { Item } from './Item';
import { Layout } from './Layout';
import { assert } from '@open-wc/testing';

describe('Layout', () => {
  describe('#maxHeight', () => {
    it('get calculated max height in unit', () => {
      const layout = new Layout(3);
      assert.strictEqual(layout.maxHeight, 0);

      layout.add(new Item('foo', { x: 0, y: 0, w: 2, h: 2 }));
      layout.add(new Item('bar', { x: 1, y: 2 }));
      layout.add(new Item('baz', { x: 2, y: 1 }));
      assert.strictEqual(layout.maxHeight, 3);
    });
  });

  describe('#add()', () => {
    it('add item', () => {
      const layout = new Layout(3);
      layout.add(new Item('foo'));
      assert.strictEqual(layout.items.length, 1);
    });

    it('throw error if key duplicate', () => {
      const layout = new Layout(3);
      layout.items.push(new Item('foo'));
      assert.throws(() => layout.add(new Item('foo', { x: 1 })), /duplicate item key/);
    });

    it('throw error if item out of bound', () => {
      const layout = new Layout(3);
      assert.throws(() => layout.add(new Item('foo', { x: -1 })), /item out of bound/);
      assert.throws(() => layout.add(new Item('foo', { y: -1 })), /item out of bound/);
      assert.throws(() => layout.add(new Item('foo', { w: 4 })), /item out of bound/);
    });

    it('throw error if item collisions exist', () => {
      const layout = new Layout(3);
      layout.items.push(new Item('existing'));
      assert.throws(() => layout.add(new Item('foo')), /item collision found/);
    });
  });

  describe('#get()', () => {
    it('get by key', () => {
      const layout = new Layout(3);
      layout.add(new Item('foo'));
      layout.add(new Item('bar', { y: 1 }));
      assert.strictEqual(layout.get('foo').key, 'foo');
      assert.strictEqual(layout.get('bar').key, 'bar');
      assert.throws(() => layout.get('baz'), /item not found/);
    });
  });
});
