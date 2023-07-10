import { describe, it, expect } from 'vitest';
import { singleton } from './singleton.js';
import { Container } from './Container.js';

describe('singleton()', () => {
  it('generate singleton provider', () => {
    let i = 0;
    const fn = singleton(() => i++);
    expect(fn(new Container())).toStrictEqual(0);
    expect(fn(new Container())).toStrictEqual(0);
  });
});
