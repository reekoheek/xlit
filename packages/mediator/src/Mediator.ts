import { MediatorError } from './MediatorError.js';
import { Request } from './Request.js';
import { RequestHandler } from './RequestHandler.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (..._: any[]) => T;

type Promised<T = object> = Promise<T> | T;

export class Mediator {
  static instance() {
    if (!instance) {
      instance = new Mediator();
    }
    return instance;
  }

  static reset() {
    instance = undefined;
  }

  private handlers = new Map<string, Promised<RequestHandler<Request, unknown>>>();

  async send<TRequest extends Request, TResult>(req: TRequest): Promise<TResult> {
    const handle = await this.get<TRequest, TResult>(req);

    return handle(req);
  }

  private async get<TRequest extends Request, TResult>(req: TRequest): Promise<RequestHandler<TRequest, TResult>> {
    const handler = await this.handlers.get(req.kind);
    if (handler) {
      return handler as RequestHandler<TRequest, TResult>;
    }

    throw new MediatorError('handler not found: ' + req.kind);
  }

  put<TRequest extends Request, TResult>(
    Request: Constructor<TRequest>,
    handler: Promised<RequestHandler<TRequest, TResult>>,
  ): this {
    const kind = new Request().kind;
    this.handlers.set(kind, handler as Promised<RequestHandler<Request, unknown>>);
    return this;
  }
}

let instance: Mediator | undefined;
