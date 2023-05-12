import { assertRejects } from './assertRejects.js';

describe('assertRejects()', () => {
  it('fail if no error', async() => {
    await assertNoErr(() => assertRejects(() => Promise.resolve()));
    const err = new Error('some err');
    await assertRejects(() => { throw err; });
    await assertRejects(() => { throw err; }, err);
    await assertRejects(() => { throw err; }, 'some err');
    await assertRejects(() => { throw err; }, /some err/);
    await assertNoErr(() => assertRejects(() => { throw err; }, 'not found'));
  });
});

async function assertNoErr(fn: () => Promise<unknown>) {
  try {
    await fn();
    throw new Error('ouch: unexpected error');
  } catch (err) {
    if (err instanceof Error && err.message === 'ouch: unexpected error') {
      throw err;
    }
  }
}
