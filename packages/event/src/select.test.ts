import { select } from './select.js';
import { describe, it, expect } from 'vitest';

describe('select()', () => {
  it('run only match events by its name', () => {
    const hits: string[] = [];
    const handle = select('Fooed', (evt) => hits.push(evt.kind));
    handle(new MockEvent('Fooed'));
    handle(new MockEvent('Barred'));
    handle(new MockEvent('Bazzed'));

    expect(hits).toMatchObject(['Fooed']);
  });

  it('run only match events by regexp', () => {
    const hits: string[] = [];
    const handle = select(/^Ba.+d$/, (evt) => hits.push(evt.kind));
    handle(new MockEvent('Fooed'));
    handle(new MockEvent('Barred'));
    handle(new MockEvent('Bazzed'));

    expect(hits).toMatchObject(['Barred', 'Bazzed']);
  });

  it('run only match events by function', () => {
    const hits: string[] = [];
    const handle = select((evt) => evt.kind.endsWith('ed'), (evt) => hits.push(evt.kind));
    handle(new MockEvent('Fooed'));
    handle(new MockEvent('Barred'));
    handle(new MockEvent('Bazzed'));

    expect(hits).toMatchObject(['Fooed', 'Barred', 'Bazzed']);
  });
});

class MockEvent {
  constructor(readonly kind: string, readonly at = new Date()) {
  }
}
