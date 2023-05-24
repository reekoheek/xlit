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

  shiftOthersOnCollision(item: Item) {
    const collisions = this.getCollisions(item);
    if (collisions.length) {
      collisions.forEach(shiftedItem => {
        const clone = shiftedItem.clone();
        clone.y = item.y + item.h;
        this.move(clone);
      });
    }
  }

  move(item: Item) {
    const existing = this.get(item.key);

    this.assertItemOutOfBound(item);
    this.shiftOthersOnCollision(item);

    existing.x = item.x;
    existing.y = item.y;
  }

  resize(item: Item) {
    const existing = this.get(item.key);

    this.assertItemOutOfBound(item);
    this.shiftOthersOnCollision(item);

    existing.w = item.w;
    existing.h = item.h;
  }

  getMaxHeightAbove(inspected: Item): number {
    return this.items.reduce((result, item) => {
      if (item.y >= inspected.y) {
        return result;
      }

      if (item.x + item.w <= inspected.x) {
        return result;
      }

      if (item.x >= inspected.x + inspected.w) {
        return result;
      }

      const h = item.y + item.h;
      return result > h ? result : h;
    }, 0);
  }

  pack() {
    const items = this.sortedItems();
    items.forEach((item) => {
      item.y = this.getMaxHeightAbove(item);
    });
  }

  private sortedItems() {
    return this.items.slice(0).sort((a, b) => {
      if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
        return 1;
      } else if (a.y === b.y && a.x === b.x) {
        // Without this, we can get different sort results in IE vs. Chrome/FF
        return 0;
      }
      return -1;
    });
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
