import { describe, it, expect } from 'vitest';
import { component } from './component.js';

describe('component()', () => {
  it('return element if invoked', async() => {
    let loaded = false;
    function load() {
      loaded = true;
      return Promise.resolve();
    }
    const fn = component('x-foo', load);
    const param = {} as Parameters<typeof fn>[0];
    const result = await fn(param);
    expect('<x-foo></x-foo>').toStrictEqual(result.outerHTML);
    expect(true).toStrictEqual(loaded);
  });
});
