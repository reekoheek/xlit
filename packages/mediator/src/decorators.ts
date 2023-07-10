import { injected } from '@xlit/di';
import { Mediator } from './Mediator.js';
import { Request } from './Request.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (..._: any[]) => T;

type Command = Request;

interface CommandHandler<TCommand extends Command> {
  handle(command: TCommand): Promise<void>;
}

export function commandHandler(CommandCtr: Constructor<Command>, mediator = Mediator.instance()) {
  return (Handler: Constructor<CommandHandler<Command>>) => {
    mediator.put(CommandCtr, (async() => {
      const handler = new Handler();
      await injected(handler);
      return (req: Request) => handler.handle(req);
    })());
  };
}

type Query = Request;

interface QueryHandler<TQuery extends Query, TResult> {
  handle(command: TQuery): Promise<TResult>;
}

export function queryHandler(QueryCtr: Constructor<Query>, mediator = Mediator.instance()) {
  return (Handler: Constructor<QueryHandler<Query, unknown>>) => {
    mediator.put(QueryCtr, (async() => {
      const handler = new Handler();
      await injected(handler);
      return (req: Request) => handler.handle(req);
    })());
  };
}
