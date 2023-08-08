import { Context } from './Context.js';

export interface Dispatcher<TState extends object> {
  dispatch(ctx: Context<TState>): Promise<void>;
}
