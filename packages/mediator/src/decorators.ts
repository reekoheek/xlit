import { Mediator } from './Mediator.js';
import { Request } from './Request.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

type Command = Request;

interface CommandHandler<TCommand extends Command> {
  handle(command: TCommand): Promise<void>;
}

export function commandHandler(kind: string, mediator = Mediator.instance()) {
  return (Handler: Constructor<CommandHandler<Command>>) => {
    mediator.put(kind, (() => {
      const handler = new Handler();
      return (req: Request) => handler.handle(req);
    })());
  };
}

type Query = Request;

interface QueryHandler<TQuery extends Query, TResult> {
  handle(command: TQuery): Promise<TResult>;
}

export function queryHandler(kind: string, mediator = Mediator.instance()) {
  return (Handler: Constructor<QueryHandler<Query, unknown>>) => {
    mediator.put(kind, (() => {
      const handler = new Handler();
      return (req: Request) => handler.handle(req);
    })());
  };
}
