import { describe, it, expect } from 'vitest';
import { singleton } from './singleton.js';

describe('singleton()', () => {
  it('generate singleton provider', () => {
    let i = 0;
    const fn = singleton(() => i++);
    expect(fn()).toStrictEqual(0);
    expect(fn()).toStrictEqual(0);
  });
});
