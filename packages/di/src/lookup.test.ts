import { describe, it, expect } from 'vitest';
import { lookup } from './lookup.js';
import { Container } from './Container.js';

describe('lookup()', () => {
  it('define getter', () => {
    const container = new Container().provide('foo', () => 'foo');
    class Component {
      @lookup({ container })
      foo!: string;
    }
    const component = new Component();
    expect(component.foo).toStrictEqual('foo');
  });
});
