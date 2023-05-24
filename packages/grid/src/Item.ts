import { Rect } from './types.js';

let nextId = 0;

export class Item implements Rect {
  static nextId() {
    return `${nextId++}`;
  }

  public x: number;
  public y: number;
  public w: number;
  public h: number;

  constructor(public readonly key: string, { x = 0, y = 0, w = 1, h = 1 }: Partial<Rect> = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  next(): Item {
    return new Item(this.key, {
      ...this,
      y: this.y + 1,
    });
  }

  clone(): Item {
    return new Item(this.key, this);
  }

  collide(item: Item): boolean {
    if (this.key === item.key) {
      return false;
    }

    return (this.x + this.w > item.x &&
      this.x < item.x + item.w &&
      this.y + this.h > item.y &&
      this.y < item.y + item.h
    );
  }
}
