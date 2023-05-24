import { GridError } from './GridError.js';
import { Item } from './Item.js';

export class Layout {
  public readonly items: Item[] = [];

  static fromChildren(cols: number, children: HTMLCollection): Layout {
    const items = [...children].map((el, index) => {
      const key = `${index}`;
      el.slot = key;
      el.setAttribute('draggable', 'true');
      const x = Number(el.getAttribute('x')) || 0;
      const y = Number(el.getAttribute('y')) || 0;
      const w = Number(el.getAttribute('w')) || 1;
      const h = Number(el.getAttribute('h')) || 1;
      return new Item(key, { x, y, w, h });
    });
    return new Layout(cols, items);
  }

  get maxHeight() {
    return this.items.reduce((result, item) => {
      const h = item.y + item.h;
      return result > h ? result : h;
    }, 0);
  }

  constructor(private cols: number, items: Item[] = []) {
    items.forEach((item) => {
      let it = item;
      while (true) {
        try {
          this.push(it);
          break;
        } catch (err) {
          it = it.next();
        }
      }
    });
  }

  push(item: Item) {
    const collisions = this.getCollisions(item);
    if (collisions.length) {
      throw new GridError('item collision found');
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

  move(item: Item, x: number, y: number) {
    item.x = x;
    item.y = y;
  }
}
