import { describe, it, expect } from 'vitest';
import { instance } from './instance.js';

describe('instance()', () => {
  it('generate provider to instance', () => {
    const fn = instance('foo');
    expect(fn()).toStrictEqual('foo');
  });
});
