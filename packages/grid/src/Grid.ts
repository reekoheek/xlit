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
  kind: 'move' | 'resize';
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
        background-color: #eee;
      }

      :host(.grid-move) .container {
        cursor: move;
      }

      :host(.grid-resize) .container {
        cursor: se-resize
      }

      .item {
        position: absolute;
        transition: transform 200ms ease;
        cursor: move;
      }

      .item.dragged {
        transition: none;
        z-index: 999;
      }

      .item-container {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .item-resizer {
        width: 10px;
        height: 10px;
        position: absolute;
        bottom: 5px;
        right: 5px;
        border-bottom: 2px solid grey;
        border-right: 2px solid grey;
        cursor: se-resize;
      }

      .shadow-item {
        position: absolute;
        background-color: red;
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

  @state()
  private containerOffset!: Point;

  @state()
  private unitDimension!: Dimension;

  private mutationObserver!: MutationObserver;
  private resizeObserver!: ResizeObserver;
  // do not make it state coz will be problem in chrome when updating dragstate immediate thanks to chrome bug
  private dragState?: DragState;
  private nextKey = 0;

  get unitGutterDimension(): Dimension {
    return {
      w: this.unitDimension.w + this.gutter,
      h: this.unitDimension.h + this.gutter,
    };
  }

  async connectedCallback() {
    super.connectedCallback();

    // wait for first render
    await new Promise(resolve => requestAnimationFrame(resolve));

    this.calculateViewport();
    this.scan();

    // kick mutation observer after scan manually for the first time
    this.mutationObserver = new MutationObserver(() => {
      if (this.scan().length) {
        this.requestUpdate();
      }
    });
    this.mutationObserver.observe(this, { childList: true });

    this.resizeObserver = new ResizeObserver(() => {
      this.calculateViewport();
    });
    this.resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.mutationObserver.disconnect();
    this.resizeObserver.disconnect();
  }

  scan(): ItemElement[] {
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

    if (elements.length) {
      this.layout.pack();
    }

    return elements;
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

  protected render() {
    const styles = this._calculateContainerStyle();
    return html`
      <div class="container"
        style="${styles}"
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
    let styles = this._calculateItemStyle(item);
    if (this.dragState && this.dragState.item.key === item.key) {
      if (this.dragState.kind === 'move') {
        styles = this._calculatedMoveItemStyle(item);
      } else {
        styles = this._calculatedResizeItemStyle(item);
      }
    }
    return html`
      <div class="item ${this.dragState ? 'dragged' : ''}" style="${styles}">
        <div class="item-container">
          <slot name="${item.key}"></slot>
          <div class="item-resizer" draggable="true" .item="${item}"></div>
        </div>
      </div>
    `;
  }

  private renderShadowItem() {
    if (this.dragState) {
      return html`<div class="shadow-item" style="${this._calculateItemStyle(this.dragState.item)}"></div>`;
    }
  }

  private _calculateContainerStyle() {
    if (!this.container) {
      return styleMap({});
    }

    return styleMap({
      height: ((this.layout.maxHeight * this.unitGutterDimension.h) - this.gutter) + 'px',
    });
  }

  private _calculatedMoveItemStyle(item: Item) {
    if (!this.dragState) {
      return styleMap({});
    }
    const unit = this.unitGutterDimension;
    const left = this.dragState.pointer.x - this.dragState.offset.x;
    const top = this.dragState.pointer.y - this.dragState.offset.y;
    const width = (item.w * unit.w) - this.gutter;
    const height = (item.h * unit.h) - this.gutter;
    return styleMap({
      width: width + 'px',
      height: height + 'px',
      transform: `translate(${left}px, ${top}px)`,
    });
  }

  private _calculatedResizeItemStyle(item: Item) {
    if (!this.dragState) {
      return styleMap({});
    }
    const unit = this.unitGutterDimension;
    const left = item.x * unit.w;
    const top = item.y * unit.h;
    const width = this.dragState.pointer.x - this.containerOffset.x - left + 15;
    const height = this.dragState.pointer.y - this.containerOffset.y - top + 15;
    return styleMap({
      width: width + 'px',
      height: height + 'px',
      transform: `translate(${left}px, ${top}px)`,
    });
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

  private calculateViewport() {
    const { x, y, width } = this.container.getBoundingClientRect();
    const w = ((width - (this.gutter * (this.cols - 1))) / this.cols);
    const h = (w * this.hfactor);
    this.unitDimension = { w, h };
    this.containerOffset = { x, y };
  }

  private async handleDragStarted(evt: DragEvent | TouchEvent) {
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

    const kind = draggable.matches('.item-resizer') ? 'resize' : 'move';

    this.classList.add(kind === 'resize' ? 'grid-resize' : 'grid-move');

    const item = draggable.item;

    const unit = this.unitGutterDimension;
    const elX = item.x * unit.w;
    const elY = item.y * unit.h;

    const pointer = eventPointer(evt);

    const offset = {
      x: pointer.x - elX,
      y: pointer.y - elY,
    };

    this.dragState = { kind, item, offset, pointer };

    await new Promise(resolve => requestAnimationFrame(resolve));
    this.requestUpdate();
  }

  private async handleDragged(evt: DragEvent | TouchEvent) {
    evt.preventDefault();

    if (!this.dragState) {
      return;
    }

    const pointer = eventPointer(evt);
    if (this.dragState.pointer.x === pointer.x && this.dragState.pointer.y === pointer.y) {
      return;
    }

    this.dragState.pointer = pointer;

    this.requestUpdate();
    await new Promise(resolve => requestAnimationFrame(resolve));

    if (this.dragState.kind === 'move') {
      const coord = this.pxToUnit({
        x: pointer.x - this.dragState.offset.x,
        y: pointer.y - this.dragState.offset.y,
      });

      try {
        const item = this.dragState.item.clone();
        item.x = coord.x;
        item.y = coord.y;
        this.layout.move(item);
        this.layout.pack();
      } catch (err) {
        // noop
      }
    } else {
      const coord = this.pxToUnit({
        x: pointer.x - this.containerOffset.x,
        y: pointer.y - this.containerOffset.y,
      });

      try {
        const item = this.dragState.item.clone();
        item.w = (coord.x >= 1 ? coord.x : 1) - item.x;
        item.h = coord.y - item.y;
        this.layout.resize(item);
        this.layout.pack();
      } catch (err) {
        // noop
      }
    }

    await new Promise(resolve => requestAnimationFrame(resolve));
    this.requestUpdate();
  }

  private async handleDropped(evt: DragEvent) {
    evt.preventDefault();
    if (!this.dragState) {
      return;
    }

    this.dragState = undefined;
    this.classList.remove('grid-resize', 'grid-move');

    await new Promise(resolve => requestAnimationFrame(resolve));
    this.requestUpdate();
  }

  private pxToUnit(point: Point): Point {
    const unit = this.unitGutterDimension;
    const x = Math.round(point.x / unit.w);
    const y = Math.round(point.y / unit.h);
    return { x, y };
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
