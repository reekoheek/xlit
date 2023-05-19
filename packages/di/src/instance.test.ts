import { assert } from '@open-wc/testing';
import { instance } from './instance';
import { Container } from './Container';

describe('instance()', () => {
  it('generate provider to instance', async() => {
    const fn = instance('foo');
    assert.strictEqual('foo', await fn(new Container()));
  });
});
