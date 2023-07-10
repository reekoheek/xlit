import { Event } from './Event.js';
import { EventHandler } from './EventHandler.js';

export interface EventDispatcher {
  dispatchEvent(evt: Event): void;
}

export class DefaultEventDispatcher implements EventDispatcher {
  constructor(private handlers: EventHandler[] = []) {
  }

  dispatchEvent(evt: Event): void {
    this.handlers.forEach((handler) => handler(evt));
  }

  add(handler: EventHandler): this {
    this.handlers.push(handler);
    return this;
  }
}
