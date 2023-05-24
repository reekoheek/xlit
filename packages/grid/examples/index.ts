import { LitElement, html } from 'lit';
import '../src/index';

export class App extends LitElement {
  protected render(): unknown {
    return html`
      <style>
        * {
          box-sizing: border-box;
        }

        x-app {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
        }

        nav {
          padding: 5px;
        }

        main {
          flex: 1;
          position: relative;
        }

        xlit-grid {
          /* border: 20px solid red; */
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          overflow-x: hidden;
          overflow-y: auto;
        }

        .card {
          background-color: blue;
          height: 100%;
          display: flex;
        }

        .card .text {
          color: white;
          margin: auto;
        }
      </style>

      <nav>
        <button>Add</button>
      </nav>
      <main>
        <xlit-grid>
          <div class="card" x="0" y="0" w="4" h="4">
            <span class="text">0</span>
          </div>
          <div class="card">
            <span class="text">1</span>
          </div>
          <div class="card" x="1" y="1">
            <span class="text">2</span>
          </div>
          <div class="card">
            <span class="text">3</span>
          </div>
          <div class="card">
            <span class="text">4</span>
          </div>
        </xlit-grid>
      </main>
    `;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}
customElements.define('x-app', App);
