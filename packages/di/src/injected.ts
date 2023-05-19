import { DIError } from './DIError.js';
import { Injectable } from './Injectable.js';

function isInjectable(o: unknown): o is Injectable {
  return (o as Injectable).__diInjected !== undefined;
}

export function injected(obj: unknown): Promise<unknown> {
  if (!isInjectable(obj)) {
    throw new DIError('object is not injectable');
  }

  return obj.__diInjected;
}
