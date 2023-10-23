import { Middleware } from '@xlit/router';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

const FOCUS_DELAY = 700;

@customElement('xlit-a11y-menu')
export class A11yMenu extends LitElement {
  private firstRun = true;
  private mainEl!: HTMLElement;

  @query('.a11y-reset-btn')
  private resetBtn!: HTMLElement;

  @property()
  declare label: string;

  @property()
  declare btnclass: string;

  constructor() {
    super();
    this.label = 'Skip to main content';
    this.btnclass = '';
  }

  connectedCallback(): void {
    super.connectedCallback();

    const mainEl = document.querySelector('main');
    if (!mainEl) throw new Error('no main element');
    mainEl.id = 'main';
    mainEl.tabIndex = -1;
    this.mainEl = mainEl;
  }

  protected render(): unknown {
    return html`
      <style>
        .a11y-reset-btn {
          position: fixed;
          top: -100px;
        }

        .a11y-menu-group {
          position: fixed;
          top: 0;
          right: 0;
          margin: 1rem;
          z-index: 9999;
        }

        .a11y-menu-group:not(:focus):not(:focus-within) {
          width: 1px !important;
          height: 1px !important;
          padding: 0px !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0px, 0px, 0px, 0px) !important;
          white-space: nowrap !important;
          border: 0px !important;
        }

        .a11y-menu-group:not(:focus):not(:focus-within):not(caption) {
          position: absolute !important;
        }
      </style>
      <a class="a11y-reset-btn"
        href="javascript:void(0)"
        tabindex="-1" aria-hidden="true"
      ></a>
      <div class="a11y-menu-group">
        <a href="#main"
          class="${this.btnclass}"
          @click="${this.skipToMainBtnClicked}"
          >
          ${this.label}
        </a>
      </div>
    `;
  }

  private skipToMainBtnClicked() {
    this.mainEl.focus();
  }

  middleware(): Middleware<object> {
    return async(ctx, next) => {
      await next();
      if (this.firstRun) {
        this.firstRun = false;
        return;
      }
      setTimeout(() => {
        this.resetBtn.focus();
      }, FOCUS_DELAY);
    };
  }

  protected createRenderRoot() {
    return this;
  }
}
