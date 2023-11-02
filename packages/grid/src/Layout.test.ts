import { describe, it, expect } from 'vitest';
import { Item } from './Item.js';
import { Layout } from './Layout.js';

describe('Layout', () => {
  describe('#maxHeight', () => {
    it('get calculated max height in unit', () => {
      const layout = new Layout(3);
      expect(layout.maxHeight).toStrictEqual(0);

      layout.add(new Item('foo', { x: 0, y: 0, w: 2, h: 2 }));
      layout.add(new Item('bar', { x: 1, y: 2 }));
      layout.add(new Item('baz', { x: 2, y: 1 }));
      expect(layout.maxHeight).toStrictEqual(3);
    });
  });

  describe('#add()', () => {
    it('add item', () => {
      const layout = new Layout(3);
      layout.add(new Item('foo'));
      expect(layout.items.length).toStrictEqual(1);
    });

    it('throw error if key duplicate', () => {
      const layout = new Layout(3);
      layout.items.push(new Item('foo'));
      expect(() => layout.add(new Item('foo', { x: 1 }))).toThrowError(/duplicate item key/);
    });

    it('throw error if item out of bound', () => {
      const layout = new Layout(3);
      expect(() => layout.add(new Item('foo', { x: -1 }))).toThrowError(/item out of bound/);
      expect(() => layout.add(new Item('foo', { y: -1 }))).toThrowError(/item out of bound/);
      expect(() => layout.add(new Item('foo', { w: 4 }))).toThrowError(/item out of bound/);
    });

    it('throw error if item collisions exist', () => {
      const layout = new Layout(3);
      layout.items.push(new Item('existing'));
      expect(() => layout.add(new Item('foo'))).toThrowError(/item collision found/);
    });
  });

  describe('#get()', () => {
    it('get by key', () => {
      const layout = new Layout(3);
      layout.add(new Item('foo'));
      layout.add(new Item('bar', { y: 1 }));
      expect(layout.get('foo').key).toStrictEqual('foo');
      expect(layout.get('bar').key).toStrictEqual('bar');
      expect(() => layout.get('baz')).toThrowError(/item not found/);
    });
  });

  describe('#move()', () => {
    it('move item', () => {
      const foo = new Item('foo');
      const layout = new Layout(3);
      layout.add(foo);

      const clone = foo.clone();
      clone.x = 2;
      clone.y = 3;
      layout.move(clone);

      expect(layout.get('foo').x).toStrictEqual(2);
      expect(layout.get('foo').y).toStrictEqual(3);
    });

    it('shift collision item to next y', () => {
      const foo = new Item('foo');
      const bar = new Item('bar', { x: 1 });

      const layout = new Layout(3);
      layout.add(foo);
      layout.add(bar);

      const clone = foo.clone();
      clone.x = 1;
      layout.move(clone);

      expect(bar.x).toStrictEqual(1);
      expect(bar.y).toStrictEqual(1);
    });
  });

  describe('#pack()', () => {
    it('pack to top', () => {
      const foo = new Item('foo', { x: 0, y: 1 });
      const bar = new Item('bar', { x: 1, y: 2 });
      const baz = new Item('baz', { x: 2, y: 3 });

      const layout = new Layout(3);
      layout.add(foo);
      layout.add(bar);
      layout.add(baz);

      layout.pack();

      expect(foo.y).toStrictEqual(0);
      expect(bar.y).toStrictEqual(0);
      expect(baz.y).toStrictEqual(0);
    });
  });
});
