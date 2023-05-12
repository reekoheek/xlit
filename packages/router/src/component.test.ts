import { assert } from '@open-wc/testing';
import { component } from './component';

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
    assert.strictEqual('<x-foo></x-foo>', result.outerHTML);
    assert.strictEqual(true, loaded);
  });
});
