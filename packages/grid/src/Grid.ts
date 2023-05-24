import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { Layout } from './Layout.js';
import { Item } from './Item.js';
import { Dimension, Point, Rect } from './types.js';
import { GridError, GridItemCollisionError } from './GridError.js';

interface ItemElement extends Element {
  item: Item;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface DragState {
  item: Item;
  offset: Point;
  pointer: Point;
}

@customElement('xlit-grid')
export class Grid extends LitElement {
  static styles = [
    css`
      * {
        box-sizing: border-box;
      }

      .container {
        position: relative;
      }

      .item {
        position: absolute;
        transition: transform 200ms ease;
      }

      .shadow-item {
        position: absolute;
        background-color: grey;
        opacity: 0.5;
        transition: transform 200ms ease;
      }
    `,
  ];

  @query('.container')
  container!: HTMLElement;

  @property()
  cols = 12;

  @property()
  gutter = 5;

  @property()
  hfactor = 0.5;

  @state()
  layout = new Layout(this.cols);

  private mutationObserver!: MutationObserver;
  private resizeObserver!: ResizeObserver;
  // do not make it state coz will be problem in chrome when updating dragstate immediate thanks to chrome bug
  private dragState?: DragState;
  private nextKey = 0;
  private unitDimension!: Dimension;

  get unitGutterDimension(): Dimension {
    return {
      w: this.unitDimension.w + this.gutter,
      h: this.unitDimension.h + this.gutter,
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.calculateViewport();

    this.layout = new Layout(this.cols);
    this.scan();

    // kick mutation observer after scan manually for the first time
    this.mutationObserver = new MutationObserver(() => {
      if (this.scan()) {
        this.requestUpdate();
      }
    });
    this.mutationObserver.observe(this, { childList: true });

    let debounceT = 0;
    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(debounceT);
      debounceT = setTimeout(() => {
        this.calculateViewport();
        this.requestUpdate();
        requestAnimationFrame(() => {
          this.calculateContainerHeight();
        });
      }, 300);
    });
    this.resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.mutationObserver.disconnect();
    this.resizeObserver.disconnect();
  }

  scan(): boolean {
    const elements = ([...this.children] as ItemElement[]).filter((el) => {
      if (el.item) {
        return false;
      }

      const key = `${this.nextKey++}`;
      el.slot = key;
      el.setAttribute('draggable', 'true');

      const rect = this.readRectFromItemElement(el);
      const retryCount = 50;
      let item = new Item(key, rect);
      let retries = 0;
      while (retries++ < retryCount) {
        try {
          this.layout.add(item);
          el.item = item;
          return true;
        } catch (err) {
          if (err instanceof GridItemCollisionError) {
            item = item.clone();
            item.y = item.y + 1;
            continue;
          }
          throw err;
        }
      }
      throw new GridError(`try positioning item with no luck after ${retryCount} tries`);
    });

    return Boolean(elements.length);
  }

  private readRectFromItemElement(el: ItemElement): Rect {
    let x = el.x ?? (Number(el.getAttribute('x')) || 0);
    const y = el.y ?? (Number(el.getAttribute('y')) || 0);
    const w = el.w ?? (Number(el.getAttribute('w')) || 1);
    const h = el.h ?? (Number(el.getAttribute('h')) || 1);

    if (x + w > this.cols) {
      x = this.cols - w;
    }

    return { x, y, w, h };
  }

  private calculateContainerHeight() {
    const maxHeight = this.layout.maxHeight;
    this.container.style.height = ((maxHeight * this.unitDimension.h) + ((maxHeight - 1) * this.gutter)) + 'px';
  }

  protected render() {
    return html`
      <div class="container"
        @dragstart="${this.handleDragStarted}"
        @touchstart="${this.handleDragStarted}"
        @dragover="${this.handleDragged}"
        @touchmove="${this.handleDragged}"
        @dragend="${this.handleDropped}"
        @touchend="${this.handleDropped}">
        ${repeat(this.layout.items, (item) => item.key, (item) => this.renderItem(item))}
        ${this.renderShadowItem()}
      </div>
    `;
  }

  private renderItem(item: Item) {
    return html`<div class="item" style="${this._calculateItemStyle(item)}"><slot name="${item.key}"></slot></div>`;
  }

  private renderShadowItem() {
    if (this.dragState) {
      return html`<div class="shadow-item" style="${this._calculateItemStyle(this.dragState.item)}"></div>`;
    }
  }

  private calculateViewport() {
    const width = this.clientWidth;
    const w = ((width - (this.gutter * (this.cols - 1))) / this.cols);
    const h = (w * this.hfactor);
    this.unitDimension = { w, h };
  }

  private _calculateItemStyle(item: Item) {
    const unit = this.unitGutterDimension;
    const left = item.x * unit.w;
    const top = item.y * unit.h;
    const width = (item.w * unit.w) - this.gutter;
    const height = (item.h * unit.h) - this.gutter;
    return styleMap({
      width: width + 'px',
      height: height + 'px',
      transform: `translate(${left}px, ${top}px)`,
    });
  }

  private handleDragStarted(evt: DragEvent | TouchEvent) {
    const draggable = evt.composedPath()[0] as ItemElement;
    if (!draggable?.item) {
      return;
    }

    if (evt instanceof DragEvent && evt.dataTransfer) {
      evt.dataTransfer.effectAllowed = 'move';
      const img = document.createElement('img');
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      evt.dataTransfer.setDragImage(img, 0, 0);
    }

    const item = this.layout.get(draggable.item.key);

    const unit = this.unitGutterDimension;
    const elX = item.x * unit.w;
    const elY = item.y * unit.h;

    const pointer = eventPointer(evt);

    const offset = {
      x: pointer.x - elX,
      y: pointer.y - elY,
    };

    this.dragState = { item, offset, pointer };

    requestAnimationFrame(() => {
      this.requestUpdate();
    });
  }

  private handleDragged(evt: DragEvent | TouchEvent) {
    evt.preventDefault();

    if (!this.dragState) {
      return;
    }

    const pointer = eventPointer(evt);
    if (this.dragState.pointer.x === pointer.x && this.dragState.pointer.y === pointer.y) {
      return;
    }

    this.dragState.pointer = pointer;

    const coord = this.pxToUnit({
      x: pointer.x - this.dragState.offset.x,
      y: pointer.y - this.dragState.offset.y,
    });

    try {
      const item = this.dragState.item.clone();
      item.x = coord.x;
      item.y = coord.y;
      this.layout.move(item);
      this.requestUpdate();
      requestAnimationFrame(() => {
        this.calculateContainerHeight();
      });
    } catch (err) {
      // noop
    }
  }

  private pxToUnit(point: Point): Point {
    const unit = this.unitGutterDimension;
    let x = Math.round(point.x / unit.w);
    if (x < 0) {
      x = 0;
    } else if (x >= this.cols) {
      x = this.cols - 1;
    }
    const y = Math.round(point.y / unit.h);
    return { x, y };
  }

  private handleDropped(evt: DragEvent) {
    evt.preventDefault();
    if (!this.dragState) {
      return;
    }

    this.dragState = undefined;

    requestAnimationFrame(() => {
      this.requestUpdate();
    });
  }
}

function eventPointer(evt: DragEvent | TouchEvent): Point {
  if (evt instanceof DragEvent) {
    return {
      x: evt.clientX,
      y: evt.clientY,
    };
  }

  return {
    x: evt.touches[0].clientX,
    y: evt.touches[0].clientY,
  };
}
