import { Event } from './Event.js';
import { EventHandler } from './EventHandler.js';
import { EventBus } from './EventBus.js';

export class MemoryEventBus implements EventBus {
  private handlers: EventHandler[] = [];

  addHandler(handler: EventHandler): this {
    this.handlers.push(handler);
    return this;
  }

  dispatchEvent(evt: Event): void {
    this.handlers.forEach((handler) => handler(evt));
  }
}
