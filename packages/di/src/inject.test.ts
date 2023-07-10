import { describe, it, expect } from 'vitest';
import { Container } from './Container.js';
import { instance } from './instance.js';
import { injected } from './injected.js';
import { inject } from './inject.js';
import { lookup } from './lookup.js';
import { provide } from './provide.js';

describe('inject()', () => {
  it('inject lookups', async() => {
    const container = new Container()
      .provide('foo', instance('foo'))
      .provide('bar', instance('bar'));

    @inject(container)
    class Component {
      @lookup()
      foo!: string;

      @lookup()
      bar!: string;
    }

    const component = new Component();
    await injected(component);
    expect(component.foo).toStrictEqual('foo');
    expect(component.bar).toStrictEqual('bar');
  });

  it('inject provides', async() => {
    const container = new Container();

    @inject(container)
    class Component {
      @provide()
      foo = 'foo';

      @provide()
      bar = 'bar';
    }

    const component = new Component();
    await injected(component);
    expect(component.foo).toStrictEqual('foo');
    expect(component.bar).toStrictEqual('bar');
  });

  it('inject provide class', async() => {
    const container = new Container();

    @inject(container)
    @provide()
    class Component {
    }

    const component: Component = await container.lookup('component');
    expect(component).instanceOf(Component);
  });

  it('inject provide class with transient scope', async() => {
    const container = new Container();

    @inject(container)
    @provide({ scope: 'transient' })
    class Component {
    }

    const component1: Component = await container.lookup('component');
    const component2: Component = await container.lookup('component');
    expect(component1).toStrictEqual(component2);
  });

  it('throw error if nothing to inject', () => {
    const container = new Container();
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      @inject(container) class Component {
      }
    }).toThrow(/nothing to inject/);
  });

  it('lookup from inherited object', async() => {
    const container = new Container()
      .provide('foo', instance('foo'))
      .provide('bar', instance('bar'));

    class Parent {
      @lookup()
      foo!: string;
    }

    @inject(container)
    class Child extends Parent {
      @lookup()
      bar!: string;
    }

    const child = new Child();
    await injected(child);

    expect(child.foo).toStrictEqual('foo');
    expect(child.bar).toStrictEqual('bar');
  });

  it('throw error if provide from parent', () => {
    const container = new Container();

    class Parent {
      @provide()
      foo = 'foo';
    }

    expect(() => {
      @inject(container)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Child extends Parent {
      }
    }).toThrow(/provide must be immediately injected/);
  });

  it('throw error if provide class from parent', () => {
    const container = new Container();

    @provide()
    class Parent {
      foo = 'foo';
    }

    expect(() => {
      @inject(container)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Child extends Parent {
      }
    }).toThrow(/provide class must be immediately injected/);
  });
});
