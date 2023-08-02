import { EventHandler } from './EventHandler.js';

export interface EventStream {
  addHandler(handler: EventHandler): this;
}
