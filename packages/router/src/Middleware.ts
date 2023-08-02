import { Context } from './Context.js';

type Next = () => Promise<void>;

export type Middleware<TState extends object> = (ctx: Context<TState>, next: Next) => Promise<void>;
