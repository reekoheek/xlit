import { GridError, GridItemCollisionError } from './GridError.js';
import { Item } from './Item.js';

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
    this.assertItemOutOfBound(item);
    this.assertDuplicateItem(item);
    this.assertCollisionFound(item);


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

    this.assertItemOutOfBound(item);
    this.assertCollisionFound(item);

    existing.x = item.x;
    existing.y = item.y;
  }

  assertItemOutOfBound(item: Item) {
    if (item.x < 0) {
      throw new GridError('item out of bound');
    }

    if (item.y < 0) {
      throw new GridError('item out of bound');
    }

    if (item.x + item.w > this.cols) {
      throw new GridError('item out of bound');
    }
  }

  assertDuplicateItem(item: Item) {
    if (this.items.find((it) => it.key === item.key)) {
      throw new GridError('duplicate item key');
    }
  }

  assertCollisionFound(item: Item) {
    const collisions = this.getCollisions(item);
    if (collisions.length) {
      throw new GridItemCollisionError('item collision found');
    }
  }
}
