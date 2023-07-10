import { Request } from './Request.js';

export type RequestHandler<TRequest extends Request, TResult> = (req: TRequest) => Promise<TResult>;
