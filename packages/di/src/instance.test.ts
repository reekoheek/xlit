import { describe, it, expect } from 'vitest';
import { instance } from './instance.js';
import { Container } from './Container.js';

describe('instance()', () => {
  it('generate provider to instance', async() => {
    const fn = instance('foo');
    expect(await fn(new Container())).toStrictEqual('foo');
  });
});
