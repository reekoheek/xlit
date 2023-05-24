import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { Layout } from './Layout.js';
import { Item } from './Item.js';
import { Dimension, Point } from './types.js';

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
  cols = 4;

  @property()
  gutter = 5;

  @property()
  hfactor = 0.5;

  unitDimension!: Dimension;

  @state()
  layout = new Layout(this.cols);

  draggedItem?: Item;
  draggedOffset?: Point;

  connectedCallback() {
    super.connectedCallback();

    this.calculateViewport();

    this.layout = Layout.fromChildren(this.cols, this.children);

    requestAnimationFrame(() => {
      this.calculateContainerHeight();
    });
  }

  calculateContainerHeight() {
    const maxHeight = this.layout.maxHeight;
    this.container.style.height = ((maxHeight * this.unitDimension.h) + ((maxHeight - 1) * this.gutter)) + 'px';
  }

  protected render() {
    return html`
      <div class="container"
        @dragstart="${this.dragStarted}"
        @touchstart="${this.dragStarted}"
        @dragover="${this.dragged}"
        @touchmove="${this.dragged}"
        @drop="${this.dropped}"
        @touchend="${this.dropped}">
        ${repeat(this.layout.items, (item) => item.key, (item) => this.renderItem(item))}
        ${this.renderShadowItem()}
      </div>
    `;
  }

  renderShadowItem() {
    if (this.draggedItem) {
      return html`<div class="shadow-item" style="${this._calculateItemStyle(this.draggedItem)}"></div>`;
    }
  }

  private calculateViewport() {
    const width = this.clientWidth;
    const w = ((width - (this.gutter * (this.cols - 1))) / this.cols);
    const h = (w * this.hfactor);
    this.unitDimension = { w, h };
  }

  renderItem(item: Item) {
    return html`
      <div class="item"
        item-key="${item.key}"
        style="${this._calculateItemStyle(item)}"
        >
        <slot name="${item.key}"></slot>
      </div>
    `;
  }

  private _calculateItemStyle(item: Item) {
    const left = item.x * (this.unitDimension.w + this.gutter);
    const top = item.y * (this.unitDimension.h + this.gutter);
    const width = (this.unitDimension.w * item.w) + ((item.w - 1) * this.gutter);
    const height = (this.unitDimension.h * item.h) + ((item.h - 1) * this.gutter);
    return styleMap({
      width: width + 'px',
      height: height + 'px',
      transform: `translate(${left}px, ${top}px)`,
    });
  }

  dragStarted(evt: DragEvent | TouchEvent) {
    const draggable = evt.composedPath().find((el) => (el as Element).matches('.item[item-key]')) as Element;
    if (!draggable) {
      return;
    }
    if (evt instanceof DragEvent && evt.dataTransfer) {
      evt.dataTransfer.effectAllowed = 'move';
      const img = document.createElement('img');
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      evt.dataTransfer.setDragImage(img, 0, 0);
    }

    const key = draggable.getAttribute('item-key');
    if (!key) {
      return;
    }

    const item = this.layout.get(key);
    this.draggedItem = item;

    const elX = this.draggedItem.x * (this.unitDimension.w + this.gutter);
    const elY = this.draggedItem.y * (this.unitDimension.h + this.gutter);

    const clientX = evt instanceof DragEvent ? evt.clientX : evt.touches[0].clientX;
    const clientY = evt instanceof DragEvent ? evt.clientY : evt.touches[0].clientY;
    this.draggedOffset = {
      x: clientX - elX,
      y: clientY - elY,
    };

    requestAnimationFrame(() => {
      this.requestUpdate();
    });
  }

  dragged(evt: DragEvent | TouchEvent) {
    evt.preventDefault();

    if (!this.draggedItem) {
      return;
    }

    if (!this.draggedOffset) {
      return;
    }

    const clientX = evt instanceof DragEvent ? evt.clientX : evt.touches[0].clientX;
    const clientY = evt instanceof DragEvent ? evt.clientY : evt.touches[0].clientY;

    const unit = this.pxToUnit({
      x: clientX - this.draggedOffset.x,
      y: clientY - this.draggedOffset.y,
    });

    this.layout.move(this.draggedItem, unit.x, unit.y);

    this.requestUpdate();

    requestAnimationFrame(() => {
      this.calculateContainerHeight();
    });
  }

  private pxToUnit(point: Point): Point {
    let x = Math.round(point.x / (this.unitDimension.w + this.gutter));
    if (x < 0) {
      x = 0;
    } else if (x >= this.cols) {
      x = this.cols - 1;
    }
    const y = Math.round(point.y / (this.unitDimension.h + this.gutter));
    return { x, y };
  }

  dropped(evt: DragEvent) {
    evt.preventDefault();
    if (!this.draggedItem) {
      return;
    }

    this.draggedItem = undefined;

    this.requestUpdate();
  }
}
