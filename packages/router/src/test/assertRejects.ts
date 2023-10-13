type AssertedFn = () => Promise<unknown> | NonNullable<unknown> | void;
type Expected = RegExp | string | Error;

class AssertError extends Error {
}

export async function assertRejects(fn: AssertedFn, expected?: Expected) {
  try {
    await fn();

    throw new AssertError('not rejected');
  } catch (err) {
    assertIsNotRejectedError(err);

    if (expected === undefined) {
      return;
    }

    if (err === expected) {
      return;
    }

    if (isExpectedMessage(err, expected)) {
      return;
    }

    if (isExpectedMatched(err, expected)) {
      return;
    }

    throw err;
  }
}

function assertIsNotRejectedError(err: unknown) {
  if (err instanceof AssertError && err.message === 'not rejected') {
    throw err;
  }
}

function isExpectedMessage(e: unknown, expected: Expected) {
  return typeof expected === 'string' && e instanceof Error && e.message === expected;
}

function isExpectedMatched(e: unknown, expected: Expected) {
  return expected instanceof RegExp && e instanceof Error && expected.exec(e.message);
}
