export function trim (v: unknown): unknown {
  if (isNone(v)) {
    return v;
  }

  if (typeof v === 'string') {
    return v.trim();
  }

  return `${v}`;
}

export function required (v: unknown): unknown {
  if (isNone(v)) {
    throw new Error('required');
  }

  return v;
}

function isNone (v: unknown): boolean {
  return v === undefined || v === null || v === '';
}
