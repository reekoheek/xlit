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

export function minLength (n: number) {
  return (v: string): string => {
    if (isNone(v)) {
      return v;
    }
    if (v.length < n) {
      throw new Error(`length must greater or equal than ${n}`);
    }
    return v;
  };
}

export function maxLength (n: number) {
  return (v: string): string => {
    if (isNone(v)) {
      return v;
    }
    if (v.length > n) {
      throw new Error(`length must lower or equal than ${n}`);
    }
    return v;
  };
}

export function min (n: number) {
  return (v: number): unknown => {
    if (isNone(v)) {
      return v;
    }
    if (v < n) {
      throw new Error(`must greater or equal than ${n}`);
    }
    return v;
  };
}

export function max (n: number) {
  return (v: number): unknown => {
    if (isNone(v)) {
      return v;
    }
    if (v > n) {
      throw new Error(`must lower or equal than ${n}`);
    }
    return v;
  };
}

export function between (a: number, b: number) {
  return (v: number): unknown => {
    if (isNone(v)) {
      return v;
    }
    if (v < a || v > b) {
      throw new Error(`must between ${a} and ${b}`);
    }
    return v;
  };
}
function isNone (v: unknown): boolean {
  return v === undefined || v === null || v === '';
}
