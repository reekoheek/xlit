import { Container } from './Container';
import { instance } from './instance';
import { injected } from './injected';
import { inject } from './inject';
import { lookup } from './lookup';
import { assert } from '@open-wc/testing';
import { provide } from './provide';

describe('inject()', () => {
  it('inject lookups', async() => {
    const container = new Container({
      foo: instance('foo'),
      bar: instance('bar'),
    });

    @inject(container)
    class Component {
      @lookup()
      foo!: string;

      @lookup()
      bar!: string;
    }

    const component = new Component();
    await injected(component);
    assert.strictEqual(component.foo, 'foo');
    assert.strictEqual(component.bar, 'bar');
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
    assert.strictEqual(component.foo, 'foo');
    assert.strictEqual(component.bar, 'bar');
  });

  it('inject provide class', async() => {
    const container = new Container();

    @inject(container)
    @provide()
    class Component {
    }

    const component: Component = await container.lookup('component');
    assert.strictEqual(component instanceof Component, true);
  });

  it('inject provide class with transient scope', async() => {
    const container = new Container();

    @inject(container)
    @provide({ scope: 'transient' })
    class Component {
    }

    const component1: Component = await container.lookup('component');
    const component2: Component = await container.lookup('component');
    assert.notStrictEqual(component1, component2);
  });

  it('throw error if nothing to inject', () => {
    const container = new Container();

    assert.throws(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      @inject(container) class Component {
      }
    }, /nothing to inject/);
  });

  it('lookup from inherited object', async() => {
    const container = new Container({
      foo: instance('foo'),
      bar: instance('bar'),
    });

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

    assert.strictEqual(child.foo, 'foo');
    assert.strictEqual(child.bar, 'bar');
  });

  it('throw error if provide from parent', () => {
    const container = new Container();

    class Parent {
      @provide()
      foo = 'foo';
    }

    assert.throws(() => {
      @inject(container)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Child extends Parent {
      }
    }, /provide must be immediately injected/);
  });

  it('throw error if provide class from parent', () => {
    const container = new Container();

    @provide()
    class Parent {
      foo = 'foo';
    }

    assert.throws(() => {
      @inject(container)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Child extends Parent {
      }
    }, /provide class must be immediately injected/);
  });
});
