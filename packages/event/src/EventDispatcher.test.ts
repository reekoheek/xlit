import { describe, expect, it } from 'vitest';
import { DefaultEventDispatcher } from './EventDispatcher.js';

describe('DefaultEventDispatcher', () => {
  describe('#add()', () => {
    it('add handler', () => {
      const dispatcher = new DefaultEventDispatcher();
      const handler = () => undefined;
      const retval = dispatcher.add(handler);
      expect(retval).toStrictEqual(dispatcher);
      expect(dispatcher['handlers']).toMatchObject([handler]);
    });
  });

  describe('#dispatchEvent()', () => {
    it('run handler', () => {
      const hits: string[] = [];
      const dispatcher = new DefaultEventDispatcher([
        (evt) => hits.push('hit:' + evt.kind),
      ]);

      dispatcher.dispatchEvent({ kind: 'Foo', at: new Date() });
      dispatcher.dispatchEvent({ kind: 'Bar', at: new Date() });
      expect(hits).toMatchObject(['hit:Foo', 'hit:Bar']);
    });
  });
});
