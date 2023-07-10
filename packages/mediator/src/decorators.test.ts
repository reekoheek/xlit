import { describe, expect, it } from 'vitest';
import { Mediator } from './Mediator.js';
import { commandHandler, queryHandler } from './decorators.js';

describe('decorators', () => {
  describe('@commandHandler()', () => {
    it('put command handler', async() => {
      const mediator = new Mediator();

      class Foo {
        readonly kind = 'Foo';
      }

      @commandHandler(Foo, mediator)
      class FooHandler {
        static hits: string[] = [];

        handle(): Promise<void> {
          FooHandler.hits.push('hit');
          return Promise.resolve();
        }
      }

      await mediator.send(new Foo());
      expect(FooHandler.hits).toMatchObject(['hit']);
    });
  });

  describe('@queryHandler()', () => {
    it('put query handler', async() => {
      const mediator = new Mediator();

      class Foo {
        readonly kind = 'Foo';
      }

      @queryHandler(Foo, mediator)
      class FooHandler {
        static hits: string[] = [];

        handle(): Promise<string> {
          FooHandler.hits.push('hit');
          return Promise.resolve('result string');
        }
      }

      const result = await mediator.send(new Foo());
      expect(result).toStrictEqual('result string');
      expect(FooHandler.hits).toMatchObject(['hit']);
    });
  });
});
