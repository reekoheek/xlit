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

interface WithLength {
  length: number;
}

function isWithLength (v: unknown): v is WithLength {
  const val = v as WithLength;
  return typeof val.length === 'number';
}

export function minLength (n: number) {
  return (v: unknown): unknown => {
    if (isNone(v)) {
      return v;
    }
    if (!isWithLength(v)) {
      throw new Error(`length must greater or equal than ${n}`);
    }
    if (v.length < n) {
      throw new Error(`length must greater or equal than ${n}`);
    }
    return v;
  };
}

export function maxLength (n: number) {
  return (v: unknown): unknown => {
    if (isNone(v)) {
      return v;
    }
    if (!isWithLength(v)) {
      throw new Error(`length must lower or equal than ${n}`);
    }
    if (v.length > n) {
      throw new Error(`length must lower or equal than ${n}`);
    }
    return v;
  };
}

export function min (n: number) {
  return (v: unknown): unknown => {
    if (isNone(v)) {
      return v;
    }
    if (v as number < n) {
      throw new Error(`must greater or equal than ${n}`);
    }
    return v;
  };
}

export function max (n: number) {
  return (v: unknown): unknown => {
    if (isNone(v)) {
      return v;
    }
    if (v as number > n) {
      throw new Error(`must lower or equal than ${n}`);
    }
    return v;
  };
}

export function between (a: number, b: number) {
  return (v: unknown): unknown => {
    if (isNone(v)) {
      return v;
    }
    const val = v as number;
    if (val < a || val > b) {
      throw new Error(`must between ${a} and ${b}`);
    }
    return v;
  };
}

function isNone (v: unknown): boolean {
  return v === undefined || v === null || v === '';
}
