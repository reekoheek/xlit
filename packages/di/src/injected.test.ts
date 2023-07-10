import { describe, it, expect } from 'vitest';
import { injected } from './injected.js';

describe('injected()', () => {
  it('return promise', () => {
    expect(injected({ __diInjected: Promise.resolve() })).instanceOf(Promise);
  });
});
