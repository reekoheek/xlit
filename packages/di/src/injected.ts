import { DIError } from './DIError.js';
import { Injectable } from './Metadata.js';

export function injected<T>(obj: T): Promise<T> {
  const injectable = obj as Injectable<T>;
  if (injectable.__diInjected instanceof Promise === false) {
    throw new DIError('object is not injected');
  }

  return injectable.__diInjected;
}
