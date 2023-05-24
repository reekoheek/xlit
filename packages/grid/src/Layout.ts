import { GridError } from './GridError.js';
import { Item } from './Item.js';
import { Point } from './types.js';

export const ItemCollisionError = new GridError('item collision found');

export class Layout {
  public readonly items: Item[] = [];

  get maxHeight(): number {
    return this.items.reduce((result, item) => {
      const h = item.y + item.h;
      return result > h ? result : h;
    }, 0);
  }

  constructor(private cols: number) {
  }

  add(item: Item) {
    const itemOutOfBoundError = new GridError('item out of bound');

    if (item.x < 0) {
      throw itemOutOfBoundError;
    }

    if (item.y < 0) {
      throw itemOutOfBoundError;
    }

    if (item.x + item.w > this.cols) {
      throw itemOutOfBoundError;
    }

    if (this.items.find((it) => it.key === item.key)) {
      throw new GridError('duplicate item key');
    }

    const collisions = this.getCollisions(item);
    if (collisions.length) {
      throw ItemCollisionError;
    }
    this.items.push(item);
  }

  get(key: string): Item {
    const item = this.items.find((item) => item.key === key);
    if (!item) {
      throw new GridError('item not found');
    }
    return item;
  }

  private getCollisions(it: Item) {
    return this.items.filter((item) => item.collide(it));
  }

  move(item: Item) {
    const existing = this.get(item.key);

    const collisions = this.getCollisions(item);
    if (collisions.length) {
      throw new GridError('item collision found');
    }

    existing.x = item.x;
    existing.y = item.y;
  }
}
