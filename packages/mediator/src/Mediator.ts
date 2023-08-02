import { MediatorError } from './MediatorError.js';
import { Request } from './Request.js';
import { RequestHandler } from './RequestHandler.js';

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

  private handlers = new Map<string, RequestHandler<Request, unknown>>();

  send<TRequest extends Request, TResult>(req: TRequest): Promise<TResult> {
    const handle = this.get<TRequest, TResult>(req);

    return handle(req);
  }

  private get<TRequest extends Request, TResult>(req: TRequest): RequestHandler<TRequest, TResult> {
    const handler = this.handlers.get(req.kind);
    if (handler) {
      return handler as RequestHandler<TRequest, TResult>;
    }

    throw new MediatorError('handler not found: ' + req.kind);
  }

  put<TRequest extends Request, TResult>(kind: string, handler: RequestHandler<TRequest, TResult>): this {
    this.handlers.set(kind, handler as RequestHandler<Request, unknown>);
    return this;
  }
}

let instance: Mediator | undefined;
