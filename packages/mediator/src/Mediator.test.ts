import { beforeEach, describe, expect, it } from 'vitest';
import { Mediator } from './Mediator.js';
import { Request } from './Request.js';

class Foo implements Request {
  kind = 'Foo';
}

describe('Mediator', () => {
  beforeEach(() => {
    Mediator.reset();
  });

  describe('.instance()', () => {
    it('return singleton mediator', () => {
      const mediator1 = Mediator.instance();
      const mediator2 = Mediator.instance();
      expect(mediator1).toStrictEqual(mediator2);
    });
  });

  describe('#putRequestHandler()', () => {
    it('put handler', async() => {
      const handler = () => Promise.resolve();
      const mediator = new Mediator();
      mediator.put(Foo, handler);
      expect(await mediator['handlers'].get('Foo')).toStrictEqual(handler);
    });
  });

  describe('#send()', () => {
    it('run handler', async() => {
      const mediator = new Mediator();

      const hits: string[] = [];
      mediator['handlers'].set('Foo', (req) => {
        hits.push('hit:' + req.kind);
        return Promise.resolve();
      });

      await mediator.send(new Foo());
      expect(hits).toMatchObject(['hit:Foo']);

      expect(async() => await mediator.send({ kind: 'Bar' })).rejects.toThrow(/handler not found: Bar/);
    });
  });
});
