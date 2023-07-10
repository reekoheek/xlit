import { Injectable } from './Metadata.js';

export function injected<T>(obj: T): Promise<void> {
  const injectable = obj as Injectable;
  if (injectable.__diInjected instanceof Promise === false) {
    return Promise.resolve();
  }

  return injectable.__diInjected;
}
