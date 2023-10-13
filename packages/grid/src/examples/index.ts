import { LitElement, html } from 'lit';
import '../index.js';
import './index.css';
import { customElement } from 'lit/decorators.js';

interface Item {
  label: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

function random(start: number, end: number): number {
  const seed = end - start + 1;
  return Math.floor(Math.random() * seed) + start;
}

@customElement('x-app')
export class App extends LitElement {
  nextLabel = 0;
  items: Item[] = [];

  connectedCallback(): void {
    super.connectedCallback();

    for (let i = 0; i < 10; i++) {
      this.items.push(this.generateItem());
    }
  }

  protected render(): unknown {
    return html`
      <nav>
        <button @click="${this.addClicked}">Add</button>
      </nav>
      <main>
        <xlit-grid>
          ${this.items.map((item) => html`
            <div class="card" x="${item.x ?? 0}" y="${item.y ?? 0}" w="${item.w ?? 1}" h="${item.h ?? 1}">
              <span class="text">${item.label}</span>
            </div>
          `)}
        </xlit-grid>
      </main>
    `;
  }

  addClicked(evt: MouseEvent) {
    evt.preventDefault();

    this.items = [
      ...this.items,
      this.generateItem(),
    ];

    this.requestUpdate();
  }

  generateItem() {
    return {
      label: `${this.nextLabel++}`,
      x: random(0, 11),
      y: random(0, 11),
      w: random(1, 4),
      h: random(1, 4),
    };
  }

  protected createRenderRoot() {
    return this;
  }
}
