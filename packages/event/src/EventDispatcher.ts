import { Event } from './Event.js';

export interface EventDispatcher {
  dispatchEvent(evt: Event): void;
}
