import { DIError } from './DIError.js';
import { Injectable } from './Metadata.js';

export function injected(obj: object) {
  const injectable = obj as Injectable;
  if (!injectable.__diInjected) {
    throw new DIError('object is not injected');
  }

  return injectable.__diInjected;
}
