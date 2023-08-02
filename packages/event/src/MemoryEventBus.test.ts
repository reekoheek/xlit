import { describe, expect, it } from 'vitest';
import { MemoryEventBus } from './MemoryEventBus.js';

describe('MemoryEventBus', () => {
  describe('#addHandler()', () => {
    it('add handler', () => {
      const bus = new MemoryEventBus();
      const handler = () => undefined;
      const retval = bus.addHandler(handler);
      expect(retval).toStrictEqual(bus);
      expect(bus['handlers']).toMatchObject([handler]);
    });
  });

  describe('#dispatchEvent()', () => {
    it('run handler', () => {
      const hits: string[] = [];
      const bus = new MemoryEventBus();
      bus.addHandler((evt) => hits.push('hit:' + evt.kind));

      bus.dispatchEvent({ kind: 'Foo', at: new Date() });
      bus.dispatchEvent({ kind: 'Bar', at: new Date() });
      expect(hits).toMatchObject(['hit:Foo', 'hit:Bar']);
    });
  });
});
