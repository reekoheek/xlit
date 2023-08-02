import { describe, it, expect } from 'vitest';
import { provide } from './provide.js';
import { Container } from './Container.js';

describe('provide()', () => {
  it('provide as key', () => {
    const container = new Container();

    @provide({ container })
    class Component {
    }

    const component = container.lookup('component');
    expect(component).instanceOf(Component);
  });
});
