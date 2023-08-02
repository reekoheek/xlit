import { EventDispatcher } from './EventDispatcher.js';
import { EventStream } from './EventStream.js';

export type EventBus = EventStream & EventDispatcher;
